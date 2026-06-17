import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingBasket, Lock, Unlock, UtensilsCrossed, ArrowRight, ShieldAlert, Trash, Trash2, CheckCircle } from 'lucide-react';
import { Task, Language, Recipe } from '../types';
import { RECIPES } from '../recipesData';

interface HelperDashboardProps {
  task: Task | null;
  allTasks?: Task[];
  recipes: Recipe[];
  lang: Language;
  onNavigate: (view: string) => void;
  onConfirmStep?: (type: 'pre' | 'cook', stepID: number, isFinish: boolean) => void;
  userFullName?: string | null;
  onRefreshData: () => void;
  onDeleteTask: (taskId: string) => void;
}

// Translations for Today view elements based on language preferences
const GREETINGS = {
  en: {
    greeting: 'Good Morning',
    subtitle: 'Here is your main task for today.',
    progressLabel: 'Preparation Progress',
    todayMeal: "Today's Meal",
    lowSodium: 'Low Sodium',
    sirsFav: "Sir's Favorite",
    startPrep: 'START',
    ingredientsReady: 'Ingredients Ready',
    nextStepLocked: 'Next Step Locked',
    nextStepCook: 'Next Step: Cook',
    noTaskTitle: 'No assigned menu today',
    noTaskDesc: 'Please wait for your employer to plan and publish meal roadmap.',
    finishedTask: 'Finished task',
    finished: 'Finished',
  },
  id: {
    greeting: 'Selamat Pagi',
    subtitle: 'Ini adalah tugas utama Anda hari ini.',
    progressLabel: 'Progres Persiapan',
    todayMeal: 'Sajian Hari Ini',
    lowSodium: 'Rendah Garam',
    sirsFav: 'Favorit Tuan',
    startPrep: 'MULAI',
    ingredientsReady: 'Bahan-Bahan Siap',
    nextStepLocked: 'Langkah Terkunci',
    nextStepCook: 'Langkah Selanjutnya',
    noTaskTitle: 'Belum ada menu hari ini',
    noTaskDesc: 'Harap tunggu majikan Anda menugaskan resep hidangan sehat harian.',
    finishedTask: 'Tugas Selesai',
    finished: 'Selesai',
  },
  tg: {
    greeting: 'Magandang Umaga',
    subtitle: 'Narito ang iyong pangunahing gawain para sa araw na ito.',
    progressLabel: 'Progres ng Paghahanda',
    todayMeal: 'Ulam Ngayong Araw',
    lowSodium: 'Mababang Sodium',
    sirsFav: 'Paborito ni Sir',
    startPrep: 'SIMULAN',
    ingredientsReady: 'Handa na ang Sangkap',
    nextStepLocked: 'Susunod Naka-lock',
    nextStepCook: 'Susunod na Hakbang',
    noTaskTitle: 'Walang nakatalagang menu ngayon',
    noTaskDesc: 'Mangyaring maghintay para sa iyong employer na magplano at mag-publish ng roadmap ng pagkain.',
    finishedTask: 'Tapos na ang gawain',
    finished: 'Tapos na',
  }
};

