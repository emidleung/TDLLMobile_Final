import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingBasket, Lock, Unlock, UtensilsCrossed, ArrowRight, ShieldAlert, Trash } from 'lucide-react';
import { Task, Language, Recipe } from '../types';
import { RECIPES } from '../recipesData';

interface HelperDashboardProps {
  task: Task | null;
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
    greeting: 'Good Morning, Maria',
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
    noTaskDesc: 'Please wait for your employer Sarah to plan and publish of meal roadmap.',
    finishedTask: 'Finished task',
    finished: 'Finished',
  },
  id: {
    greeting: 'Selamat Pagi, Maria',
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
    greeting: 'Magandang Umaga, Maria',
    subtitle: 'Narito ang iyong pangunahing gawain para sa araw na ito.',
    progressLabel: 'Progres ng Paghahanda',
    todayMeal: 'Ulam Ngayong Araw',
    lowSodium: 'Mababang Sodium',
    sirsFav: 'Paborito ni Sir',
    startPrep: 'SIMULAN',
    ingredientsReady: 'Handa na ang Sangkap',
    nextStepLocked: 'Susunod Naka-lock',
    nextStepCook: 'Susunod na Hakbang',
    noTaskTitle: 'Walang nakatalagang ulam ngayon',
    noTaskDesc: 'Mangyaring maghintay para sa iyong employer upang mag-publish ng meal plan ngayon.',
    finishedTask: 'Tapos na gawain',
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

export function HelperDashboard({ task, recipes: propRecipes, lang, onNavigate, onConfirmStep, userFullName, onRefreshData, onDeleteTask }: HelperDashboardProps) {
  // Robustness: fallback to RECIPES constant if prop is empty
  const recipes = propRecipes && propRecipes.length > 0 ? propRecipes : RECIPES;
  const currentRecipe = task ? recipes.find(r => r.recipeID === task.recipeID) : null;
  const labels = GREETINGS[lang] || GREETINGS.en;

  const getDynamicGreeting = (baseGreeting: string, currentLang: Language) => {
    const hour = new Date().getHours();
    let timeOfDayEn = 'Morning';
    let timeOfDayId = 'Pagi';
    let timeOfDayTg = 'Umaga';

    if (hour >= 12 && hour < 18) {
      timeOfDayEn = 'Afternoon';
      timeOfDayId = 'Siang';
      timeOfDayTg = 'Hapon';
    } else if (hour >= 18) {
      timeOfDayEn = 'Evening';
      timeOfDayId = 'Malam';
      timeOfDayTg = 'Gabi';
    }

    if (currentLang === 'en') return baseGreeting.replace('Morning', timeOfDayEn);
    if (currentLang === 'id') return baseGreeting.replace('Pagi', timeOfDayId);
    if (currentLang === 'tg') return baseGreeting.replace('Umaga', timeOfDayTg);
    return baseGreeting;
  };

  const displayGreeting = userFullName 
    ? getDynamicGreeting(labels.greeting, lang).replace(/Maria/g, userFullName)
    : getDynamicGreeting(labels.greeting, lang);

  // Visual local state to track dynamic progress bar changes and Next Step unlocking interaction
  const [localProgress, setLocalProgress] = useState<number>(0);
  const [isPrepping, setIsPrepping] = useState<boolean>(false);

  // Sync with actual database states on load
  useEffect(() => {
    if (task) {
      if (task.taskStatus === 'preparing') {
        setLocalProgress(Math.round(task.preCookFinishRate / 2));
      } else if (task.taskStatus === 'pre_cook_completed') {
        setLocalProgress(50);
      } else if (task.taskStatus === 'prep_approved' || task.taskStatus === 'cooking_ongoing') {
        setLocalProgress(50 + Math.round(task.cookFinishRate / 2));
      } else if (task.taskStatus === 'completed' || task.taskStatus === 'ai_checked' || task.taskStatus === 'dish_approved' || task.taskStatus === 'rated') {
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
        <h1 className="text-[38px] md:text-[40px] font-bold text-app-text-title leading-tight tracking-tight flex items-baseline gap-2">
          {displayGreeting}
          {/* Removed debug tag */}
        </h1>
        <p className="text-[20px] font-normal text-app-text-muted leading-relaxed">
          {labels.subtitle}
        </p>
      </section>

      {/* Rejection Alert */}
      {task && task.taskStatus === 'prep_rejected' && (
        <div className="bg-red-50 border border-red-200 rounded-[14px] p-4 flex flex-col gap-2 animate-bounce">
          <div className="flex items-center gap-2 text-red-600 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>{lang === 'en' ? 'Task Rejected' : 'Tugas Ditolak'}</span>
          </div>
          <p className="text-red-700 text-[16px]">
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
              <span className="bg-app-tag-blue text-[#444444] rounded-[14px] px-4 py-1 text-[20px] font-normal">
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
                  className="w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-90 border-2 border-white transition-all"
                >
                  <span className="text-[20px]">🗑️</span>
                </button>
              </div>
            </div>

            {/* Dish Title (34px Bold) */}
            <h2 className="text-[34px] font-bold text-app-text-title leading-tight">
              {currentDetails.title}
            </h2>

            {/* Progress Row Container */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-baseline">
                <span className="text-[22px] font-normal text-app-text-title">
                  {task.taskStatus === 'pre_cook_completed' 
                    ? (lang === 'en' ? 'Preparation completed and pending for evaluation' : 'Persiapan selesai dan menunggu evaluasi')
                    : (task.taskStatus === 'completed' || task.taskStatus === 'ai_checked' || task.taskStatus === 'rated')
                    ? (lang === 'en' ? 'Preparation and Cooking Completed' : 'Persiapan dan Memasak Selesai')
                    : labels.progressLabel}
                </span>
                <span className={`font-bold text-[28px] font-mono ${(localProgress === 100 || task.taskStatus === 'pre_cook_completed') ? 'text-green-600' : 'text-app-orange'}`}>
                  {localProgress}%
                </span>
              </div>
              
            {/* Progress track */}
            <div className="w-full bg-[#EEEEEE] h-[10px] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 rounded-full ${(localProgress === 100 || task.taskStatus === 'pre_cook_completed') ? 'bg-green-500' : 'bg-app-orange'}`}
                style={{ width: `${localProgress}%` }}
              />
            </div>

            </div>
          </div>

          {/* START PREPARATION Main Orange Button (88px Height, 28px text) */}
          <button
            onClick={handleStartPreparation}
            disabled={isPrepping || task.taskStatus === 'pre_cook_completed' || task.taskStatus === 'ai_checked'}
            className={`w-full h-[88px] transition-all rounded-[14px] flex items-center justify-center gap-3.5 shadow-sm text-[28px] font-bold text-[#444444] cursor-pointer disabled:opacity-80 ${(task.taskStatus === 'pre_cook_completed' || task.taskStatus === 'ai_checked') ? 'bg-gray-200' : 'bg-app-orange hover:bg-orange-400 active:scale-[0.98]'}`}
          >
            {(task.taskStatus === 'pre_cook_completed' || task.taskStatus === 'ai_checked') ? (
              <span>{lang === 'en' ? 'WAITING FOR APPROVAL' : 'MENUNGGU PERSETUJUAN'}</span>
            ) : task.taskStatus === 'dish_approved' || task.taskStatus === 'rated' ? (
              <span className="text-green-700">{lang === 'en' ? 'TASK COMPLETED' : 'TUGAS SELESAI'}</span>
            ) : (
              <>
                <span>▶</span>
                <span>{isPrepping ? '...' : labels.startPrep}</span>
              </>
            )}
          </button>


        </div>
      ) : task && task.taskStatus === 'completed' && currentRecipe && currentDetails ? (
        <div className="flex flex-col gap-4 mt-4">
          <h2 className="text-[24px] font-bold text-app-text-title">{labels.finishedTask}</h2>
          <div className="bg-white border border-app-border rounded-[14px] pt-[32px] pb-[32px] pl-[28px] pr-[28px] shadow-sm flex flex-col gap-6 opacity-70">
            <div className="flex justify-between items-center">
              <span className="bg-green-100 text-green-800 rounded-[14px] px-4 py-1 text-[20px] font-bold">
                {labels.finished}
              </span>
              <UtensilsCrossed className="w-10 h-10 text-app-orange" strokeWidth={1.5} />
            </div>
            <h2 className="text-[34px] font-bold text-app-text-title leading-tight line-through">
              {currentDetails.title}
            </h2>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white border border-app-border rounded-[14px] py-12 px-6 text-center flex flex-col items-center justify-center gap-4 mt-[50px] shadow-sm">
          <ChefHat className="w-16 h-16 text-gray-300 stroke-1" />
          <h2 className="text-[24px] font-bold text-app-text-title leading-snug">
            {labels.noTaskTitle}
          </h2>
          <p className="text-[18px] text-app-text-muted leading-relaxed max-w-[280px]">
            {labels.noTaskDesc}
          </p>
        </div>
      )}
    </div>
  );
}
