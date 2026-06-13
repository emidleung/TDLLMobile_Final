import React, { useState, useEffect } from 'react';
import {
  ChefHat,
  PlusCircle,
  ShieldAlert,
  MessageSquare,
  RotateCcw,
  AlertCircle,
  Sparkles,
  CheckSquare,
  Clock,
  Heart,
  UtensilsCrossed,
  X,
  Plus,
  BookOpen,
  Calendar,
  Layers,
  Flame,
  Leaf,
  Fish,
  RefreshCw,
  Users,
  Info,
  Volume2,
  ArrowRight,
  ArrowLeft,
  Trash,
  PenLine
} from 'lucide-react';
import { Task, Language, Recipe, FamilyMember } from '../types';
import { RECIPES } from '../recipesData';

interface EmployerDashboardProps {
  task: Task | null;
  allTasks?: Task[];
  recipes: Recipe[];
  healthProfiles: FamilyMember[];
  lang: Language;
  onNavigate: (view: string) => void;
  onResetTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  userFullName?: string | null;
  connectedPartnerId?: string | null;
  partnerFullName?: string;
  onRefreshData: () => void;
  likedIds: string[];
  onToggleLike: (id: string) => void;
  customFavorites: any[];
  onAddCustomFavorite: (fav: any) => void;
  onDeleteCustomFavorite: (id: string) => void;
  recipeRemarks: Record<string, string>;
  onUpdateRemark: (id: string, remark: string) => void;
}

// Custom defined favorites stored on client for maximum persistence
interface FavRecipe {
  id: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  calories?: number;
  category: string;
  tag: string;
  image?: string;
  iconType?: 'fish' | 'leaf' | 'default';
  isLarge?: boolean;
  materialList?: string[];
  prepTime?: number;
  cookTime?: number;
}