// Map custom warning tags per active dish recipe to enforce artisanal feel
function getRecipeDetails(recipeID: string, lang: Language, def: typeof GREETINGS['en']) {
  switch (recipeID) {
    case 'cantonese-steamed-fish':
      return {
        title: lang === 'en' ? 'Steamed Fish with Ginger' : lang === 'id' ? 'Ikan Kukus Jahe' : 'Steamed Fish na may Luya',
        warnTag: `⚠ ${def.lowSodium}`,
        favTag: def.sirsFav,
        warnClass: 'bg-app-tag-warn text-[#444444]',
        favClass: 'bg-app-tag-norm text-[#666666]'
      };
    case 'tomato-egg-stir-fry':
      return {
        title: lang === 'en' ? 'Tomato & Egg Stir-fry' : lang === 'id' ? 'Orak-arik Telur Tomat' : 'Tomato at Egg Stir-fry',
        warnTag: `⚠ ${lang === 'en' ? 'Low Sugar' : lang === 'id' ? 'Rendah Gula' : 'Mababang Gula'}`,
        favTag: lang === 'en' ? "Kid's Favorite" : lang === 'id' ? 'Suka Anak' : 'Paborito ng Bata',
        warnClass: 'bg-app-tag-warn text-[#444444]',
        favClass: 'bg-[#E3EBFD] text-blue-700'
      };
    case 'garlic-bok-choy':
      return {
        title: lang === 'en' ? 'Garlic Bok Choy' : lang === 'id' ? 'Bok Choy Tumis Bawang' : 'Garlic Bok Choy',
        warnTag: `⚠ ${lang === 'en' ? 'Low Carb' : lang === 'id' ? 'Rendah Karbo' : 'Low Carb'}`,
        favTag: lang === 'en' ? 'Healthy fiber' : lang === 'id' ? 'Serat Sehat' : 'Healthy fiber',
        warnClass: 'bg-app-tag-warn text-[#444444]',
        favClass: 'bg-app-tag-norm text-[#666666]'
      };
    default:
      return {
        title: lang === 'en' ? 'Sweet & Sour Pork' : lang === 'id' ? 'Babi Asam Manis' : 'Sweet & Sour Pork',
        warnTag: `⚠ ${lang === 'en' ? 'High Protein' : lang === 'id' ? 'Protein Tinggi' : 'High Protein'}`,
        favTag: def.sirsFav,
        warnClass: 'bg-app-tag-warn text-[#444444]',
        favClass: 'bg-[#F2EDFF] text-purple-700'
      };
  }
}

