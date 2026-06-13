import React, { useState, useEffect } from 'react';
import { ChefHat, CheckCircle2, ShieldAlert, Send, UtensilsCrossed, Soup, Utensils, AlertTriangle, Clock, Volume2, ArrowLeft, Info, Heart } from 'lucide-react';
import { Recipe, Language, FamilyMember } from '../types';
import { gsap } from 'gsap';

interface RecipePlannerProps {
  recipes: Recipe[];
  healthProfiles: FamilyMember[];
  lang: Language;
  onPublishTask: (recipeId: string, customSteps: string[]) => void;
  partnerFullName?: string;
  likedIds?: string[];
  onToggleLike?: (id: string) => void;
}

export function RecipePlanner({ recipes, healthProfiles, lang, onPublishTask, partnerFullName, likedIds = [], onToggleLike }: RecipePlannerProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [customInput, setCustomInput] = useState<string>('');
  const [preStepsPreview, setPreStepsPreview] = useState<any[]>([]);
  const [plannerActiveTab, setPlannerActiveTab] = useState<'prep' | 'cook' | 'takeaways'>('prep');
  const [isLoadingAdjust, setIsLoadingAdjust] = useState<boolean>(false);
  const [deck, setDeck] = useState<Recipe[]>(recipes);
  const clickTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoice = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'en' ? 'en-US' : lang === 'id' ? 'id-ID' : 'en-US';
    utterance.onend = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Use all recipes
  const filteredRecipes = recipes;
  
  React.useEffect(() => {
    setDeck((prevDeck) => {
      // Check if the recipe list itself has changed meaningfully (not just order)
      const isSame = prevDeck.length === recipes.length && 
                    prevDeck.every(r => {
                      const updated = recipes.find(pr => pr.recipeID === r.recipeID);
                      return updated && updated.image === r.image;
                    });
      
      if (isSame) {
        return prevDeck; // Keep current order if recipes and their images are the same
      }
      return recipes;
    });
  }, [recipes]);

  // Choose first recipe by default (REMOVED - so details are hidden initially)
  // useEffect(() => {
  //   if (filteredRecipes.length > 0 && !selectedRecipeId) {
  //     setSelectedRecipeId(filteredRecipes[0].recipeID);
  //   }
  // }, [recipes]);

  const getRecipeImage = (recipe: Recipe) => {
    if (recipe.image) return recipe.image;
    
    switch (recipe.recipeID) {
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

  // Load smart adjusted recipe previews (Client-side simulation)
  useEffect(() => {
    if (!selectedRecipeId) return;
    setIsLoadingAdjust(true);
    
    // Simulate smart logic previously in server.ts
    const originalRecipe = recipes.find(r => r.recipeID === selectedRecipeId);
    if (originalRecipe) {
      let adjusted = JSON.parse(JSON.stringify(originalRecipe.preCookSteps));
      const isDiabetic = healthProfiles.some(m => m.disease?.toLowerCase().includes('diabetes'));
      const isHypertensive = healthProfiles.some(m => m.disease?.toLowerCase().includes('hyper'));

      if (isDiabetic) {
        adjusted = adjusted.map((s: any) => ({
          ...s,
          text: {
            ...s.text,
            en: s.text.en.replace(/sugar/gi, 'monkfruit sweetener (health-swap)')
          }
        }));
      }
      if (isHypertensive) {
        adjusted = adjusted.map((s: any) => ({
          ...s,
          text: {
            ...s.text,
            en: s.text.en.replace(/salt|soy sauce/gi, 'low-sodium variant')
          }
        }));
      }
      setPreStepsPreview(adjusted);
    }
    
    setIsLoadingAdjust(false);
  }, [selectedRecipeId, healthProfiles, recipes]);

  const activeRecipe = recipes.find(r => r.recipeID === selectedRecipeId);

  // Active family health metrics
  const isDiabetic = healthProfiles.some(m => m.disease?.toLowerCase().includes('diabetes'));
  const isHypertensive = healthProfiles.some(m => m.disease?.toLowerCase().includes('hyper'));
  const allergyList = healthProfiles.map(m => m.allergy?.trim()).filter(a => a && a.toLowerCase() !== 'none');

  const handlePublish = () => {
    if (!selectedRecipeId) return;
    const lines = customInput
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    onPublishTask(selectedRecipeId, lines);
  };

  return (
    <div className="flex flex-col gap-[28px] animate-fadeIn w-full max-w-[480px] mx-auto pb-12">
      
      {!activeRecipe ? (
        <>
          {/* Header Section */}
          <section className="flex flex-col gap-2 mt-2">
            <h1 className="text-[34px] font-bold text-app-text-title leading-tight">
              {lang === 'en' ? "Plan Today's Meal" : 'Rencana Menu Masakan'}
            </h1>
            <p className="text-[20px] font-normal text-app-text-muted leading-relaxed">
              {lang === 'en' 
                ? 'Select recipes and set clear preparation tasks for your helper.' 
                : 'Pilih masakan sehat hari ini untuk asisten rumah tangga.'}
            </p>
          </section>

          {/* List Cooking Schemes (Premium Grid Layout) */}
          <section className="flex flex-col gap-4">
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-8">
              {deck.map((recipe) => {
                const isSelected = selectedRecipeId === recipe.recipeID;
                return (
                  <div
                    key={recipe.recipeID}
                    onClick={() => {
                      setSelectedRecipeId(recipe.recipeID);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex flex-col group cursor-pointer"
                  >
                    {/* Layer 1: Image & Overlay */}
                    <div className={`relative aspect-[4/5] w-full bg-[#f6f6f6] overflow-hidden rounded-2xl mb-3 border-2 transition-all ${isSelected ? 'border-[#965020] shadow-lg ring-2 ring-[#965020]/20' : 'border-transparent shadow-sm hover:border-app-border'}`}>
                      <img
                        alt={recipe.title[lang]}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        src={getRecipeImage(recipe)}
                        referrerPolicy="no-referrer"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#965020]/10 flex items-center justify-center">
                          <div className="bg-[#965020] text-white p-2 rounded-full shadow-lg">
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-[#5C4D43] shadow-sm flex items-center gap-1 border border-[#E6E1DC]">
                        <Clock className="w-3 h-3 text-app-orange" />
                        <span>{recipe.prepTime + recipe.cookTime}m</span>
                      </div>

                      {/* Heart (Like) Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike?.(recipe.recipeID);
                        }}
                        className="absolute top-3 left-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-red-500 shadow-sm focus:outline-none hover:scale-110 duration-200 border border-[#E6E1DC]"
                      >
                        <Heart
                          className={`w-4 h-4 ${likedIds.includes(recipe.recipeID) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                        />
                      </button>
                    </div>
                    
                    {/* Layer 2: Metadata */}
                    <div className="flex flex-col gap-0.5 px-1">
                      <span className="text-[10px] font-black text-[#965020] uppercase tracking-wider opacity-80">
                        {recipe.category}
                      </span>
                      
                      <h3 className={`text-[15px] font-bold leading-tight line-clamp-2 transition-colors ${isSelected ? 'text-[#965020]' : 'text-app-text-title'}`}>
                        {recipe.title[lang]}
                      </h3>
                      
                      <div className="flex items-center gap-2 mt-1.5 text-[11px] text-app-text-muted font-bold">
                        <span>{recipe.prepTime}m Prep</span>
                        <span className="opacity-30">&bull;</span>
                        <span>{recipe.cookTime}m Cook</span>
                      </div>

                      {/* Tags Badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="bg-[#E8F3FD] text-[#3B82F6] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          {recipe.category}
                        </span>
                        {recipe.tags?.slice(0, 2).map((t, i) => (
                          <span key={i} className="bg-[#FEF2F2] text-[#EF4444] text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      ) : (
        <div className="flex flex-col gap-6 animate-fadeIn w-full mx-auto pb-12">
          
          {/* Back navigation button */}
          <button
            onClick={() => setSelectedRecipeId('')}
            className="flex items-center gap-1 text-xs font-bold text-[#5C4D43] hover:text-[#965020] transition-colors cursor-pointer w-fit py-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'en' ? 'Back to Selection' : 'Kembali ke Pilihan'}</span>
          </button>

          {/* Hero header block */}
          <div className="bg-white rounded-[28px] border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col">
            <div className="h-56 relative bg-[#E6E1DC]">
              <img
                alt={activeRecipe.title[lang]}
                className="w-full h-full object-cover"
                src={getRecipeImage(activeRecipe)}
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 px-3 py-1.5 rounded-full text-xs font-bold text-[#5C4D43] shadow-sm flex items-center gap-1 border border-[#E6E1DC]">
                <Clock className="w-3.5 h-3.5 text-app-orange" />
                <span>{activeRecipe.prepTime + activeRecipe.cookTime} mins total</span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div>
                <h3 className="text-2xl text-[#1E293B] font-black leading-tight">
                  {activeRecipe.title[lang]}
                </h3>
                <p className="font-body-md text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {activeRecipe.description[lang]}
                </p>
              </div>

              {/* Tags badges */}
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-secondary-container text-on-secondary-container font-label-lg text-xs px-2.5 py-0.5 rounded font-bold">
                  {activeRecipe.category}
                </span>
                {activeRecipe.tags?.map((t, idx) => (
                  <span key={idx} className="bg-primary-fixed text-on-primary-fixed-variant font-label-lg text-xs px-2.5 py-0.5 rounded font-medium">
                    {t}
                  </span>
                ))}
              </div>

              {/* Checklist details bento split layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E6E1DC] mt-2 text-xs">
                
                <div className="flex flex-col gap-2">
                  <span className="font-black uppercase tracking-widest text-[#965020] text-[10px] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    {lang === 'en' ? 'Ingredients List' : 'Kebutuhan Bahan'}
                  </span>
                  <ul className="text-[#475569] space-y-2 pl-4 list-disc font-medium leading-relaxed">
                    {activeRecipe.materialList?.map((m, idx) => (
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
                    {activeRecipe.toolList?.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

              </div>

            </div>
          </div>

          {/* Smart Adaptations Alert Banner */}
          {(isDiabetic || isHypertensive || allergyList.length > 0) && (
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
          )}

          {/* Steps Tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex p-1 bg-[#E8E3DF]/60 backdrop-blur-md rounded-[18px] border border-[#D6CDC4] shadow-inner">
              <button
                onClick={() => setPlannerActiveTab('prep')}
                className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                  plannerActiveTab === 'prep' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                }`}
              >
                {lang === 'en' ? 'Preparation Rules' : lang === 'id' ? 'Langkah Persiapan' : 'Handa'}
              </button>
              <button
                onClick={() => setPlannerActiveTab('cook')}
                className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                  plannerActiveTab === 'cook' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                }`}
              >
                {lang === 'en' ? 'Cooking Steps' : lang === 'id' ? 'Langkah Memasak' : 'Luto'}
              </button>
              <button
                onClick={() => setPlannerActiveTab('takeaways')}
                className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all cursor-pointer ${
                  plannerActiveTab === 'takeaways' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
                }`}
              >
                {lang === 'en' ? 'Key Takeaways' : lang === 'id' ? 'Tips Penting' : 'Key Takeaways'}
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {(plannerActiveTab === 'prep' ? activeRecipe.preCookSteps : 
                plannerActiveTab === 'cook' ? activeRecipe.cookSteps : 
                activeRecipe.keyTakeaways || []).map((step: any, idx: number) => (
                plannerActiveTab === 'takeaways' ? (
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
              ))}
            </div>
          </div>

          {/* Custom steps input */}
          <section className="flex flex-col gap-3 mt-4">
            <h2 className="text-[20px] font-black text-[#1E293B] uppercase tracking-tight">
              {lang === 'en' ? 'Extra Prep Requirements' : 'Instruksi Persiapan Kustom'}
            </h2>
            <textarea
              className="w-full bg-white border border-[#E6E1DC] rounded-[24px] p-5 text-[18px] text-[#1E293B] focus:outline-none focus:border-[#965020] shadow-sm"
              value={customInput}
              onChange={e => setCustomInput(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'e.g., Soak the broccoli in salted water for 15 minutes before cooking.'
                  : 'Misal: Rendam brokoli di air garam 15 menit.'
              }
              rows={3}
            />
          </section>

          <button
            onClick={handlePublish}
            disabled={isLoadingAdjust}
            className="w-full py-5 bg-[#965020] text-white text-[20px] font-black rounded-[24px] shadow-xl hover:bg-[#804218] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed mt-2"
          >
            <Send className="w-6 h-6" />
            <span>{lang === 'en' ? 'Publish Today Goal' : 'Kirim Tugas Memasak'}</span>
          </button>

        </div>
      )}

    </div>
  );
}