export function EmployerDashboard({
  task,
  allTasks = [],
  recipes,
  healthProfiles,
  lang,
  onNavigate,
  onResetTask,
  onDeleteTask,
  userFullName,
  connectedPartnerId,
  partnerFullName = 'Your Helper',
  onRefreshData,
  likedIds,
  onToggleLike,
  customFavorites,
  onAddCustomFavorite,
  onDeleteCustomFavorite,
  recipeRemarks,
  onUpdateRemark
}: EmployerDashboardProps) {

  // Initial favorites matching the screenshot exactly
  const initialFavs: FavRecipe[] = [
    {
      id: 'tomato-egg-stir-fry',
      title: { en: 'Tomato & Egg Stir-fry', id: 'Tumis Telur & Tomat', tg: 'Tomato at Egg Stir-fry' },
      subtitle: { en: 'Kids love this', id: 'Suka anak-anak', tg: 'Paborito ng mga bata' },
      calories: 220,
      category: 'Simple Meals',
      tag: 'Quick',
      isLarge: true,
      image: '/recipes/tomato_egg_main_v4.jpg',
      materialList: ['3 Large Eggs', '2 Ripe Tomatoes', '1 stalk Scallion', '1/2 tsp Salt', '1 tsp Sugar', '2 tbsp Oil'],
      prepTime: 10,
      cookTime: 10
    },
    {
      id: 'cantonese-steamed-fish',
      title: { en: 'Steamed Fish', id: 'Ikan Kukus', tg: 'Steamed Fish' },
      subtitle: { en: 'Light soy and ginger drizzle', id: 'Kecap asin dan jahe', tg: 'Luya at toyo' },
      calories: 290,
      category: 'HK Home Style',
      tag: 'Low Sugar',
      iconType: 'fish',
      image: '/recipes/cantonese_steamed_fish.png',
      materialList: ['1 Fresh Sea Bass', '30g Ginger threads', '3 scallions', '2 tbsp light soy sauce'],
      prepTime: 15,
      cookTime: 15
    },
    {
      id: 'garlic-bok-choy',
      title: { en: 'Bok Choy', id: 'Sayur Bok Choy', tg: 'Bok Choy' },
      subtitle: { en: 'Garlic rapid fry', id: 'Tumis bawang putih cepat', tg: 'Mabilisang bawang gisa' },
      calories: 110,
      category: 'Simple Meals',
      tag: 'Quick',
      iconType: 'leaf',
      image: '/recipes/garlic_bok_choy.png',
      materialList: ['300g Fresh Baby Bok Choy', '4 cloves Garlic minced', '1/2 tsp Salt'],
      prepTime: 8,
      cookTime: 5
    }
  ];

  // Combine initial, custom, and recipes that are "liked" from the general catalog
  const allPossibleFavs = [
    ...initialFavs,
    ...customFavorites
  ];

  // Add recipes from the main catalog that were "liked" but aren't in initial/custom lists
  recipes.forEach(r => {
    if (likedIds.includes(r.recipeID) && !allPossibleFavs.find(f => f.id === r.recipeID)) {
      allPossibleFavs.push({
        id: r.recipeID,
        title: r.title,
        subtitle: r.subtitle || { en: r.category, id: r.category, tg: r.category },
        category: r.category,
        tag: r.tags?.[0] || 'Healthy',
        image: r.image || '/recipes/default.png',
        prepTime: r.prepTime,
        cookTime: r.cookTime,
        materialList: r.materialList
      });
    }
  });

  // Helper to get display subtitle (Remark overrides default subtitle)
  const getDisplaySubtitle = (item: FavRecipe) => {
    if (recipeRemarks[item.id]) return recipeRemarks[item.id];
    return item.subtitle[lang] || item.subtitle['en'];
  };

  // Only display those that are in likedIds
  const favorites = allPossibleFavs.filter(f => likedIds.includes(f.id));
  
  // Modals visibility states
  const [activeDetailRecipe, setActiveDetailRecipe] = useState<FavRecipe | null>(null);
  const [modalActiveTab, setModalActiveTab] = useState<'prep' | 'cook' | 'takeaways'>('prep');
  const [isAddFavOpen, setIsAddFavOpen] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalImage, setModalImage] = useState('');

  // Add Custom Favorited Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newCategory, setNewCategory] = useState('HK Home Style');
  const [newTag, setNewTag] = useState('Healthy');
  const [newCals, setNewCals] = useState('280');
  const [newIngs, setNewIngs] = useState('Fresh ingredients, chef spices');
  const [newImage, setNewImage] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoice = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    // Rough language mapping for TTS
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'id' ? 'id-ID' : 'en-US';
    utterance.onend = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Initialize and load default state from screenshot
  useEffect(() => {
    // We now use props for favorites and likes
    // But we still want to ensure initial likes for the mockup if none exist
    if (likedIds.length === 0 && !localStorage.getItem('belaja_likes_v3')) {
      const initialLikes = ['tomato-egg-stir-fry', 'cantonese-steamed-fish', 'garlic-bok-choy'];
      initialLikes.forEach(id => onToggleLike(id));
    }
  }, []);

  // Save favorites helper
  const saveFavsToDisk = (updatedFavs: FavRecipe[]) => {
    setFavorites(updatedFavs);
    localStorage.setItem('belaja_favorites_v3', JSON.stringify(updatedFavs));
  };

  // Toggle dynamic liked icon state
  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(id);
  };

  const handleDeleteFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(lang === 'en' ? 'Are you sure you want to remove this recipe from favorites?' : 'Yakin ingin menghapus resep ini dari favorit?')) {
      onDeleteCustomFavorite(id);
    }
  };

  // Build a custom user recipe and add to memory list
  const handleAddCustomRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    const newID = `user-${Date.now()}`;
    const customItem: FavRecipe = {
      id: newID,
      title: { en: newTitle, id: newTitle, tg: newTitle },
      subtitle: { en: newSubtitle || 'Custom family secret recipe', id: newSubtitle || 'Resep rahasia keluarga', tg: newSubtitle || 'Lutong pampamilya' },
      calories: Number(newCals) || 250,
      category: newCategory,
      tag: newTag,
      image: newImage.trim() || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=400',
      materialList: newIngs.split(',').map(i => i.trim()),
      prepTime: 12,
      cookTime: 15,
      iconType: 'default'
    };

    onAddCustomFavorite(customItem);

    // Reset Form Input
    setNewTitle('');
    setNewSubtitle('');
    setNewCals('280');
    setNewIngs('Fresh ingredients, Chef spices');
    setNewImage('');
    setIsAddFavOpen(false);
  };



  // Direct Assign Button inside Details Pop-Up
  const handleQuickAssign = (recipeId: string) => {
    if (!connectedPartnerId) {
      const msg = lang === 'en' 
        ? "You haven't connected to a helper yet. Please go to Account -> Connections to invite your helper before assigning dishes." 
        : lang === 'id'
        ? "Anda belum terhubung dengan asisten. Silakan buka Akun -> Koneksi untuk mengundang asisten Anda sebelum memberikan tugas memasak."
        : "Hindi ka pa nakakonekta sa isang helper. Pumunta sa Account -> Connections para i-invite ang iyong helper bago mag-assign ng mga putahe.";
      alert(msg);
      return;
    }

    setActiveDetailRecipe(null);
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipeID: recipeId,
        customPreSteps: [],
        assignedHelperID: connectedPartnerId
      })
    })
      .then(res => res.ok && res.headers.get('content-type')?.includes('application/json') ? res.json().catch(() => ({})) : {})
      .then(() => {
        onRefreshData();
      })
      .catch(console.error);
  };

  // Determine current greeting and translation according to hour bounds
  const getGreetingData = () => {
    const hour = new Date().getHours();
    
    // Default Greeting keys
    let greetingKey: 'morning' | 'afternoon' | 'evening' = 'morning';
    if (hour >= 11 && hour < 17) greetingKey = 'afternoon';
    else if (hour >= 17 || hour < 5) greetingKey = 'evening';

    const translationsDict = {
      morning: {
        en: 'Good Morning, Mrs. Chen',
        id: 'Selamat Pagi, Ny. Chen',
        tg: 'Magandang Umaga, Gng. Chen'
      },
      afternoon: {
        en: 'Good Afternoon, Mrs. Chen',
        id: 'Selamat Siang, Ny. Chen',
        tg: 'Magandang Hapon, Gng. Chen'
      },
      evening: {
        en: 'Good Evening, Mrs. Chen',
        id: 'Selamat Sore, Ny. Chen',
        tg: 'Magandang Gabi, Gng. Chen'
      },
      subtitle: {
        en: "Let's plan today's meals.",
        id: 'Mari rencanakan masakan hari ini.',
        tg: 'Magplano tayo ng lutuin ngayon.'
      }
    };

    let displayTitle = translationsDict[greetingKey][lang] || translationsDict[greetingKey]['en'];
    if (userFullName) {
      displayTitle = displayTitle.replace(/Mrs. Chen|Ny. Chen|Gng. Chen/gi, userFullName);
    }

    return {
      title: displayTitle,
      subtitle: translationsDict.subtitle[lang] || translationsDict.subtitle['en']
    };
  };

  const currentRecipe = task ? recipes.find(r => r.recipeID === task.recipeID) : null;
  const greeting = getGreetingData();

  // Highlight specific badge matching taskStatus
  const getStatusBadgeStyles = (status: string) => {
    // 未开始/进行中/已完成三种状态配色：待开始灰、进行中绿、完成浅灰置底
    switch (status) {
      case 'completed':
      case 'ai_checked':
      case 'dish_approved':
      case 'dish_rejected':
      case 'rated':
        return {
          container: 'bg-[#F1F1F1] text-gray-500 border border-gray-300',
          label: lang === 'en' ? 'Finished' : 'Selesai'
        };
      case 'preparing':
      case 'cooking_ongoing':
      case 'pre_cook_completed':
        return {
          container: 'bg-[#97E89F] text-[#005228] border border-emerald-300',
          label: lang === 'en' ? 'In Progress' : 'Sedang Masak'
        };
      default:
        return {
          container: 'bg-gray-100 text-gray-400 border border-gray-200',
          label: lang === 'en' ? 'Pending' : 'Tertunda'
        };
    }
  };

  const getRecipeImage = (id?: string) => {
    if (!id) return '';
    const r = recipes.find(x => x.recipeID === id);
    if (r?.image) return r.image;
    if (r?.preCookSteps?.[0]?.image) return r.preCookSteps[0].image;
    
    // Fallbacks from earlier implementation
    switch (id) {
      case 'steamed-garlic-chicken':
        return '/recipes/garlic_soy_chicken.png';
      case 'tomato-egg-stir-fry':
        return '/recipes/tomato_egg_main_v4.jpg';
      case 'cantonese-steamed-fish':
        return '/recipes/cantonese_steamed_fish.png';
      case 'garlic-bok-choy':
        return '/recipes/garlic_bok_choy.png';
      case 'sweet-and-sour-pork':
        return '/recipes/sweet_sour_pork.png';
      case 'beef-chow-fun':
        return '/recipes/beef_chow_fun.png';
      case 'mapo-tofu':
        return '/recipes/mapo_tofu.png';
      case 'steamed-pork-ribs':
        return '/recipes/black_bean_ribs.png';
      case 'char-siu':
        return '/recipes/char_siu.png';
      case 'shrimp-fried-rice':
        return '/recipes/shrimp_fried_rice.png';
      default:
        return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1280';
    }
  };

  // Find recipes from dataset to show inside modals
  const recipeSelectionList = recipes.length > 0 ? recipes : [
    { recipeID: 'tomato-egg-stir-fry', title: { en: 'Tomato & Egg Stir-fry', id: 'Tumis Telur & Tomat', tg: 'Tomato at Egg Stir-fry' } },
    { recipeID: 'cantonese-steamed-fish', title: { en: 'Cantonese Steamed Fish', id: 'Ikan Kukus Khas Kanton', tg: 'Steamed Fish' } },
    { recipeID: 'garlic-bok-choy', title: { en: 'Garlic Bok Choy', id: 'Bok Choy Tumis Bawang', tg: 'Garlic Bok Choy' } },
    { recipeID: 'sweet-and-sour-pork', title: { en: 'Sweet & Sour Pork with Pineapples', id: 'Babi Asam Manis', tg: 'Sweet & Sour Pork' } },
    { recipeID: 'steamed-garlic-chicken', title: { en: 'Steamed Garlic Chicken & Greens', id: 'Ayam Kukus Bawang Putih & Sayuran', tg: 'Steamed Garlic Chicken at Greens' } }
  ];

  return (
    <div className="flex flex-col gap-[28px] animate-fadeIn w-full max-w-[480px] mx-auto pb-12" id="employer-dashboard-root">
      
      {/* 1. Header Greeting Banner Segment */}
      <section className="flex flex-col gap-2 mt-2">
        <h1 className="text-[38px] md:text-[40px] font-bold text-app-text-title leading-tight tracking-tight flex items-baseline gap-2">
          {greeting.title}
          <span className="text-[12px] bg-red-600 text-white px-2 py-0.5 rounded-full animate-pulse shrink-0">V5-ROBUST</span>
        </h1>
        <p className="text-[20px] font-normal text-app-text-muted leading-relaxed">
          {greeting.subtitle}
        </p>
      </section>

      {!connectedPartnerId && (
        <section 
          onClick={() => onNavigate('chat-settings')}
          className="bg-orange-50 border border-app-orange/30 p-4 rounded-[14px] flex items-center gap-3 cursor-pointer hover:bg-orange-100 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-app-orange/20 flex items-center justify-center text-app-orange shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-[16px] font-bold text-app-text-title">
              {lang === 'en' ? 'Connect to your Helper' : lang === 'id' ? 'Hubungkan ke Asisten' : 'I-konek ang iyong Helper'}
            </p>
            <p className="text-[14px] text-app-text-muted">
              {lang === 'en' ? 'Invite your helper to start assigning meals.' : lang === 'id' ? 'Undang asisten para mulai memberikan tugas memasak.' : 'I-invite ang helper para mag-assign ng mga pagkain.'}
            </p>
          </div>
        </section>
      )}



      {/* 3. ACTIVE TASK (进行中任务模块) —— 雇主核心监控与只读展示 */}
      <section className="flex flex-col gap-3">
        
        {/* Module Header Title & Status */}
        <div className="flex justify-between items-center">
          <span className="text-[18px] font-bold text-app-text-title uppercase tracking-wider flex items-center gap-2">
            Active Task
            <span className="text-[10px] bg-red-500 text-white px-1 rounded animate-pulse normal-case">V4-RUBBISH-HERE</span>
          </span>
          {task && (
            <div className="flex items-center gap-1.5 shrink-0">
              {/* EMERGENCY MARKER V4 */}
              <button
                onClick={() => {
                  if (confirm(lang === 'en' ? 'Are you sure you want to delete this task? This cannot be undone.' : 'Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.')) {
                    onDeleteTask(task.taskID);
                  }
                }}
                title="Delete task permanently"
                className="w-12 h-12 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer active:scale-95 border-2 border-white transition-all z-50"
                id="btn-delete-task-v4"
              >
                <span className="text-[24px]">🗑️</span>
              </button>

              <button
                onClick={() => onResetTask(task.taskID)}
                title="Reset or re-assign meal roadmap"
                className="p-1.5 hover:text-red-700 bg-gray-100 rounded-[14px] border border-app-border transition-colors flex items-center justify-center cursor-pointer"
                id="btn-reset-task-state"
              >
                <RotateCcw className="w-4 h-4 text-app-text-muted" />
              </button>

              <span className={`py-1 px-3 rounded-[14px] text-[14px] font-bold flex items-center gap-1 ${getStatusBadgeStyles(task.taskStatus).container}`}>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" strokeWidth={2.5} />
                <span>{getStatusBadgeStyles(task.taskStatus).label}</span>
              </span>
            </div>
          )}
        </div>

        {/* Task Card Body */}
        {task && currentRecipe ? (
          <div className="bg-white border border-app-border rounded-[14px] p-6 shadow-sm flex flex-col gap-5 relative overflow-hidden">
            
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-[20px] font-bold text-app-text-title">
                {task.taskStatus === 'pre_cook_completed' || (task.preCookFinishRate === 100 && task.cookFinishRate === 100)
                  ? 'Ready for Evaluation' 
                  : (task.taskStatus === 'cooking_ongoing' ? 'Meal is being cooked now !' : 'Meal is being prepared now !')}
              </span>
            </div>

            {/* Child Recipe summary box */}
            <div className="flex gap-4 items-center bg-[#FDFBF7] p-4 border border-app-border rounded-[10px]">
              <div 
                onClick={() => {
                  const img = task.cookImageUrl || task.prepImageUrl || getRecipeImage(task.recipeID);
                  setModalImage(img);
                  setModalTitle(task.cookImageUrl ? 'Final Dish Submission' : task.prepImageUrl ? 'Preparation Submission' : 'Recipe Image');
                  setShowImageModal(true);
                }}
                className="w-16 h-16 bg-gray-100 rounded-[10px] overflow-hidden border border-app-border shrink-0 cursor-pointer hover:ring-2 ring-app-orange transition-all relative group"
              >
                <img
                  alt={currentRecipe.title[lang]}
                  className="w-full h-full object-cover"
                  src={task.cookImageUrl || task.prepImageUrl || getRecipeImage(task.recipeID)}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Plus className="text-white w-5 h-5" />
                </div>
              </div>

              <div className="flex-1">
                <h4 className="text-[20px] font-bold text-app-text-title leading-snug">
                  {currentRecipe.title[lang]}
                </h4>
              </div>
            </div>

            {/* Preparation task progress feedback tracks */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              
              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-app-text-muted uppercase tracking-wider">Preparation</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#EEEEEE] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${task.preCookFinishRate === 100 ? 'bg-green-500' : 'bg-app-orange'}`} style={{ width: `${task.preCookFinishRate}%` }} />
                  </div>
                  <span className={`text-[14px] font-bold font-mono ${task.preCookFinishRate === 100 ? 'text-green-600' : 'text-app-text-title'}`}>{task.preCookFinishRate}%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[14px] font-bold text-app-text-muted uppercase tracking-wider">Cooking</span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-[#EEEEEE] h-1.5 rounded-full overflow-hidden">
                    <div className={`h-full ${task.cookFinishRate === 100 ? 'bg-green-500' : 'bg-app-orange'}`} style={{ width: `${task.cookFinishRate}%` }} />
                  </div>
                  <span className={`text-[14px] font-bold font-mono ${task.cookFinishRate === 100 ? 'text-green-600' : 'text-app-text-title'}`}>{task.cookFinishRate}%</span>
                </div>
              </div>

            </div>

            {/* Locking validation status message */}
            <div className="flex items-center justify-start gap-1.5 text-[15px] pt-3 border-t border-app-border text-app-text-muted">
              {task.taskStatus === 'pre_cook_completed' ? (
                <div className="w-full flex flex-col gap-3">
                  <div className="flex gap-2 items-center bg-orange-50 p-2 rounded-lg text-app-orange border border-orange-200">
                    <ShieldAlert className="w-5 h-5 shrink-0" />
                    <span className="font-bold text-sm">Action Required: Review Preparation</span>
                  </div>
                  {task.prepImageUrl && (
                    <img src={task.prepImageUrl} alt="Prep Photo" className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer" onClick={() => {
                        setModalImage(task.prepImageUrl!);
                        setModalTitle('Preparation Submission');
                        setShowImageModal(true);
                    }} />
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        fetch(`/api/tasks/${task.taskID}/review-prep`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isApproved: true })
                        }).then(() => onRefreshData());
                      }}
                      className="flex-1 py-2 px-3 bg-app-orange font-bold text-[#444444] rounded-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Approve (OK)</span>
                    </button>
                    <button
                      onClick={() => {
                        fetch(`/api/tasks/${task.taskID}/review-prep`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isApproved: false })
                        }).then(() => onRefreshData());
                      }}
                      className="flex-1 py-2 px-3 bg-gray-200 font-bold text-gray-700 rounded-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer border border-gray-300"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject (Redo)</span>
                    </button>
                  </div>
                </div>
              ) : task.taskStatus === 'completed' ? (
                <button
                  onClick={() => onNavigate('upload-check')}
                  className="w-full py-2 px-3 bg-app-orange font-bold text-[#444444] rounded-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-current text-[#444444]" />
                  <span>Execute AI Verification</span>
                </button>
              ) : task.taskStatus === 'ai_checked' ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="bg-[#98E89C]/20 border border-[#98E89C] rounded-[10px] p-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-bold text-green-800">Action Required: Review Final Dish</span>
                  </div>
                  {task.cookImageUrl && (
                    <div className="flex flex-col gap-1">
                      <span className="text-[12px] font-bold text-app-text-muted uppercase">Final Dish Snapshot:</span>
                      <img 
                        src={task.cookImageUrl} 
                        alt="Final Dish" 
                        className="w-full h-40 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90" 
                        onClick={() => {
                          setModalImage(task.cookImageUrl!);
                          setModalTitle('Final Dish Submission');
                          setShowImageModal(true);
                        }}
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        fetch(`/api/tasks/${task.taskID}/review-dish`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ isApproved: true })
                        }).then(() => onRefreshData());
                      }}
                      className="flex-1 py-2 px-3 bg-app-orange font-bold text-[#444444] rounded-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                      <span>Approve (OK)</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to reject this dish? The helper will need to redo it.')) {
                          fetch(`/api/tasks/${task.taskID}/review-dish`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ isApproved: false })
                          }).then(() => onRefreshData());
                        }
                      }}
                      className="flex-1 py-2 px-3 bg-gray-200 font-bold text-gray-700 rounded-[10px] shadow-sm hover:opacity-90 flex items-center justify-center gap-1.5 cursor-pointer border border-gray-300"
                    >
                      <X className="w-4 h-4" />
                      <span>Reject (Redo)</span>
                    </button>
                  </div>
                </div>
              ) : task.taskStatus === 'dish_approved' ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="bg-green-50 border border-green-200 rounded-[10px] p-2 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-green-700" />
                    <span className="text-sm font-bold text-green-800">Dish Approved! Please provide feedback.</span>
                  </div>
                  <button
                    onClick={() => onNavigate('feedback-settings')}
                    className="w-full py-2 px-3 bg-[#98E89C] border border-app-border font-bold text-[#444444] rounded-[10px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{lang === 'en' ? 'Evaluate & Give Stars' : 'Evaluasi & Beri Bintang'}</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          /* Placeholder Blank State (二.4.1 空白占位) */
          <div className="bg-white border border-app-border rounded-[14px] py-10 px-6 text-center flex flex-col items-center gap-3">
            <p className="text-[18px] font-bold text-app-text-title leading-snug">
              No ongoing cooking task
            </p>
          </div>
        )}

      </section>

      {/* 3.5 Finished Tasks Column */}
      {allTasks.filter(t => t.taskStatus === 'rated').length > 0 && (
        <section className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-[18px] font-bold text-app-text-title uppercase tracking-wider">
              Finished Task
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {allTasks.filter(t => t.taskStatus === 'rated').map(finishedTask => {
              const fRecipe = recipes.find(r => r.recipeID === finishedTask.recipeID);
              if (!fRecipe) return null;
              return (
                <div key={finishedTask.taskID} className="bg-[#F8F9FA] border border-app-border rounded-[14px] p-4 shadow-sm flex items-center gap-4 relative overflow-hidden">
                  <div className="w-16 h-16 bg-gray-100 rounded-[10px] overflow-hidden border border-app-border shrink-0">
                    <img
                      alt={fRecipe.title[lang]}
                      className="w-full h-full object-cover grayscale-[30%]"
                      src={getRecipeImage(finishedTask.recipeID)}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[18px] font-bold text-gray-600 leading-tight line-clamp-1">
                        {fRecipe.title[lang] || fRecipe.title['en']}
                      </h3>
                      <span className="bg-[#E2DDD5] text-[#444444] py-0.5 px-2 rounded-md text-[12px] font-bold shrink-0 shadow-sm border border-[#D5CDC4]">
                        Finished
                      </span>
                    </div>
                    <p className="text-[14px] text-gray-500">
                      {fRecipe.subtitle?.[lang] || fRecipe.subtitle?.['en'] || fRecipe.description?.[lang] || fRecipe.description?.['en']}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Family Favorites Section (家庭收藏菜谱区) */}
      <section className="flex flex-col gap-4">
        
        {/* Row Title */}
        <div className="flex justify-between items-baseline">
          <h2 className="text-[22px] font-bold text-app-text-title">
            Family Favorites
          </h2>
          <button
            onClick={() => onNavigate('recipe-planner')}
            className="text-[16px] font-bold text-[#965020] hover:underline cursor-pointer"
          >
            View All
          </button>
        </div>

        {/* 3-Cards Aesthetic Layout: First Large Image, Then Split Columns */}
        <div className="flex flex-col gap-4">
          
          {/* Card Style A: Large Main Image Card */}
          {favorites.filter(x => x.isLarge || x.id === 'tomato-egg-stir-fry').map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveDetailRecipe(item)}
              className="w-full bg-white border border-app-border rounded-[14px] overflow-hidden shadow-sm flex flex-col cursor-pointer hover:border-app-orange transition-all duration-300 group"
            >
              <div className="w-full h-48 bg-slate-150 overflow-hidden relative">
                <img
                  src={item.image}
                  alt={item.title[lang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Control Buttons Overlay */}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button
                    onClick={(e) => toggleLike(item.id, e)}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-red-500 shadow-md focus:outline-none hover:scale-110 duration-200"
                  >
                    <Heart
                      className={`w-5 h-5 ${likedIds.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFav(item.id, e)}
                    className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-400 shadow-md focus:outline-none hover:text-red-500 hover:scale-110 duration-200"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-1">
                <h3 className="text-[22px] font-bold text-app-text-title">
                  {item.title[lang] || item.title['en']}
                </h3>
                <p className="text-[16px] text-app-text-muted">
                  {recipeRemarks[item.id] || getDisplaySubtitle(item)}
                </p>
              </div>
            </div>
          ))}

          {/* Card Style B & C: Row with Left and Right Columns */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Split Column LEFT Card (Cantonese Steamed Fish mockup styling) */}
            {favorites.filter(x => x.iconType === 'fish' || x.id === 'cantonese-steamed-fish').map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveDetailRecipe(item)}
                className="bg-white border border-app-border rounded-[14px] p-5 flex flex-col justify-between cursor-pointer hover:border-app-orange transition-all duration-300 min-h-[160px] relative shadow-sm"
              >
                {/* Heart Button inside small card */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={(e) => toggleLike(item.id, e)}
                    className="text-red-500 hover:scale-110 duration-150 p-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedIds.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFav(item.id, e)}
                    className="text-gray-400 hover:text-red-500 hover:scale-110 duration-150 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Left Blue Icon Block */}
                <div className="w-11 h-11 bg-[#E8F3FD] rounded-[10px] flex items-center justify-center text-blue-500">
                  <Fish className="w-6 h-6" />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <h3 className="text-[20px] font-bold text-app-text-title leading-tight">
                    {item.title[lang] || item.title['en']}
                  </h3>
                  <p className="text-[13px] text-app-text-muted line-clamp-1">
                    {getDisplaySubtitle(item)}
                  </p>
                  
                  <div>
                    <span className="bg-[#FAF8F5] text-[13px] text-app-text-muted py-1 px-2.5 rounded-[6px] border border-app-border">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Split Column RIGHT Card (Garlic Bok Choy mockup styling) */}
            {favorites.filter(x => x.iconType === 'leaf' || x.id === 'garlic-bok-choy').map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveDetailRecipe(item)}
                className="bg-white border border-app-border rounded-[14px] p-5 flex flex-col justify-between cursor-pointer hover:border-app-orange transition-all duration-300 min-h-[160px] relative shadow-sm"
              >
                {/* Heart Button inside small card */}
                <div className="absolute top-4 right-4 flex items-center gap-1">
                  <button
                    onClick={(e) => toggleLike(item.id, e)}
                    className="text-red-500 hover:scale-110 duration-150 p-1"
                  >
                    <Heart
                      className={`w-4 h-4 ${likedIds.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                    />
                  </button>
                  <button
                    onClick={(e) => handleDeleteFav(item.id, e)}
                    className="text-gray-400 hover:text-red-500 hover:scale-110 duration-150 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Right Green Icon Block */}
                <div className="w-11 h-11 bg-[#EAFBEF] rounded-[10px] flex items-center justify-center text-emerald-500">
                  <Leaf className="w-6 h-6" />
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <h3 className="text-[20px] font-bold text-app-text-title leading-tight">
                    {item.title[lang] || item.title['en']}
                  </h3>
                  <p className="text-[13px] text-app-text-muted line-clamp-1">
                    {getDisplaySubtitle(item)}
                  </p>
                  
                  <div>
                    <span className="bg-[#FAF8F5] text-[13px] text-app-text-muted py-1 px-2.5 rounded-[6px] border border-app-border">
                      {item.tag}
                    </span>
                  </div>
                </div>
              </div>
            ))}

          </div>

          {/* Any other custom recipes added by user in layout */}
          {favorites.filter(x => !x.isLarge && x.iconType !== 'fish' && x.iconType !== 'leaf' && x.id !== 'tomato-egg-stir-fry' && x.id !== 'cantonese-steamed-fish' && x.id !== 'garlic-bok-choy').map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveDetailRecipe(item)}
              className="bg-white border border-app-border rounded-[14px] p-5 flex justify-between items-center cursor-pointer hover:border-app-orange transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-50 rounded-[10px] flex items-center justify-center text-app-orange">
                  <ChefHat className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-[18px] font-bold text-app-text-title">
                    {item.title[lang] || item.title['en']}
                  </h3>
                  <p className="text-[14px] text-app-text-muted">
                    {getDisplaySubtitle(item)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => toggleLike(item.id, e)}
                  className="text-red-500 p-1 hover:scale-110 duration-150"
                >
                  <Heart
                    className={`w-4 h-4 ${likedIds.includes(item.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
                <button
                  onClick={(e) => handleDeleteFav(item.id, e)}
                  className="text-gray-400 p-1 hover:text-red-500 hover:scale-110 duration-150"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

        </div>

        {/* 5. Dotted/Dashed Button to Add New Favorite (Add New Favorite) */}
        <button
          onClick={() => setIsAddFavOpen(true)}
          className="w-full h-16 border-2 border-dashed border-[#D2C8B5] hover:border-app-orange rounded-[14px] flex items-center justify-center gap-2 text-app-text-muted hover:text-black transition-all cursor-pointer font-bold font-sans text-[18px] mt-2 bg-white/50"
          id="btn-add-new-favorite"
        >
          <Plus className="w-5 h-5 text-app-text-muted" strokeWidth={2.5} />
          <span>Add New Favorite</span>
        </button>

      </section>

      {/* MODAL 2: DISH DETAILS AND NUTRITIONAL INFORMATION POPUP */}
      {activeDetailRecipe && (
        <div className="fixed inset-0 bg-[#FCF9F2] z-[60] overflow-y-auto animate-fadeIn">
          <div className="flex flex-col gap-6 w-full max-w-[480px] mx-auto p-6 pb-12">
            
            {/* Back navigation button */}
            <button
              onClick={() => setActiveDetailRecipe(null)}
              className="flex items-center gap-1 text-xs font-bold text-[#5C4D43] hover:text-[#965020] transition-colors cursor-pointer w-fit py-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'en' ? 'Back to Dashboard' : 'Kembali ke Dashboard'}</span>
            </button>

            {/* Hero header block */}
            <div className="bg-white rounded-[28px] border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col">
              <div className="h-56 relative bg-[#E6E1DC]">
                <img
                  alt={activeDetailRecipe.title[lang]}
                  className="w-full h-full object-cover"
                  src={activeDetailRecipe.image}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold text-[#5C4D43] shadow-sm flex items-center gap-1 border border-[#E6E1DC]">
                  <Clock className="w-3.5 h-3.5 text-app-orange" />
                  <span>{(activeDetailRecipe.prepTime || 15) + (activeDetailRecipe.cookTime || 15)} mins total</span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <div>
                  <h3 className="text-2xl text-[#1E293B] font-black leading-tight">
                    {activeDetailRecipe.title[lang]}
                  </h3>
                  
                  {/* Editable Remark Field */}
                  <div className="mt-3 group">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[12px] font-bold text-[#965020] uppercase tracking-wider flex items-center gap-1">
                        <PenLine className="w-3 h-3" />
                        {lang === 'en' ? "Family's Remark / Note" : "Catatan Keluarga"}
                      </span>
                    </div>
                    <input
                      type="text"
                      value={recipeRemarks[activeDetailRecipe.id] || ''}
                      onChange={(e) => onUpdateRemark(activeDetailRecipe.id, e.target.value)}
                      placeholder={lang === 'en' ? "e.g. Kids love this, less salt..." : "misal: Suka anak-anak, kurangi garam..."}
                      className="w-full bg-[#FCF9F2] border border-[#E6E1DC] rounded-[10px] py-2 px-3 text-[15px] text-[#444444] font-medium focus:outline-none focus:border-app-orange transition-all"
                    />
                  </div>
                </div>

                {/* Tags badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="bg-secondary-container text-on-secondary-container font-label-lg text-xs px-2.5 py-0.5 rounded font-bold">
                    {activeDetailRecipe.category}
                  </span>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant font-label-lg text-xs px-2.5 py-0.5 rounded font-medium">
                    {activeDetailRecipe.tag}
                  </span>
                </div>

                {/* Checklist details bento split layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E6E1DC] mt-2 text-xs">
                  
                  <div className="flex flex-col gap-2">
                    <span className="font-black uppercase tracking-widest text-[#965020] text-[10px] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Ingredients List' : 'Kebutuhan Bahan'}
                    </span>
                    <ul className="text-[#475569] space-y-2 pl-4 list-disc font-medium leading-relaxed">
                      {(activeDetailRecipe.materialList || ['Standard ingredients']).map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-2">
                    <span className="font-black uppercase tracking-widest text-[#475569] text-[10px] flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      {lang === 'en' ? 'Utensils List' : 'Peralatan Masak'}
                    </span>
                    <ul className="text-[#475569] space-y-2 pl-4 list-disc font-medium leading-relaxed">
                      {(() => {
                        const matchedRecipe = recipes.find(r => r.recipeID === activeDetailRecipe.id);
                        const tools = matchedRecipe?.toolList || ['Standard kitchen tools'];
                        return tools.map((tool, id) => (
                          <li key={id}>{tool}</li>
                        ));
                      })()}
                    </ul>
                  </div>

                </div>

              </div>
            </div>

            {/* Smart Adaptations Alert Banner (If available) */}
            {(() => {
              const isDiabetic = healthProfiles.some(m => m.disease?.toLowerCase().includes('diabetes'));
              const isHypertensive = healthProfiles.some(m => m.disease?.toLowerCase().includes('hyper'));
              const allergyList = healthProfiles.map(m => m.allergy?.trim()).filter(a => a && a.toLowerCase() !== 'none');
              
              if (isDiabetic || isHypertensive || allergyList.length > 0) {
                return (
                  <div className="bg-[#FFF4E5] border border-orange-200 rounded-[24px] p-5 text-[15px] text-[#5C4D43] flex flex-col gap-3 shadow-sm shadow-orange-100">
                    <div className="font-black flex items-center gap-2 text-[#965020] uppercase tracking-wider text-[11px]">
                      <ShieldAlert className="w-4 h-4 shrink-0" />
                      <span>Smart Nutritional Adaptation</span>
                    </div>
                    <ul className="space-y-2 text-black font-medium leading-relaxed">
                      {isDiabetic && <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-app-orange mt-2 shrink-0" /><span><strong>Low Sugar:</strong> Automatically replaces added sugars with keto-safe/natural replacements in cooking steps.</span></li>}
                      {isHypertensive && <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-app-orange mt-2 shrink-0" /><span><strong>Low Sodium:</strong> Recommends reducing soy sauce volumes and salt by 50% automatically.</span></li>}
                      {allergyList.length > 0 && <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-app-orange mt-2 shrink-0" /><span><strong>Allergen Safe:</strong> Highlighting hazards matching: {allergyList.join(', ')}.</span></li>}
                    </ul>
                  </div>
                );
              }
              return null;
            })()}

            {/* Steps Tabs */}
            <div className="flex flex-col gap-4">
              <div className="flex p-1 bg-[#E8E3DF]/60 backdrop-blur-md rounded-[18px] border border-[#D6CDC4] shadow-inner">
                <button
                  onClick={() => setModalActiveTab('prep')}
                  className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                    modalActiveTab === 'prep' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                  }`}
                >
                  {lang === 'en' ? 'Preparation Rules' : lang === 'id' ? 'Langkah Persiapan' : 'Handa'}
                </button>
                <button
                  onClick={() => setModalActiveTab('cook')}
                  className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                    modalActiveTab === 'cook' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                  }`}
                >
                  {lang === 'en' ? 'Cooking Steps' : lang === 'id' ? 'Langkah Memasak' : 'Luto'}
                </button>
                <button
                  onClick={() => setModalActiveTab('takeaways')}
                  className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                    modalActiveTab === 'takeaways' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                  }`}
                >
                  {lang === 'en' ? 'Key Takeaways' : lang === 'id' ? 'Tips Penting' : 'Key Takeaways'}
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {(() => {
                  let matchedRecipe = recipes.find(r => r.recipeID === activeDetailRecipe.id);
                  // ROBUST FALLBACK: Search in hardcoded RECIPES if prop is empty
                  if (!matchedRecipe) {
                    matchedRecipe = RECIPES.find(r => r.recipeID === activeDetailRecipe.id);
                  }
                  
                  if (!matchedRecipe) return <p className="text-center py-8 text-gray-400">Recipe details not found (ID: {activeDetailRecipe.id})</p>;
                  
                  const steps = modalActiveTab === 'prep' ? matchedRecipe.preCookSteps : 
                                modalActiveTab === 'cook' ? matchedRecipe.cookSteps : 
                                matchedRecipe.keyTakeaways || [];
                  
                  return steps.map((step: any, idx: number) => (
                    modalActiveTab === 'takeaways' ? (
                      <div key={idx} className="bg-white p-5 rounded-[22px] border border-[#E6E1DC] shadow-sm flex flex-col gap-2 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-black text-[#965020] uppercase tracking-[0.15em] opacity-80">
                            {lang === 'en' ? "Chef's Secret Note" : lang === 'id' ? "Tips Rahasia Chef" : "Chef's Secret Note"} #{idx + 1}
                          </span>
                          <button
                            onClick={() => handlePlayVoice(step.text[lang] || step.text['en'])}
                            className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${isPlayingAudio ? 'bg-[#965020] text-white animate-pulse' : 'bg-[#F3A562] text-white hover:scale-105 active:scale-95'}`}
                          >
                            <Volume2 className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                        <p className="text-[15px] text-[#1E293B] leading-[1.6] font-medium font-sans">
                          {step.text[lang] || step.text['en']}
                        </p>
                      </div>
                    ) : (
                      <div key={idx} className="bg-white rounded-2xl border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col group">
                        <div className="relative w-full h-48 bg-[#E6E1DC]">
                          <img
                            alt={`Step ${idx + 1}`}
                            className="w-full h-full object-cover"
                            src={step.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1280'}
                          />
                          <div className="absolute top-3 left-3 bg-white w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-[22px] font-extrabold text-[#965020] leading-none">
                            {idx + 1}
                          </div>
                        </div>

                        <div className="p-5 flex flex-col gap-3">
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex flex-col gap-1 pr-2">
                              <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight">{step.text[lang] || step.text['en']}</h4>
                            </div>
                            
                            <button
                              onClick={() => handlePlayVoice(step.text[lang] || step.text['en'])}
                              className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${isPlayingAudio ? 'bg-[#965020] text-white animate-pulse' : 'bg-[#F3A562] text-white hover:scale-105 active:scale-95'}`}
                            >
                              <Volume2 className="w-5 h-5 fill-current" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  ));
                })()}
              </div>
            </div>

            {/* Quick Assign Action Button */}
            <button
              onClick={() => handleQuickAssign(activeDetailRecipe.id)}
              className="w-full py-5 bg-[#965020] text-white text-[20px] font-black rounded-[24px] shadow-xl hover:bg-[#804218] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer mt-4"
            >
              <ChefHat className="w-6 h-6" />
              <span>Assign to {partnerFullName}</span>
            </button>

          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW FAVORITE RECIPE FORM (加号专属新增) */}
      {isAddFavOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all animate-fadeIn">
          <form onSubmit={handleAddCustomRecipe} className="bg-[#FCF9F2] border border-app-border rounded-[20px] w-full max-w-[420px] max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-4">
            
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[22px] font-bold text-[#965020] flex items-center gap-1.5">
                  <PlusCircle className="w-5 h-5 text-app-orange" />
                  <span>Add Custom Favorite</span>
                </h3>
                <p className="text-[14px] text-app-text-muted mt-0.5">
                  Save a personalized recipe for family member nutritional preferences.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddFavOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-full"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex flex-col gap-3 py-1 border-t border-app-border">
              
              {/* Recipe Title input */}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-app-text-muted uppercase">Recipe Name *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Grandma's Braised Tofu"
                  className="w-full bg-white border border-app-border p-3 rounded-[10px] text-[16px] text-app-text-title focus:outline-none focus:border-app-orange"
                />
              </div>

              {/* Subtitle / Note */}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-app-text-muted uppercase">Short description / description</label>
                <input
                  type="text"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  placeholder="e.g. Super soft, diabetic-friendly low sodium item"
                  className="w-full bg-white border border-app-border p-3 rounded-[10px] text-[16px] text-app-text-title focus:outline-none focus:border-app-orange"
                />
              </div>

              {/* Specific custom image URL input */}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-app-text-muted uppercase">Recipe Image URL (Optional)</label>
                <input
                  type="text"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  placeholder="Paste Unsplash URL or leave empty for default cooking board"
                  className="w-full bg-white border border-app-border p-3 rounded-[10px] text-[16px] text-app-text-title focus:outline-none focus:border-app-orange"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Category */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-app-text-muted uppercase font-sans">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-white border border-app-border p-2.5 rounded-[10px] text-[15px] text-app-text-title focus:outline-none focus:border-app-orange"
                  >
                    <option value="HK Home Style">HK Style</option>
                    <option value="Soups">Soups</option>
                    <option value="Simple Meals">Simple</option>
                  </select>
                </div>

                {/* Tag */}
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-app-text-muted uppercase font-sans">Tag / Preference</label>
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="w-full bg-white border border-app-border p-2.5 rounded-[10px] text-[15px] text-app-text-title focus:outline-none focus:border-app-orange"
                  >
                    <option value="Low Sugar">Low Sugar</option>
                    <option value="Low Sodium">Low Sodium</option>
                    <option value="Quick">Quick Option</option>
                    <option value="Healthy">Healthy Choice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[14px] font-bold text-app-text-muted uppercase font-sans">Estimated Calories</label>
                  <input
                    type="number"
                    value={newCals}
                    onChange={(e) => setNewCals(e.target.value)}
                    placeholder="250"
                    className="w-full bg-white border border-app-border p-2.5 rounded-[10px] text-[15px] focus:outline-none focus:border-app-orange"
                  />
                </div>
                <div className="flex flex-col gap-1 justify-end pb-1 text-[13px] text-app-text-muted">
                  <span>Optional. Displayed as a nutritional reference metric.</span>
                </div>
              </div>

              {/* Ingredients list */}
              <div className="flex flex-col gap-1">
                <label className="text-[14px] font-bold text-app-text-muted uppercase">Ingredients (comma separated)</label>
                <textarea
                  value={newIngs}
                  onChange={(e) => setNewIngs(e.target.value)}
                  placeholder="300g Silken Tofu, 2 garlic cloves, 1 tbsp light soy sauce, green onions"
                  rows={2}
                  className="w-full bg-white border border-app-border p-3 rounded-[10px] text-[15px] focus:outline-none focus:border-app-orange"
                />
              </div>

            </div>

            <button
              type="submit"
              className="w-full h-12 bg-[#965020] text-white hover:bg-[#804218] font-bold rounded-[12px] flex items-center justify-center gap-1 text-[17px] cursor-pointer mt-2 shadow"
            >
              <Plus className="w-4 h-4 text-white" strokeWidth={3} />
              <span>Save & Add to Favorites</span>
            </button>

          </form>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 animate-fadeIn">
          <div className="absolute top-6 right-6 flex gap-4">
            <button 
              onClick={() => setShowImageModal(false)}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="max-w-4xl w-full flex flex-col gap-4">
            <h3 className="text-white text-[24px] font-bold text-center mb-2">{modalTitle}</h3>
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={modalImage} 
                alt="Preview" 
                className="w-full max-h-[70vh] object-contain"
              />
            </div>
            
            <div className="flex justify-center gap-3 mt-4">
              {task?.prepImageUrl && (
                <button 
                  onClick={() => {
                    setModalImage(task.prepImageUrl!);
                    setModalTitle('Preparation Submission');
                  }}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${modalTitle === 'Preparation Submission' ? 'bg-app-orange text-[#444444]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Preparation Photo
                </button>
              )}
              {task?.cookImageUrl && (
                <button 
                  onClick={() => {
                    setModalImage(task.cookImageUrl!);
                    setModalTitle('Final Dish Submission');
                  }}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${modalTitle === 'Final Dish Submission' ? 'bg-app-orange text-[#444444]' : 'bg-white/10 text-white hover:bg-white/20'}`}
                >
                  Cooking Photo
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