export function HelperDashboard({ task, allTasks = [], recipes: propRecipes, lang, onNavigate, onConfirmStep, userFullName, onRefreshData, onDeleteTask }: HelperDashboardProps) {
  // Robustness: fallback to RECIPES constant if prop is empty
  const recipes = propRecipes && propRecipes.length > 0 ? propRecipes : RECIPES;
  const currentRecipe = task ? (recipes.find(r => r.recipeID === task.recipeID) || {
    recipeID: task.recipeID,
    title: { en: 'Active Cooking Task', id: 'Tugas Memasak Aktif', tg: 'Active Cooking Task' },
    description: { en: 'Custom assigned meal', id: 'Masakan yang ditugaskan', tg: 'Custom assigned meal' },
    preCookSteps: [],
    cookSteps: [],
    materialList: [],
    toolList: [],
    category: 'Custom',
    tags: []
  }) : null;
  const labels = GREETINGS[lang] || GREETINGS.en;

  const getDynamicGreeting = (baseGreeting: string, currentLang: Language) => {
    const hour = new Date().getHours();
    let timeOfDayEn = 'Morning';
    let timeOfDayId = 'Pagi';
    let timeOfDayTg = 'Umaga';

    if (hour >= 12 && hour < 17) {
      timeOfDayEn = 'Afternoon';
      timeOfDayId = 'Siang';
      timeOfDayTg = 'Hapon';
    } else if (hour >= 17 || hour < 5) {
      timeOfDayEn = 'Evening';
      timeOfDayId = 'Sore';
      timeOfDayTg = 'Gabi';
    }

    let greeting = baseGreeting;
    if (currentLang === 'en') greeting = baseGreeting.replace('Morning', timeOfDayEn);
    if (currentLang === 'id') greeting = baseGreeting.replace('Pagi', timeOfDayId);
    if (currentLang === 'tg') greeting = baseGreeting.replace('Umaga', timeOfDayTg);

    if (userFullName) {
      return `${greeting}, ${userFullName}`;
    }
    return greeting;
  };

  const displayGreeting = getDynamicGreeting(labels.greeting, lang);

  // Visual local state to track dynamic progress bar changes and Next Step unlocking interaction
  const [localProgress, setLocalProgress] = useState<number>(0);
  const [isPrepping, setIsPrepping] = useState<boolean>(false);
  const [showAllFinishedTasks, setShowAllFinishedTasks] = useState<boolean>(false);

  const getRecipeImage = (id?: string) => {
    if (!id) return '';
    const r = recipes.find(x => x.recipeID === id);
    if (r?.image) return r.image;
    if (r?.preCookSteps?.[0]?.image) return r.preCookSteps[0].image;
    switch (id) {
      case 'steamed-garlic-chicken': return '/recipes/garlic_soy_chicken.png';
      case 'tomato-egg-stir-fry': return '/recipes/tomato_egg_main_v4.jpg';
      case 'cantonese-steamed-fish': return '/recipes/steamed_fish_main_v2.jpg';
      case 'garlic-bok-choy': return '/recipes/garlic_bok_choy_main.png';
      default: return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c';
    }
  };

  // Sync with actual database states on load
  useEffect(() => {
    if (task) {
      if (task.taskStatus === 'preparing') {
        setLocalProgress(Math.round(task.preCookFinishRate / 2));
      } else if (task.taskStatus === 'pre_cook_completed') {
        setLocalProgress(50);
      } else if (task.taskStatus === 'prep_approved' || task.taskStatus === 'cooking_ongoing') {
        setLocalProgress(50 + Math.round(task.cookFinishRate / 2));
      } else if (task.taskStatus === 'completed') {
        setLocalProgress(95);
      } else if (task.taskStatus === 'ai_checked') {
        setLocalProgress(100);
      } else if (task.taskStatus === 'dish_approved' || task.taskStatus === 'rated') {
        setLocalProgress(100);
      } else if (task.taskStatus === 'prep_rejected' || task.taskStatus === 'dish_rejected') {
        setLocalProgress(0);
      }
    }
  }, [task?.preCookFinishRate, task?.cookFinishRate, task?.taskStatus]);

  // Click on start preparation animations trigger
  const handleStartPreparation = () => {
    if (!task) return;
    onNavigate('task-execution');
  };

  const currentDetails = currentRecipe ? getRecipeDetails(currentRecipe.recipeID, lang, labels) : null;
  // Next step unlocked ONLY when employer approves or cooking is ongoing/completed
  const isNextStepUnlocked = task && (task.taskStatus === 'prep_approved' || task.taskStatus === 'cooking_ongoing' || task.taskStatus === 'completed');

  return (
    <div className="flex flex-col gap-[28px] animate-fadeIn w-full max-w-[480px] mx-auto pb-12">
      
      {/* Greetings Title Segment (Double line, 8px gap) */}
      <section className="flex flex-col gap-2 mt-2">
        <h1 className="text-[32px] md:text-[34px] font-bold text-app-text-title leading-tight tracking-tight flex items-baseline gap-2">
          {displayGreeting}
          {/* Removed debug tag */}
        </h1>
        <p className="text-[14px] font-normal text-app-text-muted leading-relaxed">
          {labels.subtitle}
        </p>
      </section>

      {/* Rejection Alert */}
      {task && (task.taskStatus === 'prep_rejected' || task.taskStatus === 'dish_rejected') && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>{lang === 'en' ? 'Task Rejected' : 'Tugas Ditolak'}</span>
          </div>
          <p className="text-red-700 text-[14px]">
            {lang === 'en' 
              ? 'The employer has rejected the current progress. Please restart the preparation and cooking stages as requested.' 
              : 'Majikan telah menolak progres saat ini. Silakan ulangi tahap persiapan dan memasak sesuai permintaan.'}
          </p>
        </div>
      )}

      {/* Main Recipe Meal Card */}
      {task && currentRecipe && currentDetails ? (
        <div className="flex flex-col gap-[28px]">
          
          {/* Card Body */}
          <div className="bg-white border border-app-border rounded-[14px] pt-[32px] pb-[32px] pl-[28px] pr-[28px] shadow-sm flex flex-col gap-6">
            
            {/* Top row: tags and tableware */}
            <div className="flex justify-between items-center">
              <span className="bg-app-tag-blue text-[#444444] rounded-[14px] px-4 py-1 text-[14px] font-normal">
                {labels.todayMeal}
              </span>
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-10 h-10 text-app-orange" strokeWidth={1.5} />
                <button
                  onClick={() => {
                    if (confirm(lang === 'en' ? 'Are you sure you want to delete this task? This cannot be undone.' : 'Yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan.')) {
                      onDeleteTask(task!.taskID);
                    }
                  }}
                  title="Delete task permanently"
                  className="p-1.5 text-gray-400 hover:text-red-500 bg-white hover:bg-gray-50 rounded-xl border border-gray-200 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Dish Title (34px Bold) */}
            <h2 className="text-[28px] font-bold text-app-text-title leading-tight">
              {currentDetails.title}
            </h2>

            {/* Progress Row Container */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[16px] font-normal text-app-text-title">
                  {task.taskStatus === 'pre_cook_completed' 
                    ? (lang === 'en' ? 'Preparation completed and pending for evaluation' : 'Persiapan selesai dan menunggu evaluasi')
                    : task.taskStatus === 'completed'
                    ? (lang === 'en' ? 'Pending for evaluation from the employer' : 'Menunggu evaluasi dari majikan')
                    : (task.taskStatus === 'ai_checked' || task.taskStatus === 'dish_approved' || task.taskStatus === 'rated')
                    ? (lang === 'en' ? 'Preparation and Cooking Completed' : 'Persiapan dan Memasak Selesai')
                    : labels.progressLabel}
                </span>
                <span className={`font-bold text-[16px] font-mono ${(localProgress === 100 || task.taskStatus === 'pre_cook_completed' || task.taskStatus === 'completed') ? 'text-green-600' : 'text-app-orange'}`}>
                  {localProgress}%
                </span>
              </div>
              
            {/* Progress track */}
            <div className="w-full bg-[#EEEEEE] h-[10px] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${(localProgress === 100 || task.taskStatus === 'pre_cook_completed' || task.taskStatus === 'completed') ? 'bg-green-500' : 'bg-app-orange'}`}
                style={{ width: `${localProgress}%` }}
              />
            </div>

            </div>
          </div>

          {/* START PREPARATION Main Orange Button (88px Height, 28px text) */}
          <button
            onClick={() => {
              if (task.taskStatus === 'preparing' || task.taskStatus === 'prep_rejected' || task.taskStatus === 'dish_rejected' || (task.taskStatus === 'pre_cook_completed' && !task.prepImageUrl)) {
                onNavigate('task-execution');
              } else if (task.taskStatus === 'prep_approved' || task.taskStatus === 'cooking_ongoing') {
                onNavigate('task-execution');
              } else if (task.taskStatus === 'rated') {
                if (onDeleteTask) onDeleteTask(task.taskID);
              }
            }}
            disabled={isPrepping || (task.taskStatus === 'pre_cook_completed' && !!task.prepImageUrl) || task.taskStatus === 'ai_checked' || task.taskStatus === 'completed'}
            className={`w-full h-[88px] transition-all rounded-[14px] flex items-center justify-center gap-3.5 shadow-sm text-[16px] font-bold text-[#444444] cursor-pointer disabled:opacity-80 ${((task.taskStatus === 'pre_cook_completed' && !!task.prepImageUrl) || task.taskStatus === 'ai_checked' || task.taskStatus === 'completed') ? 'bg-gray-200' : 'bg-app-orange hover:bg-orange-400 active:scale-[0.98]'}`}
          >
            {((task.taskStatus === 'pre_cook_completed' && !!task.prepImageUrl) || task.taskStatus === 'ai_checked' || task.taskStatus === 'completed') ? (
              <span>{lang === 'en' ? 'WAITING FOR APPROVAL' : 'MENUNGGU PERSETUJUAN'}</span>
            ) : (task.taskStatus === 'pre_cook_completed' && !task.prepImageUrl) ? (
              <span className="flex items-center gap-2">
                <CloudUpload className="w-6 h-6" />
                <span>{lang === 'en' ? 'UPLOAD PREP PHOTO' : 'UNGGAH FOTO PERSIAPAN'}</span>
              </span>
            ) : task.taskStatus === 'rated' ? (
              <span className="flex items-center gap-2">
                <CheckCircle className="w-8 h-8" />
                <span>{lang === 'en' ? 'TASK COMPLETE (Click to remove)' : 'TUGAS SELESAI (Klik untuk hapus)'}</span>
              </span>
            ) : (
              <>
                <span>▶</span>
                <span>{isPrepping ? '...' : labels.startPrep}</span>
              </>
            )}
          </button>


        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-app-border rounded-[14px] py-12 px-6 text-center flex flex-col items-center justify-center gap-4 mt-[50px] shadow-sm">
          <ChefHat className="w-16 h-16 text-gray-300 stroke-1" />
          <h2 className="text-[14px] font-bold text-app-text-title leading-snug">
            {labels.noTaskTitle}
          </h2>
          <p className="text-[16px] text-app-text-muted leading-relaxed max-w-[280px]">
            {labels.noTaskDesc}
          </p>
        </div>
      )}

      {/* Finished Tasks Section */}
      {allTasks.filter(t => t.taskStatus === 'rated').length > 0 && (
        <section className="flex flex-col gap-3 mt-4">
          <div 
            className="flex justify-between items-center cursor-pointer hover:opacity-80 transition-opacity bg-white p-3 rounded-[14px] border border-app-border shadow-sm"
            onClick={() => setShowAllFinishedTasks(!showAllFinishedTasks)}
          >
            <span className="text-[16px] font-bold text-app-text-title uppercase tracking-wider flex items-center gap-2">
              {lang === 'en' ? 'Finished Tasks' : 'Tugas Selesai'}
              <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                {allTasks.filter(t => t.taskStatus === 'rated').length}
              </span>
            </span>
            <div className="flex items-center gap-4">
              <span 
                className="text-sm text-red-500 font-bold hover:underline"
                onClick={(e) => {
                  e.stopPropagation();
                  const finishedTasks = allTasks.filter(t => t.taskStatus === 'rated');
                  if (finishedTasks.length > 0 && confirm(lang === 'en' ? 'Are you sure you want to clear all finished tasks?' : 'Yakin ingin menghapus semua tugas yang sudah selesai?')) {
                    finishedTasks.forEach(t => onDeleteTask(t.taskID));
                  }
                }}
              >
                {lang === 'en' ? 'Clear' : 'Hapus Semua'}
              </span>
              <span className="text-sm text-app-orange font-bold">
                {showAllFinishedTasks ? (lang === 'en' ? 'Collapse' : 'Tutup') : (lang === 'en' ? 'Expand' : 'Buka')}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-3 relative">
            {allTasks.filter(t => t.taskStatus === 'rated')
              .slice(0, showAllFinishedTasks ? undefined : 1)
              .map((finishedTask, index) => {
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
                      <h3 className="text-[16px] font-bold text-gray-600 leading-tight line-clamp-1 pr-2">
                        {fRecipe.title[lang] || fRecipe.title['en']}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="bg-[#E2DDD5] text-[#444444] py-0.5 px-2 rounded-md text-[11px] font-bold shadow-sm border border-[#D5CDC4]">
                          {lang === 'en' ? 'Finished' : 'Selesai'}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(lang === 'en' ? 'Are you sure you want to delete this finished task?' : 'Yakin ingin menghapus tugas yang sudah selesai ini?')) {
                              onDeleteTask(finishedTask.taskID);
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors shrink-0"
                          title="Delete finished task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
    </div>
  );
}
