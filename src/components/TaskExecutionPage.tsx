import React, { useState, useEffect } from 'react';
import { ShieldCheck, Play, ArrowLeft, ArrowRight, Lock, Sparkles, MessageSquare, Volume2, Mic, CheckCircle, Clock, UtensilsCrossed, Check, CloudUpload } from 'lucide-react';
import { Task, Language, RecipeStep, Recipe } from '../types';
import { RECIPES } from '../recipesData';

interface TaskExecutionPageProps {
  task: Task;
  recipe?: Recipe;
  lang: Language;
  onConfirmStep: (type: 'pre' | 'cook', stepId: number, isFinish: boolean) => void;
  onNavigate: (view: string) => void;
  onRefreshData: () => void;
}

export function TaskExecutionPage({ task, recipe: propRecipe, lang, onConfirmStep, onNavigate, onRefreshData }: TaskExecutionPageProps) {
  // Robustness: find the recipe if not provided as prop
  const recipe = propRecipe || RECIPES.find(r => r.recipeID === task.recipeID);
  
  const [activeTab, setActiveTab] = useState<'pre' | 'cook'>('pre');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [showOverview, setShowOverview] = useState<boolean>(task.currentPreStepIndex === 0 && task.preCookFinishRate === 0);
  const [showCookOverview, setShowCookOverview] = useState<boolean>(task.currentCookStepIndex === 0 && task.cookFinishRate === 0);
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});
  const [stepSuccessMessage, setStepSuccessMessage] = useState<string | null>(null);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

  const handleIngredientToggle = (idx: number) => {
    setCheckedIngredients(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleConfirmStep = (type: 'pre' | 'cook', stepId: number) => {
    setStepSuccessMessage("Great job! Let's move to the next step.");
    setTimeout(() => {
      setStepSuccessMessage(null);
      onConfirmStep(type, stepId, true);
    }, 2000);
  };

  // Auto-switch tabs based on completion rate
  useEffect(() => {
    if ((task.taskStatus === 'cooking_ongoing' || task.taskStatus === 'completed' || task.taskStatus === 'ai_checked' || task.taskStatus === 'rated') && task.cookFinishRate < 100) {
      setActiveTab('cook');
    }
  }, [task.taskStatus, task.cookFinishRate]);

  const standardPreSteps = (task.adjustedPreSteps && task.adjustedPreSteps.length > 0) ? task.adjustedPreSteps : (recipe?.preCookSteps || []);
  const customPreStepsObjects = task.customPreSteps.map((text, idx) => ({
    id: standardPreSteps.length + idx + 1,
    text: {
      en: text,
      id: text,
      tg: text
    },
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgL9HdVqVTd3rN0858gr-CmnbshY3FPcXbFW0VDaNxi-kzx3o9QJll0A5QG2gHHhUj0gJ91mycpQ-Gm1BQ8C9vF9IF81Aj0_A6tYTQ5GKYsUhev0hIBubciUhOqvHbGKqLKVqZxDbGbaROBnp6iFFGbzQHET6lQMfqPZh2i-FTJamZN8FWyuKhU4AWwn-LifMfbAIuSiVWQe-ZrshNq6eeFK86RoB6epwXGClCOC67kE9qWZzdK_oXFpyoAJleJOZuAWzDxRA6g'
  }));
  const allPreSteps = [...standardPreSteps, ...customPreStepsObjects];
  const allCookSteps = (task.adjustedCookSteps && task.adjustedCookSteps.length > 0) ? task.adjustedCookSteps : (recipe?.cookSteps || []);

  const currentStepIndex = activeTab === 'pre' ? task.currentPreStepIndex : task.currentCookStepIndex;
  const currentStepsList = activeTab === 'pre' ? allPreSteps : allCookSteps;
  const totalStepsCount = currentStepsList.length;

  const isCurrentTabDone = currentStepIndex >= totalStepsCount;
  const currentStep = !isCurrentTabDone ? currentStepsList[currentStepIndex] : null;

  // TTS Read-aloud trigger
  const handlePlayVoice = (text: string) => {
    setIsPlayingAudio(true);
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'en' ? 'en-US' : lang === 'id' ? 'id-ID' : 'tl-PH';
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 2405);
    }
  };

  const percentProgress = Math.round((currentStepIndex / (totalStepsCount || 1)) * 100);

  return (
    <div className="flex flex-col animate-fadeIn w-full max-w-2xl mx-auto pb-24 bg-[#F9F7F5] min-h-screen font-sans">
      
      {/* Header Section */}

        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  if (activeTab === 'cook' && !showCookOverview && task.cookFinishRate === 0) {
                    setShowCookOverview(true);
                  } else if (activeTab === 'pre' && !showOverview && task.preCookFinishRate === 0) {
                    setShowOverview(true);
                  } else {
                    onNavigate('dashboard');
                  }
                }}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-[#E8E3DF] text-[#5C4D43] hover:bg-[#D6CDC4] transition-colors cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <h1 className="text-[26px] font-extrabold text-[#1E293B] leading-tight m-0">
                  {recipe?.title[lang] || (lang === 'en' ? 'Cooking Task' : lang === 'id' ? 'Tugas Memasak' : 'Gawaing Pagluluto')}
                </h1>
              </div>
            </div>

            {recipe?.keyTakeaways && recipe.keyTakeaways.length > 0 && (
              <button 
                onClick={() => setShowTips(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-[#965020] hover:bg-orange-200 transition-colors cursor-pointer shrink-0"
                title={lang === 'en' ? 'Key Takeaways' : lang === 'id' ? 'Poin Penting' : 'Key Takeaways'}
              >
                <Sparkles className="w-5 h-5 fill-current" />
              </button>
            )}
          </div>
          

          <div className="flex gap-2">
            <span className="px-3 py-1 bg-[#E8E3DF] text-[#5C4D43] text-[13px] rounded-full flex items-center gap-1.5 font-semibold">
              <Clock className="w-4 h-4" />
              {recipe?.prepTime || 20} {lang === 'en' ? 'Mins' : lang === 'id' ? 'Mnt' : 'Min'}
            </span>
            <span className="px-3 py-1 bg-[#E8E3DF] text-[#5C4D43] text-[13px] rounded-full flex items-center gap-1.5 font-semibold">
              <UtensilsCrossed className="w-8 h-8 text-app-orange" />
              {recipe?.tags?.[0] || 'Healthy'}
            </span>
          </div>
        </div>

        <div className="px-4 flex flex-col gap-6">
        
        {/* ============================================================== */}
        {/* PREPARATION TAB */}
        {/* ============================================================== */}
        {activeTab === 'pre' && (
          <>
            {showOverview ? (
              <div className="bg-white rounded-xl border border-[#E6E1DC] overflow-hidden shadow-sm relative">
                <div className="absolute top-4 right-5 text-[80px] font-black text-[#F0EBE6] leading-none select-none z-0 tracking-tighter">
                  1
                </div>
                
                <div className="p-6 relative z-10">
                  <h2 className="text-[12px] font-extrabold tracking-widest text-[#5C4D43] uppercase mb-1">
                    STAGE 1
                  </h2>
                  <h3 className="text-[24px] font-bold text-[#1E293B] mb-6">
                    Preparation
                  </h3>

                  {recipe?.image && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-[#E6E1DC] shadow-sm">
                      <img src={recipe.image} alt={recipe.title[lang]} className="w-full h-40 object-cover" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-5 mb-8">
                    {recipe?.materialList.map((item, idx) => (
                      <label key={idx} className="flex items-start gap-4 cursor-pointer group">
                        <div className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border-[2px] transition-colors relative ${checkedIngredients[idx] ? 'bg-[#965020] border-[#965020]' : 'border-[#A89885] group-hover:border-[#965020]'}`}>
                          <input type="checkbox" className="absolute opacity-0 cursor-pointer" checked={!!checkedIngredients[idx]} onChange={() => handleIngredientToggle(idx)} />
                          {checkedIngredients[idx] && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                        </div>
                        <span className={`text-[16px] pt-0.5 leading-snug transition-colors ${checkedIngredients[idx] ? 'text-[#7A6B5D] line-through opacity-70' : 'text-[#1E293B] font-medium'}`}>
                          {item}
                        </span>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={() => setShowOverview(false)}
                    className="w-full py-4 bg-[#965020] text-white text-[16px] font-bold rounded-xl shadow-md hover:bg-[#7a4018] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Complete Preparation <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#5C4D43] mb-1">
                  <span className="bg-[#E8E3DF] px-2.5 py-0.5 rounded text-[#1E293B]">Prep Phase</span> 
                  <span className="text-[#965020]">&bull;</span> {allPreSteps.length} Preparation Steps
                </div>
                
                {allPreSteps.map((step, idx) => {
                  const isActive = idx === task.currentPreStepIndex;
                  const isDone = idx < task.currentPreStepIndex;
                  const isLocked = idx > task.currentPreStepIndex;

                  return (
                    <div key={idx} className={`bg-white rounded-xl border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col transition-all ${isLocked ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                      <div className="relative w-full h-48 bg-[#E6E1DC]">
                        <img
                          alt={`Step ${idx + 1}`}
                          className="w-full h-full object-cover"
                          src={step.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgL9HdVqVTd3rN0858gr-CmnbshY3FPcXbFW0VDaNxi-kzx3o9QJll0A5QG2gHHhUj0gJ91mycpQ-Gm1BQ8C9vF9IF81Aj0_A6tYTQ5GKYsUhev0hIBubciUhOqvHbGKqLKVqZxDbGbaROBnp6iFFGbzQHET6lQMfqPZh2i-FTJamZN8FWyuKhU4AWwn-LifMfbAIuSiVWQe-ZrshNq6eeFK86RoB6epwXGClCOC67kE9qWZzdK_oXFpyoAJleJOZuAWzDxRA6g'}
                        />
                        <div className="absolute top-3 left-3 bg-white w-11 h-11 rounded-lg shadow-sm flex items-center justify-center text-[26px] font-extrabold text-[#965020] leading-none">
                          {idx + 1}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex flex-col gap-1 pr-2">
                            <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight">{step.text[lang] || step.text['en']}</h4>
                          </div>
                          
                          <button
                            onClick={() => handlePlayVoice(step.text[lang])}
                            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${isPlayingAudio ? 'bg-[#965020] text-white animate-pulse' : 'bg-[#F3A562] text-white hover:scale-105 active:scale-95'}`}
                          >
                            <Volume2 className="w-5 h-5 fill-current" />
                          </button>
                        </div>

                        <button
                          onClick={() => isActive && handleConfirmStep('pre', idx)}
                          disabled={isLocked || isDone || !!stepSuccessMessage}
                          className={`w-full py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-all mt-1 text-[15px] relative overflow-hidden ${
                            isDone ? 'bg-[#E8E3DF] text-[#7A6B5D] cursor-default' : 
                            isActive ? 'bg-[#2E7D32] text-white shadow-md hover:bg-[#1B5E20] cursor-pointer' : 
                            'bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-[18px] h-[18px]" />
                          {isDone ? 'COMPLETED' : isActive ? 'DONE' : 'LOCKED'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stage 2 Locked / Proceed Card */}
            {task.preCookFinishRate < 100 ? (
              <div className="bg-[#F8F6F4] rounded-xl border border-[#E6E1DC] p-8 flex flex-col items-center justify-center text-center gap-2 shadow-inner mt-2">
                <Lock className="w-10 h-10 text-[#C4B5A5] mb-1" strokeWidth={2.5} />
                <h4 className="text-[11px] font-extrabold tracking-widest text-[#A89885] uppercase">STAGE 2</h4>
                <h3 className="text-[20px] font-bold text-[#8C7D70]">Cooking</h3>
                <p className="text-[14px] text-[#A89885] max-w-[220px] leading-relaxed mt-1">
                  Complete the preparation steps to unlock cooking instructions.
                </p>
              </div>
            ) : task.taskStatus === 'pre_cook_completed' && !task.prepImageUrl ? (
              <div className="bg-white rounded-xl border border-[#E6E1DC] p-6 flex flex-col gap-4 shadow-sm mt-4">
                <div className="flex flex-col gap-2">
                  <h3 className="text-[20px] font-bold text-[#1E293B] leading-tight">Submit Preparation Photo for Approval</h3>
                  <p className="text-[14px] text-[#7A6B5D] leading-relaxed">
                    Please upload a photo of your completed preparation setup. Your employer will review it before unlocking the cooking phase.
                  </p>
                </div>
                
                <label className="border-2 border-dashed border-[#A89885] rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-[#F8F6F4] transition-colors cursor-pointer group relative overflow-hidden">
                  {isUploading && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-10 animate-fadeIn">
                      <div className="w-8 h-8 border-4 border-app-orange border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-[12px] font-bold text-app-orange">Uploading...</span>
                    </div>
                  )}
                  <div className="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center text-[#2E7D32] group-hover:scale-105 transition-transform">
                    <CloudUpload className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <span className="text-[16px] font-bold text-[#1E293B] block">Upload Photo</span>
                    <span className="text-[13px] text-[#A89885]">Drag & drop here or select file</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploading}
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setIsUploading(true);
                      const reader = new FileReader();
                      reader.onload = async (event) => {
                        try {
                          const base64 = event.target?.result as string;
                          const res = await fetch(`/api/tasks/${task.taskID}/upload-prep-photo`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ imageUrl: base64 })
                          });
                          if (res.ok) {
                            onRefreshData();
                          } else {
                            alert('Upload failed. Please try again.');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('An error occurred during upload.');
                        } finally {
                          setIsUploading(false);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              </div>
            ) : task.taskStatus === 'pre_cook_completed' && task.prepImageUrl ? (
              <div className="bg-[#F8F6F4] rounded-xl border border-[#E6E1DC] p-8 flex flex-col items-center justify-center text-center gap-2 shadow-inner mt-2">
                <Clock className="w-10 h-10 text-[#C4B5A5] mb-1" strokeWidth={2.5} />
                <h3 className="text-[20px] font-bold text-[#8C7D70]">Waiting for Approval</h3>
                <p className="text-[14px] text-[#A89885] max-w-[220px] leading-relaxed mt-1">
                  Waiting for employer to approve the preparation.
                </p>
              </div>
            ) : (
              <button 
                onClick={() => setActiveTab('cook')}
                className="mt-4 w-full py-4 bg-[#965020] text-white text-[16px] font-bold rounded-xl shadow-md hover:bg-[#7a4018] flex justify-center items-center gap-2 cursor-pointer"
              >
                Proceed to Cooking Stage <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* COOKING TAB */}
        {/* ============================================================== */}
        {activeTab === 'cook' && (
          <>
            {showCookOverview ? (
              <div className="bg-white rounded-xl border border-[#E6E1DC] overflow-hidden shadow-sm relative">
                <div className="absolute top-4 right-5 text-[80px] font-black text-[#F0EBE6] leading-none select-none z-0 tracking-tighter">
                  2
                </div>
                
                <div className="p-6 relative z-10">
                  <h2 className="text-[12px] font-extrabold tracking-widest text-[#5C4D43] uppercase mb-1">
                    STAGE 2
                  </h2>
                  <h3 className="text-[24px] font-bold text-[#1E293B] mb-6">
                    Cooking
                  </h3>

                  {recipe?.image && (
                    <div className="mb-6 rounded-xl overflow-hidden border border-[#E6E1DC] shadow-sm">
                      <img src={recipe.image} alt={recipe.title[lang]} className="w-full h-40 object-cover" />
                    </div>
                  )}
                  
                  <div className="flex flex-col gap-5 mb-8">
                    <p className="text-[15px] font-medium text-[#1E293B] leading-relaxed">
                      {lang === 'en' ? 'Please ensure all preparations from Stage 1 are complete before igniting the stove.' : 'Pastikan semua persiapan dari Tahap 1 selesai sebelum menyalakan kompor.'}
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCookOverview(false)}
                    className="w-full py-4 bg-[#965020] text-white text-[16px] font-bold rounded-xl shadow-md hover:bg-[#7a4018] flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    Start Cooking Phase <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#5C4D43] mb-1">
                  <span className="bg-[#E8E3DF] px-2.5 py-0.5 rounded text-[#1E293B]">Cook Phase</span> 
                  <span className="text-[#965020]">&bull;</span> {allCookSteps.length} Cooking Steps
                </div>
                
                {allCookSteps.map((step, idx) => {
                  const isActive = idx === task.currentCookStepIndex;
                  const isDone = idx < task.currentCookStepIndex;
                  const isLocked = idx > task.currentCookStepIndex;

                  return (
                    <div key={idx} className={`bg-white rounded-xl border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col transition-all ${isLocked ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                      <div className="relative w-full h-48 bg-[#E6E1DC]">
                        <img
                          alt={`Step ${idx + 1}`}
                          className="w-full h-full object-cover"
                          src={step.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgL9HdVqVTd3rN0858gr-CmnbshY3FPcXbFW0VDaNxi-kzx3o9QJll0A5QG2gHHhUj0gJ91mycpQ-Gm1BQ8C9vF9IF81Aj0_A6tYTQ5GKYsUhev0hIBubciUhOqvHbGKqLKVqZxDbGbaROBnp6iFFGbzQHET6lQMfqPZh2i-FTJamZN8FWyuKhU4AWwn-LifMfbAIuSiVWQe-ZrshNq6eeFK86RoB6epwXGClCOC67kE9qWZzdK_oXFpyoAJleJOZuAWzDxRA6g'}
                        />
                        <div className="absolute top-3 left-3 bg-white w-11 h-11 rounded-lg shadow-sm flex items-center justify-center text-[26px] font-extrabold text-[#965020] leading-none">
                          {idx + 1}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex flex-col gap-1 pr-2">
                            <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight">{step.text[lang] || step.text['en']}</h4>
                          </div>
                          
                          <button
                            onClick={() => handlePlayVoice(step.text[lang])}
                            className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${isPlayingAudio ? 'bg-[#965020] text-white animate-pulse' : 'bg-[#F3A562] text-white hover:scale-105 active:scale-95'}`}
                          >
                            <Volume2 className="w-5 h-5 fill-current" />
                          </button>
                        </div>

                        <button
                          onClick={() => isActive && handleConfirmStep('cook', idx)}
                          disabled={isLocked || isDone || !!stepSuccessMessage}
                          className={`w-full py-3.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-all mt-1 text-[15px] relative overflow-hidden ${
                            isDone ? 'bg-[#E8E3DF] text-[#7A6B5D] cursor-default' : 
                            isActive ? 'bg-[#2E7D32] text-white shadow-md hover:bg-[#1B5E20] cursor-pointer' : 
                            'bg-[#D1D5DB] text-[#6B7280] cursor-not-allowed'
                          }`}
                        >
                          <CheckCircle className="w-[18px] h-[18px]" />
                          {isDone ? 'COMPLETED' : isActive ? 'DONE' : 'LOCKED'}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Final Completion Action */}
                {task.cookFinishRate >= 100 && (
                  <div className="bg-white rounded-xl border border-primary/30 p-6 flex flex-col items-center justify-center text-center shadow-sm mt-4">
                    <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold mb-4">{recipe?.title[lang] || 'Recipe Steps'}</h1>
                    <p className="text-xs text-gray-400 mb-2">Build v1.0.1 - Assets Synced</p>
                    <p className="text-sm text-on-surface-variant mb-6 max-w-[250px]">
                      Take a photo of the final plated dish to run the AI presentation check.
                    </p>
                    <button
                      onClick={() => onNavigate('upload-check')}
                      className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-md hover:bg-primary/90 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      Upload Food Photo <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* MASSIVE spacer to force it down */}
      <div className="h-64 bg-red-100 flex items-center justify-center text-red-500 font-bold">
        SPACE ENFORCER (h-64)
      </div>

      <div className="px-4 mb-20">
        {/* Global Return to Dashboard Button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className="w-full py-6 bg-pink-500 text-white font-black rounded-2xl shadow-2xl hover:bg-pink-600 flex items-center justify-center gap-2 transition-all cursor-pointer border-4 border-white"
        >
          <ArrowLeft className="w-6 h-6" />
          {lang === 'en' ? 'Return to Dashboard' : lang === 'id' ? 'Kembali ke Beranda' : 'Bumalik sa Dashboard'}
          <span className="bg-white text-pink-500 px-2 py-0.5 rounded text-[10px] ml-2">V3-PINK-LOWER</span>
        </button>
      </div>

      {stepSuccessMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-[#1E293B] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce">
          <Sparkles className="w-5 h-5 text-[#F3A562]" />
          <span className="font-bold text-sm whitespace-nowrap">{stepSuccessMessage}</span>
        </div>
      )}

      {/* KEY TAKEAWAYS MODAL */}
      {showTips && recipe && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fadeIn">
          <div className="bg-[#F9F7F5] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-slideUp">
            <div className="bg-[#965020] p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-6 h-6 text-white fill-current" />
                <h3 className="text-white font-bold text-xl m-0">
                  {lang === 'en' ? 'Chef\'s Takeaways' : lang === 'id' ? 'Poin Penting Koki' : 'Chef\'s Secret Notes'}
                </h3>
              </div>
              <button 
                onClick={() => setShowTips(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
              {recipe.keyTakeaways?.map((step, idx) => (
                <div key={idx} className="bg-white/90 backdrop-blur-md p-5 rounded-[22px] border border-[#E6E1DC] shadow-sm flex flex-col gap-2 relative">
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
              ))}
            </div>
            
            <div className="p-5 border-t border-[#E6E1DC] bg-white">
              <button 
                onClick={() => setShowTips(false)}
                className="w-full py-4 bg-[#965020] text-white font-bold rounded-xl shadow-md hover:bg-[#7a4018] transition-all cursor-pointer"
              >
                {lang === 'en' ? 'Got it, Chef!' : lang === 'id' ? 'Siap, Koki!' : 'Sige po, Chef!'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
