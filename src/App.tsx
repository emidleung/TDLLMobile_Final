import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
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
import { Task, Language, Role, Recipe, FamilyMember, ChatMessage, Review, Invitation, Connection } from './types';
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
  deleteField
} from "firebase/firestore";
import { RECIPES } from './recipesData';

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

  // Application Data stores
  const [recipes, setRecipes] = useState<Recipe[]>(RECIPES);
  const [healthProfiles, setHealthProfiles] = useState<FamilyMember[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  const handleJsonResponse = async (res: Response, fallbackValue: any = null) => {
    if (!res.ok) {
      const text = await res.text();
      console.warn(`HTTP Error: ${res.status} - ${text}`);
      return fallbackValue;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.warn(`Expected JSON but got: ${text}`);
      return fallbackValue;
    }
    try {
      return await res.json();
    } catch (err) {
      console.warn("JSON parsing failed, falling back:", err);
      return fallbackValue;
    }
  };

  // Smart algorithm helper to adjust a recipe based on health profiles (Migrated from server.ts)
  const adjustRecipeForHealth = (recipeId: string, members: FamilyMember[]) => {
    const originalRecipe = RECIPES.find(r => r.recipeID === recipeId) || recipes.find(r => r.recipeID === recipeId);
    if (!originalRecipe) return null;

    let preSteps: RecipeStep[] = JSON.parse(JSON.stringify(originalRecipe.preCookSteps));
    let cookSteps: RecipeStep[] = JSON.parse(JSON.stringify(originalRecipe.cookSteps));

    const hasDiabetes = members.some(m => m.disease.toLowerCase().includes('diabetes'));
    const hasHypertension = members.some(m => m.disease.toLowerCase().includes('hyper') || m.disease.toLowerCase().includes('pressure'));
    const allergies = members.map(m => m.allergy.trim().toLowerCase()).filter(a => a && a !== 'none');

    if (allergies.length > 0 && recipeId !== 'cantonese-steamed-fish') {
      const allergyListStr = allergies.join(', ');
      preSteps.unshift({
        id: 0,
        text: {
          en: `[ALLERGY WARNING] Clean and sanitize all workstations. Ensure zero contact with: ${allergyListStr}.`,
          id: `[PERINGATAN ALERGI] Bersihkan talenan. Pastikan tidak ada kontak dengan: ${allergyListStr}.`,
          tg: `[BABALA SA ALERHIYA] Linisin ang workstation. Siguraduhing walang contact sa: ${allergyListStr}.`
        },
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgL9HdVqVTd3rN0858gr-CmnbshY3FPcXbFW0VDaNxi-kzx3o9QJll0A5QG2gHHhUj0gJ91mycpQ-Gm1BQ8C9vF9IF81Aj0_A6tYTQ5GKYsUhev0hIBubciUhOqvHbGKqLKVqZxDbGbaROBnp6iFFGbzQHET6lQMfqPZh2i-FTJamZN8FWyuKhU4AWwn-LifMfbAIuSiVWQe-ZrshNq6eeFK86RoB6epwXGClCOC67kE9qWZzdK_oXFpyoAJleJOZuAWzDxRA6g'
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
    // 1. Fetch catalog
    fetch(`/api/recipes?t=${Date.now()}`)
      .then(res => handleJsonResponse(res, null))
      .then(fetchedRecipes => {
        if (fetchedRecipes && Array.isArray(fetchedRecipes) && fetchedRecipes.length > 0) {
          setRecipes(fetchedRecipes);
        }
      })
      .catch((e) => console.warn('fetch error (recipes)', e));

    // 2. Fetch profiles
    fetch('/api/family-members')
      .then(res => handleJsonResponse(res, []))
      .then(setHealthProfiles)
      .catch((e) => console.warn('fetch error (profiles)', e));

    // 3. Fetch active cooking tasks
    fetch('/api/tasks')
      .then(res => handleJsonResponse(res, []))
      .then(data => {
        if (data && data.length > 0) {
          setAllTasks(data);
          // Active task is the latest task that is not 'rated'
          const latestActive = [...data].reverse().find(t => t.taskStatus !== 'rated');
          setActiveTask(latestActive || null);
        } else {
          setAllTasks([]);
          setActiveTask(null);
        }
      })
      .catch((e) => console.warn('fetch error (tasks)', e));

    // 4. Fetch chats
    fetch('/api/chats')
      .then(res => handleJsonResponse(res, []))
      .then(setChats)
      .catch((e) => console.warn('fetch error (chats)', e));

    // 5. Fetch reviews list
    fetch('/api/reviews')
      .then(res => handleJsonResponse(res, []))
      .then(setReviews)
      .catch((e) => console.warn('fetch error (reviews)', e));

    if (currentUserId) {
      // 6. Fetch pending invitations
      fetch(`/api/invitations/${currentUserId}?t=${Date.now()}`)
        .then(res => handleJsonResponse(res, []))
        .then(setInvitations)
        .catch((e) => console.warn('fetch error (invitations)', e));

      // 7. Fetch active connections
      fetch(`/api/connections/${currentUserId}?t=${Date.now()}`)
        .then(res => handleJsonResponse(res, []))
        .then(data => {
          setConnections(data);
          // Set connected partner if active connection exists
          if (data && data.length > 0) {
            const firstConn = data[0];
            setConnectedPartnerId(firstConn.employerID === currentUserId ? firstConn.helperID : firstConn.employerID);
            // Sync the user's role in the app based on the connection
            setRole(firstConn.employerID === currentUserId ? 'employer' : 'helper');
          } else {
            setConnectedPartnerId(null);
          }
        })
        .catch((e) => console.warn('fetch error (connections)', e));
    }
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
    const q = query(collection(db, "chats"), orderBy("createTime", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firestoreChats: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        firestoreChats.push({
          ...data,
          createTime: data.createTime instanceof Timestamp ? data.createTime.toDate().toISOString() : data.createTime
        } as ChatMessage);
      });
      if (firestoreChats.length > 0) setChats(firestoreChats);
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
            createTime: data.createTime instanceof Timestamp ? data.createTime.toDate().toISOString() : data.createTime
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
            createTime: data.createTime instanceof Timestamp ? data.createTime.toDate().toISOString() : data.createTime
          } as Connection);
        }
      });
      setConnections(firestoreConns);
      if (firestoreConns.length > 0) {
        const firstConn = firestoreConns[0];
        setConnectedPartnerId(firstConn.employerID === currentUserId ? firstConn.helperID : firstConn.employerID);
        setRole(firstConn.employerID === currentUserId ? 'employer' : 'helper');
      }
    });

    // Tasks Listener
    const qTasks = query(collection(db, "tasks"), orderBy("createTime", "desc"));
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
            createTime: data.createTime instanceof Timestamp ? data.createTime.toDate().toISOString() : data.createTime
          } as Task);
        }
      });
      if (firestoreTasks.length > 0) {
        setAllTasks(firestoreTasks);
        const latestActive = firestoreTasks.find(t => t.taskStatus !== 'rated');
        setActiveTask(latestActive || null);
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

    return () => {
      unsubscribeInv();
      unsubscribeConn();
      unsubscribeTasks();
      unsubscribeMembers();
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
        const userDoc = await getDoc(doc(db, "users", user.uid)).catch(() => null);
        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data();
          setUserFullName(userData.fullName);
          setRole(userData.role);
          setCurrentUserId(user.uid);
          setIsLoggedIn(true);
        } else if (currentUserId) {
          // Fallback to the currentUserId if set (handles mock IDs)
          const res = await fetch(`/api/users/${currentUserId}`);
          if (res.ok) {
            const userData = await res.json();
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
    // Set periodic polling to make instant communication responsive inside test frame
    const interval = setInterval(loadDatabaseState, 4000);
    return () => clearInterval(interval);
  }, [currentUserId]);
  useEffect(() => {
    if (connectedPartnerId) {
      fetch(`/api/users/${connectedPartnerId}`)
        .then(res => handleJsonResponse(res, null))
        .then(user => {
          if (user && user.fullName) {
            setPartnerFullName(user.fullName);
          }
        })
        .catch(console.error);
    }
  }, [connectedPartnerId]);
  // Set selected preferences
  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setCurrentView('dashboard');
  };

  const handleSelectLang = (selectedLang: Language) => {
    setLang(selectedLang);
    // Persist via api
    fetch('/api/users/preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: role === 'employer' ? 'employer-1' : 'helper-1', languagePreference: selectedLang })
    }).catch(console.error);
  };

  // Add dynamic family health profile member
  const handleAddMember = async (m: Omit<FamilyMember, 'memberID'>) => {
    try {
      await addDoc(collection(db, "family-members"), m);
    } catch (err) {
      console.warn("Firestore add member failed:", err);
      // Fallback
      fetch('/api/family-members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(m)
      })
      .then(res => handleJsonResponse(res, null))
      .then(() => loadDatabaseState())
      .catch(console.error);
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteDoc(doc(db, "family-members", id));
    } catch (err) {
      console.warn("Firestore delete member failed:", err);
      fetch(`/api/family-members/${id}`, { method: 'DELETE' })
        .then(() => loadDatabaseState())
        .catch(console.error);
    }
  };

  // Publish task
  const handlePublishTask = async (recipeID: string, customSteps: string[]) => {
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
      setCurrentView('dashboard');
    } catch (err) {
      console.warn("Firestore publish task failed:", err);
      fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipeID, customPreSteps: customSteps })
      })
      .then(res => handleJsonResponse(res, null))
      .then(task => {
        if (task) {
          setActiveTask(task);
          setCurrentView('dashboard');
        }
      })
      .catch(console.error);
    }
  };

  // Lock-step confirmation mechanics
  const handleConfirmStep = async (type: 'pre' | 'cook', stepID: number, isFinish: boolean) => {
    if (!activeTask) return;
    
    // Calculate new status and rates (simplified logic from server.ts)
    let updateData: Partial<Task> = {};
    const recipe = recipes.find(r => r.recipeID === activeTask.recipeID) || RECIPES.find(r => r.recipeID === activeTask.recipeID);
    
    if (type === 'pre') {
      const totalSteps = (recipe?.preCookSteps?.length || 0) + (activeTask.customPreSteps?.length || 0);
      const rate = Math.round(((stepID + 1) / totalSteps) * 100);
      updateData.preCookFinishRate = rate;
      updateData.currentPreStepIndex = stepID + 1;
      if (rate >= 100) updateData.taskStatus = 'pre_cook_completed';
    } else {
      const totalSteps = recipe?.cookSteps?.length || 0;
      const rate = Math.round(((stepID + 1) / totalSteps) * 100);
      updateData.cookFinishRate = rate;
      updateData.currentCookStepIndex = stepID + 1;
      if (rate >= 100) updateData.taskStatus = 'completed';
      else updateData.taskStatus = 'cooking_ongoing';
    }

    try {
      await updateDoc(doc(db, "tasks", activeTask.taskID), updateData);
    } catch (err) {
      console.warn("Firestore confirm step failed:", err);
      fetch(`/api/tasks/${activeTask.taskID}/step`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, stepID, isFinish })
      })
      .then(res => handleJsonResponse(res, null))
      .then(task => { if (task) setActiveTask(task); })
      .catch(console.error);
    }
  };

  // Reset task back to preparing
  const handleResetTask = async (taskId: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { taskStatus: 'preparing', preCookFinishRate: 0, currentPreStepIndex: 0 });
    } catch (err) {
      fetch(`/api/tasks/${taskId}/reset`, { method: 'POST' })
        .then(() => loadDatabaseState())
        .catch(console.error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteDoc(doc(db, "tasks", taskId));
      if (activeTask?.taskID === taskId) setActiveTask(null);
    } catch (err) {
      fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
        .then(() => loadDatabaseState())
        .catch(console.error);
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
      fetch(`/api/tasks/${taskId}/review-prep`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      }).catch(console.error);
    }
  };

  const handleReviewDish = async (taskId: string, isApproved: boolean) => {
    try {
      if (isApproved) {
        await updateDoc(doc(db, "tasks", taskId), { taskStatus: 'dish_approved' });
      } else {
        await updateDoc(doc(db, "tasks", taskId), { 
          taskStatus: 'prep_rejected',
          preCookFinishRate: 0,
          cookFinishRate: 0,
          currentPreStepIndex: 0,
          currentCookStepIndex: 0,
          prepImageUrl: deleteField() as any,
          cookImageUrl: deleteField() as any
        });
      }
    } catch (err) {
      fetch(`/api/tasks/${taskId}/review-dish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved })
      }).catch(console.error);
    }
  };

  const handleUploadPrepPhoto = async (taskId: string, imageUrl: string) => {
    try {
      await updateDoc(doc(db, "tasks", taskId), { 
        prepImageUrl: imageUrl,
        taskStatus: 'pre_cook_completed'
      });
    } catch (err) {
      fetch(`/api/tasks/${taskId}/upload-prep-photo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl })
      }).catch(console.error);
    }
  };
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
      console.warn("Firestore send failed, falling back to API:", err);
      
      // 2. Fallback to Express API
      fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMessage,
          createTime: new Date().toISOString()
        })
      })
      .then(res => handleJsonResponse(res, null))
      .then(() => loadDatabaseState())
      .catch(console.error);
    }
  };

  // Gemini visual check
  const handleSubmitAICheck = async (imageB64: string) => {
    if (!activeTask) return;
    try {
      const response = await fetch('/api/ai-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskID: activeTask.taskID,
          imageUrl: imageB64
        })
      });
      const data = await handleJsonResponse(response, null);
      loadDatabaseState();
      return data;
    } catch (err) {
      console.error("Gemini fetch failed:", err);
      return null;
    }
  };

  // Submit Culinary Satisfaction Scoring reviews
  const handleSubmitReview = (starRate: number, comment: string) => {
    if (!activeTask) return;
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taskID: activeTask.taskID,
        starRate,
        comment
      })
    })
      .then(() => {
        loadDatabaseState();
        setCurrentView('feedback-settings');
      })
      .catch(console.error);
  };

  const handleMarkChatAsRead = async (taskId: string) => {
    if (!role) return;
    
    // 1. Update Firestore (Real-time)
    try {
      const q = query(collection(db, "chats"), where("taskID", "==", taskId), where("isRead", "==", false));
      const snapshot = await getDocs(q);
      snapshot.forEach(async (d) => {
        if (d.data().senderRole !== role) {
          await updateDoc(doc(db, "chats", d.id), { isRead: true });
        }
      });
    } catch (err) {
      console.warn("Firestore mark read failed:", err);
    }

    // 2. Sync with Backend
    fetch('/api/chats/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskID: taskId, readerRole: role })
    })
      .then(res => handleJsonResponse(res, null))
      .then(() => loadDatabaseState())
      .catch(console.error);
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

  const activeRecipe = activeTask ? recipes.find(r => r.recipeID === activeTask.recipeID) : null;

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

  const totalNotifications = 
    chats.filter(c => !c.isRead && c.senderRole !== role).length +
    invitations.filter(inv => inv.receiverID === currentUserId && inv.status === 'pending').length;

  return (
    <main className="min-h-screen bg-[#ECE9E2] text-[#444444] font-sans flex flex-col items-center justify-start py-0 md:py-6">
      
      {/* Mobile Frame Container Framework */}
      <div className="w-full max-w-[480px] bg-[#FCF9F2] min-h-screen md:min-h-[840px] md:rounded-[24px] md:my-2 shadow-2xl flex flex-col relative border border-[#E2DDD5] overflow-hidden">
        
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
                <span className="text-[10px] bg-red-500 text-white px-1 rounded animate-pulse">V-DELETE-ACTIVE</span>
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
        <div className={`flex-1 overflow-y-auto ${currentView === 'chat' ? 'px-0' : 'px-4'} pt-4 flex flex-col ${(role && isLoggedIn) ? 'pb-[110px]' : 'pb-7'}`}>
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
                />
              )}

              {currentView === 'dashboard' && role === 'helper' && (
                <HelperDashboard
                  task={activeTask}
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
                  onNavigate={setCurrentView}
                />
              )}

              {(currentView === 'chat' || currentView === 'chat-settings') && (
                <ChatPage
                  chats={chats}
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
                />
              )}

              {currentView === 'feedback-settings' && (
                <FeedbackSettingsPage
                  lang={lang}
                  onSetLang={handleSelectLang}
                  onSubmitReview={handleSubmitReview}
                  reviews={reviews}
                  latestTaskTitle={activeRecipe ? activeRecipe.title[lang] : null}
                  role={role}
                  onLogout={logout}
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
                    <span>Today</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('today')}
                    className="flex flex-[1] flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                    id="tab-today-inactive"
                  >
                    <Calendar className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span>Today</span>
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
                    <span>Recipes</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('recipes')}
                    className="flex flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <BookOpen className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span>Recipes</span>
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
                      {totalNotifications > 0 && (
                        <div className="absolute -top-2.5 -right-2.5 bg-[#EF4444] text-white text-[10px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-md z-50 animate-bounce-once">
                          {totalNotifications}
                        </div>
                      )}
                    </div>
                    <span>Chat</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('chat')}
                    className="flex flex-col items-center justify-center py-4 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer relative"
                  >
                    <div className="relative">
                      <MessageSquare className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                      {totalNotifications > 0 && (
                        <div className="absolute -top-2.5 -right-2.5 bg-[#EF4444] text-white text-[10px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 border-2 border-white shadow-md z-50 animate-bounce-once">
                          {totalNotifications}
                        </div>
                      )}
                    </div>
                    <span>Chat</span>
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
                    <Settings className="w-5 h-5 shrink-0 text-[#444444]" strokeWidth={2.5} />
                    <span>Settings</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleTabClick('settings')}
                    className="flex flex-col items-center justify-center py-2 text-[#666666] hover:text-[#444444] text-[13px] font-semibold transition-all cursor-pointer"
                  >
                    <Settings className="w-5 h-5 mb-0.5 shrink-0" strokeWidth={1.5} />
                    <span>Settings</span>
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
