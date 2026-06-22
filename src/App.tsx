import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import {
  ChefHat,
  Home,
  MessageSquare,
  BookOpen,
  Settings,
  ShieldAlert,
  LogOut,
  RefreshCw,
  Users,
  Calendar,
  X
} from 'lucide-react';
import { Task, Language, Role, Recipe, RecipeStep, FamilyMember, ChatMessage, Review, Invitation, Connection, TaskStatus } from './types';
import { LaunchPage } from './components/LaunchPage';
import { EmployerDashboard } from './components/EmployerDashboard';
import { RecipePlanner } from './components/RecipePlanner';
import { HealthProfilePage } from './components/HealthProfilePage';
import { HelperDashboard } from './components/HelperDashboard';
import { RecipeLibraryPage } from './components/RecipeLibraryPage';
import { TaskExecutionPage } from './components/TaskExecutionPage';
import { ResultUploadPage } from './components/ResultUploadPage';
import { ChatPage } from './components/ChatPage';
import { FeedbackSettingsPage } from './components/FeedbackSettingsPage';
import { LoginPage } from './components/LoginPage';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  updateDoc, 
  doc, 
  getDocs, 
  where,
  Timestamp,
  serverTimestamp,
  getDoc,
  deleteField,
  deleteDoc
} from "firebase/firestore";
import { RECIPES } from './recipesData';
import { seedDatabase } from './seedDatabase';
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [likedRecipeIds, setLikedRecipeIds] = useState<string[]>([]);
  const [customFavorites, setCustomFavorites] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>('en');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [connectedPartnerId, setConnectedPartnerId] = useState<string | null>(null);
  const [partnerFullName, setPartnerFullName] = useState<string>('Your Helper');
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Initialize AI Logic
  const ai = getAI(auth.app, { backend: new GoogleAIBackend() });
  const aiModel = getGenerativeModel(ai, { model: "gemini-1.5-flash" });

  // Trigger one-time seeding for trial experience
  useEffect(() => {
    const hasSeeded = localStorage.getItem('hekki_db_seeded_v2');
    if (!hasSeeded) {
      seedDatabase().then(() => {
        localStorage.setItem('hekki_db_seeded_v2', 'true');
        loadDatabaseState();
      });
    }
  }, []);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [recipeRemarks, setRecipeRemarks] = useState<Record<string, string>>({});
  const navRef = React.useRef<HTMLElement>(null);

  // MacOS Dock Effect for the Bottom Nav
  useEffect(() => {
    const nav = navRef.current;
    if (!nav || !isLoggedIn) return;

    const items = nav.querySelectorAll('.dock-item');

    const handleMouseMove = (e: MouseEvent) => {
      items.forEach((item) => {
        const rect = item.getBoundingClientRect();
        // center of the item
        const x = rect.left + rect.width / 2;
        // distance from mouse to center
        const dist = Math.abs(e.clientX - x);

        // Calculate scale (max scale 1.25, effect radius 120px)
        const maxDist = 120;
        let scale = 1;
        if (dist < maxDist) {
          scale = 1 + (0.25 * (maxDist - dist) / maxDist);
        }

        gsap.to(item, {
          scale: scale,
          y: -((scale - 1) * 20), // lift up slightly as it scales
          duration: 0.2,
          ease: 'power2.out',
          transformOrigin: 'bottom center'
        });
      });
    };

    const handleMouseLeave = () => {
      gsap.to(items, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    nav.addEventListener('mousemove', handleMouseMove);
    nav.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      nav.removeEventListener('mousemove', handleMouseMove);
      nav.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isLoggedIn, role]);

  const viewContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (viewContainerRef.current && isLoggedIn) {
      // Small fade/slide transition when currentView changes
      gsap.fromTo(viewContainerRef.current, 
        { opacity: 0, x: 10 }, 
        { opacity: 1, x: 0, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, { dependencies: [currentView, isLoggedIn], scope: viewContainerRef });

  // Application Data stores
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [healthProfiles, setHealthProfiles] = useState<FamilyMember[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const confettiFiredRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (activeTask && activeTask.taskStatus === 'dish_approved') {
      if (!confettiFiredRef.current.has(activeTask.taskID)) {
        confettiFiredRef.current.add(activeTask.taskID);
        
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function() {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
          confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
        
        setTimeout(() => {
          setCurrentView('feedback-settings');
        }, 1500);
      }
    }
  }, [activeTask?.taskStatus, activeTask?.taskID]);



  // Smart algorithm helper to adjust a recipe based on health profiles (Migrated from server.ts)
  const adjustRecipeForHealth = (recipeId: string, members: FamilyMember[]) => {
    const originalRecipe = RECIPES.find(r => r.recipeID === recipeId) || recipes.find(r => r.recipeID === recipeId);
    if (!originalRecipe) return null;

    let preSteps: RecipeStep[] = originalRecipe.preCookSteps ? JSON.parse(JSON.stringify(originalRecipe.preCookSteps)) : [];
    let cookSteps: RecipeStep[] = originalRecipe.cookSteps ? JSON.parse(JSON.stringify(originalRecipe.cookSteps)) : [];

    const hasDiabetes = members.some(m => m.disease?.toLowerCase().includes('diabetes'));
    const hasHypertension = members.some(m => m.disease?.toLowerCase().includes('hyper') || m.disease?.toLowerCase().includes('pressure'));
    const allergies = members.map(m => m.allergy?.trim().toLowerCase()).filter(a => a && a !== 'none');

    if (allergies.length > 0 && recipeId !== 'cantonese-steamed-fish') {
      const allergyListStr = allergies.join(', ');
      preSteps.unshift({
        id: 0,
        text: {
          en: `[ALLERGY WARNING] Clean and sanitize all workstations.`,
          id: `[PERINGATAN ALERGI] Bersihkan dan sanitasi semua area kerja.`,
          tg: `[ALLERGY WARNING] Linisin at i-sanitize ang lahat ng mga workstation.`
        },
        image: '/step1.png'
      });
    }

    if (hasDiabetes) {
      preSteps = preSteps.map(step => {
        const adjustStep = { ...step };
        (Object.keys(adjustStep.text) as Language[]).forEach(lang => {
          let val = adjustStep.text[lang];
          if (val.toLowerCase().includes('sugar') || val.toLowerCase().includes('gula')) {
            adjustStep.text[lang] = val + ' (Diabetes Option: Substitute with sweetener).';
          }
        });
        return adjustStep;
      });
    }

    if (hasHypertension) {
      cookSteps = cookSteps.map(step => {
        const adjustStep = { ...step };
        (Object.keys(adjustStep.text) as Language[]).forEach(lang => {
          let val = adjustStep.text[lang];
          if (val.toLowerCase().includes('salt') || val.toLowerCase().includes('soy sauce')) {
            adjustStep.text[lang] = val + ' (Low-sodium diet: Reduce salt/soy by 50%).';
          }
        });
        return adjustStep;
      });
    }

    return { preSteps: preSteps.map((s, idx) => ({ ...s, id: idx + 1 })), cookSteps: cookSteps.map((s, idx) => ({ ...s, id: idx + 1 })) };
  };

  // Synchronize master states on load
  const loadDatabaseState = () => {
    // 1. Catalog is static from RECIPES, no need to fetch unless using dynamic CMS
    // 2. Family profiles, reviews, tasks are already handled by onSnapshot listeners
    console.log("Database state synced via Firestore listeners.");
  };

  // Load favorites and likes from local storage on mount
  useEffect(() => {
    const savedFavs = localStorage.getItem('belaja_custom_favorites');
    const savedLikes = localStorage.getItem('belaja_likes_v3');
    const savedRemarks = localStorage.getItem('belaja_recipe_remarks');
    if (savedFavs) setCustomFavorites(JSON.parse(savedFavs));
    if (savedLikes) setLikedRecipeIds(JSON.parse(savedLikes));
    if (savedRemarks) setRecipeRemarks(JSON.parse(savedRemarks));
  }, []);

  // REAL-TIME FIRESTORE CHAT SYNC
  useEffect(() => {
    const q = query(collection(db, "chats"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreMsgs: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreMsgs.push({
          id: doc.id,
          ...data,
          createTime: data.createTime?.toDate ? data.createTime.toDate().toISOString() : (data.createTime || new Date().toISOString())
        } as ChatMessage);
      });
      firestoreMsgs.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());
      setChats(firestoreMsgs);
    }, (error) => console.warn("Firestore Chat Listener failed:", error));

    return () => unsubscribe();
  }, []);

  // REAL-TIME FIRESTORE INVITATIONS & CONNECTIONS SYNC
  useEffect(() => {
    if (!currentUserId) return;

    // Invitations Listener
    const qInv = query(collection(db, "invitations"), where("status", "==", "pending"));
    const unsubscribeInv = onSnapshot(qInv, (snapshot) => {
      const firestoreInvs: Invitation[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.senderID === currentUserId || data.receiverID === currentUserId) {
          firestoreInvs.push({
            invitationID: doc.id,
            ...data,
            createTime: data.createTime instanceof Timestamp 
              ? data.createTime.toDate().toISOString() 
              : (data.createTime || new Date().toISOString())
          } as Invitation);
        }
      });
      setInvitations(firestoreInvs);
    });

    // Connections Listener
    const qConn = query(collection(db, "connections"));
    const unsubscribeConn = onSnapshot(qConn, (snapshot) => {
      const firestoreConns: Connection[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.employerID === currentUserId || data.helperID === currentUserId) {
          firestoreConns.push({
            connectionID: doc.id,
            ...data,
            createTime: data.createTime instanceof Timestamp 
              ? data.createTime.toDate().toISOString() 
              : (data.createTime || new Date().toISOString())
          } as Connection);
        }
      });
      setConnections(firestoreConns);
      if (firestoreConns.length > 0 && currentUserId) {
        const firstConn = firestoreConns[0];
        const isEmployer = firstConn.employerID === currentUserId;
        setConnectedPartnerId(isEmployer ? firstConn.helperID : firstConn.employerID);
        setRole(isEmployer ? 'employer' : 'helper');
      }
    });

    // Tasks Listener - Sort in client to ensure documents with pending server timestamps are visible
    const qTasks = query(collection(db, "tasks"));
    const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
      const firestoreTasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.employerID === currentUserId || data.helperID === currentUserId || !currentUserId) {
          const adjustment = adjustRecipeForHealth(data.recipeID, healthProfiles);
          firestoreTasks.push({
            taskID: doc.id,
            ...data,
            adjustedPreSteps: adjustment?.preSteps || [],
            adjustedCookSteps: adjustment?.cookSteps || [],
            createTime: data.createTime instanceof Timestamp 
              ? data.createTime.toDate().toISOString() 
              : (data.createTime ? data.createTime : new Date().toISOString())
          } as Task);
        }
      });

      // Sort by createTime DESC in client
      firestoreTasks.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

      setAllTasks(firestoreTasks);
      const latest = firestoreTasks[0];
      if (latest && latest.taskStatus !== 'rated') {
        setActiveTask(latest);
      } else {
        setActiveTask(null);
      }
    });

    // Family Members Listener
    const qMembers = query(collection(db, "family-members"));
    const unsubscribeMembers = onSnapshot(qMembers, (snapshot) => {
      const firestoreMembers: FamilyMember[] = [];
      snapshot.forEach((doc) => {
        firestoreMembers.push({
          memberID: doc.id,
          ...doc.data()
        } as FamilyMember);
      });
      setHealthProfiles(firestoreMembers);
    });

    // Reviews Listener
    const qReviews = query(collection(db, "reviews"));
    const unsubscribeReviews = onSnapshot(qReviews, (snapshot) => {
      const firestoreReviews: Review[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreReviews.push({
          id: doc.id,
          ...data,
          createTime: data.createTime?.toDate ? data.createTime.toDate().toISOString() : (data.createTime || new Date().toISOString())
        } as Review);
      });
      // Sort reviews newest first
      firestoreReviews.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
      setReviews(firestoreReviews);
    });

    return () => {
      unsubscribeInv();
      unsubscribeConn();
      unsubscribeTasks();
      unsubscribeMembers();
      unsubscribeReviews();
    };
  }, [currentUserId]);


  const handleToggleLike = (recipeId: string) => {
    setLikedRecipeIds(prev => {
      const next = prev.includes(recipeId) ? prev.filter(id => id !== recipeId) : [...prev, recipeId];
      localStorage.setItem('belaja_likes_v3', JSON.stringify(next));
      return next;
    });
  };

  const handleAddCustomFavorite = (newFav: any) => {
    setCustomFavorites(prev => {
      const next = [...prev, newFav];
      localStorage.setItem('belaja_custom_favorites', JSON.stringify(next));
      return next;
    });
    // Also like it automatically
    handleToggleLike(newFav.id);
  };

  const handleDeleteCustomFavorite = (favId: string) => {
    setCustomFavorites(prev => {
      const next = prev.filter(f => f.id !== favId);
      localStorage.setItem('belaja_custom_favorites', JSON.stringify(next));
      return next;
    });
    // Also remove from liked if it was there
    if (likedRecipeIds.includes(favId)) {
      handleToggleLike(favId);
    }
  };
  const handleUpdateRemark = (recipeId: string, remark: string) => {
    setRecipeRemarks(prev => {
      const next = { ...prev, [recipeId]: remark };
      localStorage.setItem('belaja_recipe_remarks', JSON.stringify(next));
      return next;
    });
  };

  // Monitor Auth State for persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && !isLoggedIn) {
        console.log("Found existing auth session:", user.uid);
        
        // Attempt to find user by their Firebase UID in Firestore first
        const q = query(collection(db, "users"), where("firebaseUid", "==", user.uid));
        const qSnap = await getDocs(q).catch(() => null);
        if (qSnap && !qSnap.empty) {
          const uDoc = qSnap.docs[0];
          const userData = uDoc.data();
          setUserFullName(userData.fullName);
          setRole(userData.role);
          setCurrentUserId(uDoc.id); // This is the 8-digit ID
          setIsLoggedIn(true);
        } else if (currentUserId) {
          // Fallback to searching by currentUserId (8-digit ID)
          const docRef = doc(db, "users", currentUserId);
          const docSnap = await getDoc(docRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            const userData = docSnap.data();
            setUserFullName(userData.fullName);
            setRole(userData.role);
            setIsLoggedIn(true);
          }
        }
      }
    });
    return () => unsubscribe();
  }, [isLoggedIn, currentUserId]);

  useEffect(() => {
    loadDatabaseState();
    // Periodic polling removed as Firestore real-time listeners are active.
  }, [currentUserId]);
  useEffect(() => {
    if (connectedPartnerId) {
      const loadPartner = async () => {
        const docRef = doc(db, "users", connectedPartnerId);
        const docSnap = await getDoc(docRef).catch(() => null);
        if (docSnap && docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.fullName) {
            setPartnerFullName(userData.fullName);
          }
        }
      };
      loadPartner();
    }
  }, [connectedPartnerId]);
  // Set selected preferences
  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setCurrentView('dashboard');
  };

  const handleSelectLang = async (selectedLang: Language) => {
    setLang(selectedLang);
    if (currentUserId) {
      try {
        await updateDoc(doc(db, "users", currentUserId), { languagePreference: selectedLang });
      } catch (err) {
        console.warn("Firestore update language failed:", err);
      }
    }
  };

  // Add dynamic family health profile member
  const handleAddMember = async (m: Omit<FamilyMember, 'memberID'>) => {
    try {
      await addDoc(collection(db, "family-members"), m);
    } catch (err) {
      console.warn("Firestore add member failed:", err);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "family-members", id));
    } catch (err) {
      console.warn("Firestore delete member failed:", err);
    }
  };

  // Publish task
  const handlePublishTask = async (recipeID: string, customSteps: string[]) => {
    console.log("handlePublishTask started for recipe:", recipeID);
    // Move cleanup to after or run in background to avoid blocking the UI feedback
    // Run cleanup in background to keep UI responsive
    const oldUnratedTasks = allTasks.filter(t => t.taskStatus !== 'rated');
    Promise.all(oldUnratedTasks.map(t => deleteDoc(doc(db, "tasks", t.taskID)).catch(() => {})));

    const newTask = {
      recipeID,
      employerID: currentUserId || 'employer-1',
      helperID: connectedPartnerId || 'helper-1',
      customPreSteps: customSteps,
      taskStatus: 'preparing' as TaskStatus,
      preCookFinishRate: 0,
      cookFinishRate: 0,
      currentPreStepIndex: 0,
      currentCookStepIndex: 0,
      createTime: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, "tasks"), newTask);
      setActiveTask({ taskID: docRef.id, ...newTask, createTime: new Date().toISOString() } as Task);
      
      const successMsg = lang === 'en' 
        ? `Task assigned to ${partnerFullName || 'your helper'}!` 
        : lang === 'id' 
        ? `Tugas diberikan kepada ${partnerFullName || 'asisten Anda'}!` 
        : `Na-assign na ang task kay ${partnerFullName || 'iyong helper'}!`;
      alert(successMsg);
      
      setCurrentView('dashboard');
    } catch (err: any) {
      console.warn("Firestore publish task failed:", err);
      alert("Failed to assign task: " + (err.message || "Unknown error"));
    }
  };

  // Lock-step confirmation mechanics
  const handleConfirmStep = async (type: 'pre' | 'cook', stepID: number, isFinish: boolean) => {
    if (!activeTask) return;
    
    // Calculate new status and rates (simplified logic from server.ts)
    let updateData: Partial<Task> = {};
    const recipe = recipes.find(r => r.recipeID === activeTask.recipeID) || RECIPES.find(r => r.recipeID === activeTask.recipeID);
    
    if (type === 'pre') {
      const standardPreSteps = (activeTask.adjustedPreSteps && activeTask.adjustedPreSteps.length > 0) ? activeTask.adjustedPreSteps : (recipe?.preCookSteps || []);
      const totalSteps = standardPreSteps.length + (activeTask.customPreSteps?.length || 0);
      const rate = Math.round(((stepID + 1) / totalSteps) * 100);
      updateData.preCookFinishRate = Math.min(100, rate);
      updateData.currentPreStepIndex = stepID + 1;
      if (rate >= 100) updateData.taskStatus = 'pre_cook_completed';
    } else {
      const standardCookSteps = (activeTask.adjustedCookSteps && activeTask.adjustedCookSteps.length > 0) ? activeTask.adjustedCookSteps : (recipe?.cookSteps || []);
      const totalSteps = standardCookSteps.length;
      const rate = Math.round(((stepID + 1) / totalSteps) * 100);
      updateData.cookFinishRate = Math.min(100, rate);
      updateData.currentCookStepIndex = stepID + 1;
      if (rate >= 100) updateData.taskStatus = 'completed';
      else updateData.taskStatus = 'cooking_ongoing';
    }

    try {
      await updateDoc(doc(db, "tasks", activeTask.taskID), updateData);
    } catch (err) {
      console.warn("Firestore confirm step failed:", err);
    }
  };

  // Reset task back to preparing
  const handleResetTask = async (taskId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { taskStatus: 'preparing', preCookFinishRate: 0, currentPreStepIndex: 0 });
    } catch (err) {
      console.warn("Firestore reset task failed:", err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      if (activeTask?.taskID === taskId) setActiveTask(null);
    } catch (err) {
      console.warn("Firestore delete task failed:", err);
    }
  };

  const handleReviewPrep = async (taskId: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        await updateDoc(doc(db, "tasks", taskId), { taskStatus: 'prep_approved' });
      } else {
        await updateDoc(doc(db, "tasks", taskId), { 
          taskStatus: 'prep_rejected', 
          preCookFinishRate: 0, 
          currentPreStepIndex: 0,
          prepImageUrl: deleteField() as any 
        });
      }
    } catch (err) {
      console.warn("Firestore review prep failed:", err);
    }
  };

  const handleReviewDish = async (taskId: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        await updateDoc(doc(db, "tasks", taskId), { taskStatus: 'dish_approved' });
      } else {
        await updateDoc(doc(db, "tasks", taskId), { 
          taskStatus: 'dish_rejected',
          cookFinishRate: 0,
          currentCookStepIndex: 0,
          cookImageUrl: deleteField() as any
        });
      }
    } catch (err) {
      console.warn("Firestore review dish failed:", err);
    }
  };

  const handleUploadPrepPhoto = async (taskId: string, imageUrl: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { 
        prepImageUrl: imageUrl,
        taskStatus: 'pre_cook_completed'
      });
    } catch (err) {
      console.warn("Firestore upload prep failed:", err);
    }
  };
  const handleSendMessage = async (text: string, overrideTaskID?: string) => {
    if (!role && !currentUserId) return;
    const taskID = overrideTaskID || activeTask?.taskID || 'task-1';
    
    const newMessage = {
      taskID,
      senderRole: role || 'unknown',
      message: text,
      createTime: serverTimestamp(),
      isRead: false
    };

    // 1. Write to Firestore (Primary for Vercel/Real-time)
    try {
      await addDoc(collection(db, "chats"), newMessage);
    } catch (err) {
      console.warn("Firestore send failed:", err);
    }
  };

  // Gemini visual check
  const handleSubmitAICheck = async (imageB64: string) => {
    if (!activeTask) return;
    try {
      const recipe = recipes.find(r => r.recipeID === activeTask.recipeID) || RECIPES.find(r => r.recipeID === activeTask.recipeID);
      const dishTitle = recipe ? recipe.title.en : 'dish';

      const mimeTypeMatch = imageB64.match(/^data:(image\/.+);base64,/);
      const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
      const base64Data = imageB64.replace(/^data:.+;base64,/, '');

      const prompt = `You are a strict Culinary Auditor. Your goal is to detect non-food items, wrong dishes, or poor quality.
TARGET DISH: "${dishTitle}"

INSTRUCTIONS:
1. IDENTIFY: What is in this photo?
2. VALIDATE: Is this exactly the dish "${dishTitle}"?
3. FAIL IMMEDIATELY IF:
   - The image is NOT food (e.g., person, doll, drawing, text, room).
   - The image is the WRONG dish (e.g., if it's chicken but should be fish).
   - The image is too blurry to see clearly.
   - There are hands, feet, or random objects obstructing the food.
4. AUDIT QUALITY: If (and only if) it is the correct dish, check for plate cleanliness (rim spills) and cooking quality.

Respond ONLY with a valid JSON object:
{
  "rating": "Pass" or "Fail",
  "explanation": "State clearly what you see and why it passed or failed."
}`;

      const result = await aiModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      const aiData = JSON.parse(text.replace(/```json|```/g, ''));
      
      const updateData = {
        aiResult: aiData.rating,
        aiFeedback: aiData.explanation,
        taskStatus: aiData.rating === 'Pass' ? 'ai_checked' : 'cooking_ongoing',
        aiCheckTime: new Date().toISOString()
      };

      await updateDoc(doc(db, "tasks", activeTask.taskID), updateData);
      return aiData;
    } catch (err) {
      console.error("Gemini AI check failed:", err);
      return null;
    }
  };

  const handleSubmitToEmployer = async (taskId: string, cookImageUrl?: string) => {
    try {
      const updateData: any = { taskStatus: 'completed' };
      if (cookImageUrl) {
        updateData.cookImageUrl = cookImageUrl;
      }
      await updateDoc(doc(db, "tasks", taskId), updateData);
    } catch (err) {
      console.error("Submit to employer failed:", err);
    }
  };

  // Submit Culinary Satisfaction Scoring reviews
  const handleSubmitReview = async (starRate: number, comment: string) => {
    const targetTask = allTasks.find(t => {
      const hasRated = reviews.some(r => r.taskID === t.taskID && r.role === role);
      return !hasRated && ['completed', 'ai_checked', 'dish_approved', 'rated'].includes(t.taskStatus);
    });
    if (!targetTask) return;

    try {
      await addDoc(collection(db, "reviews"), {
        taskID: targetTask.taskID,
        starRate,
        comment,
        role: role,
        createTime: serverTimestamp()
      });
      
      // Update task status to rated
      await updateDoc(doc(db, "tasks", targetTask.taskID), { taskStatus: 'rated' });
      setCurrentView('feedback-settings');
    } catch (err) {
      console.error("Submit review failed:", err);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      if (role === 'employer') {
        await updateDoc(doc(db, "reviews", reviewId), { deletedByEmployer: true });
      } else if (role === 'helper') {
        await updateDoc(doc(db, "reviews", reviewId), { deletedByHelper: true });
      } else {
        await deleteDoc(doc(db, "reviews", reviewId));
      }
    } catch (err) {
      console.error("Delete review failed:", err);
    }
  };

  const handleUpdateReview = async (reviewId: string, updates: Partial<Review>) => {
    try {
      await updateDoc(doc(db, "reviews", reviewId), updates);
    } catch (err) {
      console.error("Update review failed:", err);
    }
  };

  const handleMarkChatAsRead = async (taskId: string) => {
    if (!role) return;
    
    // 1. Update Firestore (Real-time)
    try {
      const q = query(collection(db, "chats"), where("taskID", "==", taskId));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => {
        const data = d.data();
        if (data.senderRole !== role && data.isRead === false) {
          await updateDoc(doc(db, "chats", d.id), { isRead: true });
        }
      });
    } catch (err) {
      console.warn("Firestore mark read failed:", err);
    }
  };

  const handleDeleteChatMessage = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, "chats", chatId));
    } catch (err) {
      console.warn("Firestore delete chat failed:", err);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error("Firebase logout failed", e);
    }
    setRole(null);
    setIsLoggedIn(false);
    setUserAvatar(null);
    setUserFullName(null);
    setCurrentUserId(null);
    setCurrentView('dashboard');
    // Clear any persistent flags if needed
    localStorage.removeItem('belaja_last_user');
  };

  // Toggles the preferred language through standard sequence
  const cycleLanguage = () => {
    const sequence: Language[] = ['en', 'id', 'tg'];
    const nextIdx = (sequence.indexOf(lang) + 1) % sequence.length;
    handleSelectLang(sequence[nextIdx]);
  };

  // Safe recipe lookup that handles missing or custom recipes gracefully
  const activeRecipe = activeTask ? (recipes.find(r => r.recipeID === activeTask.recipeID) || {
    recipeID: activeTask.recipeID,
    title: { en: 'Active Cooking Task', id: 'Tugas Memasak Aktif', tg: 'Active Cooking Task' },
    description: { en: 'Custom assigned meal', id: 'Masakan yang ditugaskan', tg: 'Custom assigned meal' },
    preCookSteps: [],
    cookSteps: [],
    materialList: [],
    toolList: [],
    category: 'custom',
    prepTime: 0,
    cookTime: 0,
    tags: []
  }) : null;

  const taskToRate = allTasks.find(t => {
    const hasRated = reviews.some(r => r.taskID === t.taskID && r.role === role);
    return !hasRated && ['completed', 'ai_checked', 'dish_approved', 'rated'].includes(t.taskStatus);
  });
  const taskToRateRecipe = taskToRate ? (recipes.find(r => r.recipeID === taskToRate.recipeID) || {
    title: { en: 'Cooking Task', id: 'Tugas Memasak', tg: 'Cooking Task' }
  }) : null;
  const latestTaskTitle = taskToRateRecipe ? taskToRateRecipe.title[lang] : null;

  // Active state logic for bottom navigations
  const isTabActive = (tab: 'today' | 'recipes' | 'chat' | 'settings') => {
    if (tab === 'today') {
      return (
        currentView === 'dashboard' ||
        currentView === 'task-execution' ||
        currentView === 'upload-check' ||
        currentView === 'health-profiles'
      );
    }
    if (tab === 'recipes') {
      return currentView === 'recipe-planner' || currentView === 'recipe-library';
    }
    if (tab === 'chat') {
      return currentView === 'chat';
    }
    if (tab === 'settings') {
      return currentView === 'feedback-settings';
    }
    return false;
  };

  const handleTabClick = (tab: 'today' | 'recipes' | 'chat' | 'settings') => {
    if (!role) return;
    if (tab === 'today') {
      setCurrentView('dashboard');
    } else if (tab === 'recipes') {
      setCurrentView(role === 'employer' ? 'recipe-planner' : 'recipe-library');
    } else if (tab === 'chat') {
      setCurrentView('chat');
    } else if (tab === 'settings') {
      setCurrentView('feedback-settings');
    }
  };

  // Avatar photos
  const helperAvatar = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150";
  const employerAvatar = "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150";
  const neutralAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150";

  const getActiveAvatar = () => {
    if (userAvatar) return userAvatar;
    if (!role) return neutralAvatar;
    return role === 'employer' ? employerAvatar : helperAvatar;
  };

  const validChatIds = connections.map(c => `chat_${c.connectionID || c.employerID + '_' + c.helperID}`);
  const unreadChatCount = chats.filter(c => !c.isRead && c.senderRole !== role && validChatIds.includes(c.taskID)).length;
  const pendingInvCount = invitations.filter(inv => inv.receiverID === currentUserId && inv.status === 'pending').length;

  return (
    <main className="min-h-screen bg-app-bg flex justify-center items-start md:items-center font-sans overflow-x-hidden p-0 m-0">
      <div className="flex-1 w-full max-w-[480px] mx-auto bg-[#FCF9F2] relative overflow-hidden flex flex-col min-h-screen md:min-h-[840px] md:rounded-[24px] md:my-2 shadow-2xl border border-[#E2DDD5]">
        
        {/* Top Header Navigation (Dynamic color base depending on role) */}
        {role && isLoggedIn && (
          <header className={`${role === 'employer' ? 'bg-[#FFB973]' : 'bg-[#98E89C]'} h-[80px] px-8 shrink-0 flex items-center justify-between sticky top-0 z-50 border-b border-[#E2DDD5]/45`}>
            
            {/* Avatar and branding on left side */}
            <div className="flex items-center gap-3">
              <div
                onClick={() => {
                  if (role) {
                    setShowProfileModal(true);
                  }
                }}
                className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                title={role ? `View Profile` : 'Choose role below'}
              >
                <img
                  src={getActiveAvatar()}
                  alt="Account Avatar"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[22px] font-bold text-[#444444] leading-none tracking-tight">
                  Belaja
                </span>
                {/* Removed debug tag */}
              </div>
            </div>

            {/* Bilingual Quick Selector on right side */}
            <button
              onClick={cycleLanguage}
              className="border-2 border-[#444444]/35 hover:border-[#444444] bg-[#FCF9F2]/70 rounded-[14px] py-1.5 px-3 select-none cursor-pointer duration-150 transition-colors"
            >
              <div className="flex gap-1.5 font-sans font-bold text-[13px] text-[#444444]">
                <span className={lang === 'en' ? 'underline' : 'opacity-50'}>EN</span>
                <span className="opacity-25">&bull;</span>
                <span className={lang === 'id' ? 'underline' : 'opacity-50'}>ID</span>
                <span className="opacity-25">&bull;</span>
                <span className={lang === 'tg' ? 'underline' : 'opacity-50'}>TAG</span>
              </div>
            </button>

          </header>
        )}

        {/* Dynamic Body Wrapper with 32px safe side borders and 28px gaps */}
        <div ref={viewContainerRef} className={`flex-1 overflow-y-auto ${currentView === 'chat' ? 'px-0' : 'px-4'} pt-4 flex flex-col ${(role && isLoggedIn) ? 'pb-[110px]' : 'pb-7'}`}>
          {!role ? (
            <LaunchPage
              onSelectRole={handleSelectRole}
              lang={lang}
              onSelectLang={handleSelectLang}
            />
          ) : !isLoggedIn ? (
            <LoginPage
              onLogin={(overrideRole?: Role, userAvatarData?: string | null, userFullNameData?: string | null, currentUserIdData?: string | null) => {
                if (overrideRole) {
                  setRole(overrideRole);
                }
                if (userAvatarData) {
                  setUserAvatar(userAvatarData);
                }
                if (userFullNameData) {
                  setUserFullName(userFullNameData);
                }
                if (currentUserIdData) {
                  setCurrentUserId(currentUserIdData);
                }
                setIsLoggedIn(true);
              }}
              onBack={() => setRole(null)}
              lang={lang}
              onSetLang={handleSelectLang}
              initialRole={role || 'employer'}
            />
          ) : (
            <>
              {currentView === 'dashboard' && role === 'employer' && (
                <EmployerDashboard
                  task={activeTask}
                  allTasks={allTasks}
                  recipes={recipes}
                  healthProfiles={healthProfiles}
                  lang={lang}
                  onNavigate={setCurrentView}
                  onResetTask={handleResetTask}
                  onDeleteTask={handleDeleteTask}
                  userFullName={userFullName}
                  connectedPartnerId={connectedPartnerId}
                  partnerFullName={partnerFullName}
                  onRefreshData={loadDatabaseState}
                  likedIds={likedRecipeIds}
                  onToggleLike={handleToggleLike}
                  customFavorites={customFavorites}
                  onAddCustomFavorite={handleAddCustomFavorite}
                  onDeleteCustomFavorite={handleDeleteCustomFavorite}
                  recipeRemarks={recipeRemarks}
                  onUpdateRemark={handleUpdateRemark}
                  onReviewPrep={handleReviewPrep}
                  onReviewDish={handleReviewDish}
                  onPublishTask={handlePublishTask}
                />
              )}

              {currentView === 'dashboard' && role === 'helper' && (
                <HelperDashboard
                  task={activeTask}
                  allTasks={allTasks}
                  recipes={recipes}
                  lang={lang}
                  onNavigate={setCurrentView}
                  onConfirmStep={handleConfirmStep}
                  userFullName={userFullName}
                  onRefreshData={loadDatabaseState}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {currentView === 'recipe-planner' && (
                <RecipePlanner
                  recipes={recipes}
                  healthProfiles={healthProfiles}
                  lang={lang}
                  onPublishTask={handlePublishTask}
                  partnerFullName={partnerFullName}
                  likedIds={likedRecipeIds}
                  onToggleLike={handleToggleLike}
                />
              )}

              {currentView === 'health-profiles' && (
                <HealthProfilePage
                  members={healthProfiles}
                  lang={lang}
                  onAddMember={handleAddMember}
                  onDeleteMember={handleDeleteMember}
                />
              )}

              {currentView === 'recipe-library' && (
                <RecipeLibraryPage
                  recipes={recipes}
                  lang={lang}
                  role={role || 'employer'}
                />
              )}

              {currentView === 'task-execution' && activeTask && (
                <TaskExecutionPage
                  task={activeTask}
                  recipe={activeRecipe || undefined}
                  lang={lang}
                  onConfirmStep={handleConfirmStep}
                  onNavigate={setCurrentView}
                  onRefreshData={loadDatabaseState}
                  onUploadPrepPhoto={handleUploadPrepPhoto}
                />
              )}

              {currentView === 'upload-check' && activeTask && (
                <ResultUploadPage
                  task={activeTask}
                  lang={lang}
                  onSubmitAICheck={handleSubmitAICheck}
                  onSubmitToEmployer={(cookImageUrl) => { handleSubmitToEmployer(activeTask.taskID, cookImageUrl); }}
                  onNavigate={setCurrentView}
                />
              )}

              {(currentView === 'chat' || currentView === 'chat-settings') && (
                <ChatPage
                  chats={chats.filter(c => c.taskID.startsWith('chat_') || allTasks.some(t => t.taskID === c.taskID))}
                  role={role!}
                  lang={lang}
                  onSendMessage={handleSendMessage}
                  currentUserId={currentUserId}
                  connectedPartnerId={connectedPartnerId}
                  invitations={invitations}
                  connections={connections}
                  onConnect={setConnectedPartnerId}
                  onRefreshData={loadDatabaseState}
                  initialTab={currentView === 'chat-settings' ? 'settings' : 'chat'}
                  onMarkChatAsRead={handleMarkChatAsRead}
                  onDeleteChatMessage={handleDeleteChatMessage}
                />
              )}

              {currentView === 'feedback-settings' && (
                <FeedbackSettingsPage
                  lang={lang}
                  onSetLang={handleSelectLang}
                  onSubmitReview={handleSubmitReview}
                  reviews={reviews
                    .filter(r => allTasks.some(t => t.taskID === r.taskID))
                    .map(r => {
                      const task = allTasks.find(t => t.taskID === r.taskID);
                      const recipe = task ? recipes.find(rec => rec.recipeID === task.recipeID) || RECIPES.find(rec => rec.recipeID === task.recipeID) : null;
                      return {
                        ...r,
                        taskTitle: r.taskTitle || (recipe ? recipe.title[lang] : 'Cooking Task')
                      };
                    })}
                  latestTaskTitle={latestTaskTitle}
                  role={role}
                  onLogout={logout}
                  onDeleteReview={handleDeleteReview}
                  onUpdateReview={handleUpdateReview}
                />
              )}
            </>
          )}
        </div>

        {/* Global Bottom Tab Bar Navigator Section (Always visible when role is logged in) */}
        {role && isLoggedIn && (
          <nav ref={navRef} className="absolute bottom-3 left-6 right-6 h-[76px] rounded-[22px] border border-[#E2DDD5] bg-white/90 backdrop-blur-md px-4 shrink-0 flex items-center shadow-[0_8px_30px_rgb(0,0,0,0.12)] select-none z-40">
            <div className="grid grid-cols-4 w-full h-full items-center">
              
              {/* Tab 1: Today */}
              <div className="flex justify-center dock-item">
                {isTabActive('today') ? (
                  <button
                    onClick={() => handleTabClick('today')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-app-orange text-[#444444] rounded-[14px] font-bold text-[14px] transition-all cursor-pointer shadow-sm animate-fadeIn"
                    id="tab-today-active"
                  >
                    <Calendar className="w-5 h-5 shrink-0 text-[#444444]" strokeWidth={2.5} />
                    <span>{lang === 'en' ? 'Today' : lang === 'id' ? 'Hari Ini' : 'Ngayon'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('today')}
                    className="flex flex-[1] flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                    id="tab-today-inactive"
                  >
                    <Calendar className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Today' : lang === 'id' ? 'Hari Ini' : 'Ngayon'}</span>
                  </button>
                )}
              </div>

              {/* Tab 2: Recipes */}
              <div className="flex justify-center dock-item">
                {isTabActive('recipes') ? (
                  <button
                    onClick={() => handleTabClick('recipes')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-app-orange text-[#444444] rounded-[14px] font-bold text-[14px] transition-all cursor-pointer shadow-sm animate-fadeIn"
                  >
                    <BookOpen className="w-5 h-5 shrink-0 text-[#444444]" strokeWidth={2.5} />
                    <span>{lang === 'en' ? 'Recipes' : lang === 'id' ? 'Resep' : 'Mga Resipe'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('recipes')}
                    className="flex flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <BookOpen className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span>{lang === 'en' ? 'Recipes' : lang === 'id' ? 'Resep' : 'Mga Resipe'}</span>
                  </button>
                )}
              </div>

              {/* Tab 3: Chat */}
              <div className="flex justify-center dock-item">
                {isTabActive('chat') ? (
                  <button
                    onClick={() => handleTabClick('chat')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-app-orange text-[#444444] rounded-[14px] font-bold text-[14px] transition-all cursor-pointer shadow-sm animate-fadeIn relative"
                  >
                    <div className="relative">
                      <MessageSquare className="w-5 h-5 shrink-0 text-[#444444]" strokeWidth={2.5} />
                      {unreadChatCount > 0 && (
                        <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 py-0 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                          {unreadChatCount}
                        </div>
                      )}
                    </div>
                    <span>{lang === 'en' ? 'Chat' : lang === 'id' ? 'Obrolan' : 'Chat'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('chat')}
                    className="flex flex-col items-center justify-center py-4 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer relative"
                  >
                    <div className="relative">
                      <MessageSquare className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                      {unreadChatCount > 0 && (
                        <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 py-0 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                          {unreadChatCount}
                        </div>
                      )}
                    </div>
                    <span>{lang === 'en' ? 'Chat' : lang === 'id' ? 'Obrolan' : 'Chat'}</span>
                  </button>
                )}
              </div>

              {/* Tab 4: Settings */}
              <div className="flex justify-center dock-item">
                {isTabActive('settings') ? (
                  <button
                    onClick={() => handleTabClick('settings')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-app-orange text-[#444444] rounded-[14px] font-bold text-[14px] transition-all cursor-pointer shadow-sm animate-fadeIn"
                  >
                    <div className="relative">
                      <Settings className="w-5 h-5 shrink-0 text-[#444444]" strokeWidth={2.5} />
                      {pendingInvCount > 0 && (
                        <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 py-0 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                          {pendingInvCount}
                        </div>
                      )}
                    </div>
                    <span>{lang === 'en' ? 'Settings' : lang === 'id' ? 'Pengaturan' : 'Mga Setting'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('settings')}
                    className="flex flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <div className="relative">
                      <Settings className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                      {pendingInvCount > 0 && (
                        <div className="absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-bold px-1 py-0 rounded-full flex items-center justify-center min-w-[16px] h-[16px]">
                          {pendingInvCount}
                        </div>
                      )}
                    </div>
                    <span>{lang === 'en' ? 'Settings' : lang === 'id' ? 'Pengaturan' : 'Mga Setting'}</span>
                  </button>
                )}
              </div>

            </div>
          </nav>
        )}

        {/* Profile Image Modal */}
        {showProfileModal && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={() => setShowProfileModal(false)}>
            <div className="relative max-w-[320px] w-full rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="absolute top-3 right-3 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70 transition-colors z-10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <img
                src={getActiveAvatar()}
                alt="Enlarged Profile"
                className="w-full h-auto object-cover bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
