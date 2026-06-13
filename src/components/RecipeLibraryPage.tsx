import React, { useState } from 'react';
import { BookOpen, Clock, Heart, Eye, ArrowLeft, CheckCircle, Flame, MessageCircle, Info, Volume2 } from 'lucide-react';
import { Recipe, Language } from '../types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);


interface RecipeLibraryPageProps {
  recipes: Recipe[];
  lang: Language;
}

export function RecipeLibraryPage({ recipes, lang }: RecipeLibraryPageProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [activeTab, setActiveTab] = useState<'prep' | 'cook' | 'takeaways'>('prep');
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

  React.useEffect(() => {
    if (selectedRecipe) return;

    // Small delay to ensure items are rendered
    const timer = setTimeout(() => {
      ScrollTrigger.batch(".recipe-batch-item", {
        onEnter: batch => gsap.to(batch, { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          stagger: { each: 0.1, grid: [1, 3] }, 
          ease: "power3.out", 
          duration: 0.8,
          overwrite: true 
        }),
        onLeave: batch => gsap.set(batch, { opacity: 0, y: 50, scale: 0.9, overwrite: true }),
        onEnterBack: batch => gsap.to(batch, { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          stagger: 0.1, 
          ease: "power3.out", 
          duration: 0.8,
          overwrite: true 
        }),
        onLeaveBack: batch => gsap.set(batch, { opacity: 0, y: 50, scale: 0.9, overwrite: true }),
        start: "top 90%",
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, [selectedRecipe, recipes]);

  const getRecipeImage = (recipe: Recipe) => {
    if (recipe.image) return recipe.image;
    
    // Fallback logic if image field is missing
    const fallback = recipe.preCookSteps[0]?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1280';
    
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
        return fallback;
    }
  };

  if (selectedRecipe) {
    const steps = activeTab === 'prep' 
      ? selectedRecipe.preCookSteps 
      : activeTab === 'cook' 
        ? selectedRecipe.cookSteps 
        : (selectedRecipe.keyTakeaways || []);

    return (
      <div className="flex flex-col gap-6 animate-fadeIn w-full max-w-2xl mx-auto pb-12">
        
        {/* Back navigation button */}
        <button
          onClick={() => setSelectedRecipe(null)}
          className="flex items-center gap-1 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer w-fit py-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'en' ? 'Back to Self Study' : 'Kembali ke Koleksi'}</span>
        </button>

        {/* Hero header block */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm flex flex-col">
          <div className="h-56 relative bg-surface-container">
            <img
              alt={selectedRecipe.title[lang]}
              className="w-full h-full object-cover"
              src={getRecipeImage(selectedRecipe)}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 right-4 bg-surface-container-lowest/90 px-3 py-1.5 rounded-full text-xs font-bold text-on-surface shadow-sm flex items-center gap-1 border border-outline-variant">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{selectedRecipe.prepTime + selectedRecipe.cookTime} mins total</span>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <div>
              <h3 className="font-headline-md text-xl md:text-2xl text-on-surface font-bold leading-tight">
                {selectedRecipe.title[lang]}
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                {selectedRecipe.description[lang]}
              </p>
            </div>

            {/* Tags badges */}
            <div className="flex flex-wrap gap-1.5">
              <span className="bg-secondary-container text-on-secondary-container font-label-lg text-xs px-2.5 py-0.5 rounded font-bold">
                {selectedRecipe.category}
              </span>
              {selectedRecipe.tags?.map((t, idx) => (
                <span key={idx} className="bg-primary-fixed text-on-primary-fixed-variant font-label-lg text-xs px-2.5 py-0.5 rounded font-medium">
                  {t}
                </span>
              ))}
            </div>

            {/* Checklist details bento split layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-surface-variant mt-2 text-xs">
              
              <div className="flex flex-col gap-2">
                <span className="font-label-lg uppercase tracking-wider text-on-surface-variant font-bold text-[10px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-primary" />
                  {lang === 'en' ? 'Ingredients List' : 'Kebutuhan Bahan'}
                </span>
                <ul className="text-on-surface space-y-1.5 pl-4 list-disc font-body-md leading-relaxed">
                  {selectedRecipe.materialList?.map((m, idx) => (
                    <li key={idx} className="text-on-surface">{m}</li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-label-lg uppercase tracking-wider text-on-surface-variant font-bold text-[10px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-secondary" />
                  {lang === 'en' ? 'Utensils List' : 'Peralatan Masak'}
                </span>
                <ul className="text-on-surface space-y-1.5 pl-4 list-disc font-body-md leading-relaxed">
                  {selectedRecipe.toolList?.map((t, idx) => (
                    <li key={idx} className="text-on-surface">{t}</li>
                  ))}
                </ul>
              </div>

            </div>

          </div>
        </div>

        {/* Lock-free interactive Step-by-step Tabs indicator */}
        <div className="flex flex-col gap-4">
          
          <div className="flex p-1 bg-[#E8E3DF]/80 backdrop-blur-md rounded-[18px] border border-[#D6CDC4] shadow-inner mb-2">
            <button
              onClick={() => setActiveTab('prep')}
              className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all text-center cursor-pointer ${
                activeTab === 'prep' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
              }`}
            >
              {lang === 'en' ? 'Preparation Rules' : 'Langkah Persiapan'}
            </button>
            <button
              onClick={() => setActiveTab('cook')}
              className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all text-center cursor-pointer ${
                activeTab === 'cook' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
              }`}
            >
              {lang === 'en' ? 'Cooking Steps' : lang === 'id' ? 'Langkah Memasak' : 'Mga Hakbang sa Pagluluto'}
            </button>
            <button
              onClick={() => setActiveTab('takeaways')}
              className={`flex-1 py-3 text-[12px] font-extrabold rounded-[14px] transition-all text-center cursor-pointer ${
                activeTab === 'takeaways' ? 'bg-[#965020] text-white shadow-lg' : 'text-[#5C4D43] hover:bg-black/5'
              }`}
            >
              {lang === 'en' ? 'Key Takeaways' : lang === 'id' ? 'Poin Penting' : 'Key Takeaways'}
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((step, idx) => (
              activeTab === 'takeaways' ? (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-md p-5 rounded-[22px] border border-[#E6E1DC] shadow-sm hover:shadow-md transition-all group flex flex-col gap-2 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-[#965020] uppercase tracking-[0.15em] opacity-80">
                      Chef's Secret Note #{idx + 1}
                    </span>
                    <button
                      onClick={() => handlePlayVoice(step.text[lang] || step.text.en)}
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center shadow-sm transition-all cursor-pointer ${isPlayingAudio ? 'bg-[#965020] text-white animate-pulse' : 'bg-[#F3A562] text-white hover:scale-105 active:scale-95'}`}
                    >
                      <Volume2 className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                  <p className="text-[15px] text-[#1E293B] leading-[1.6] font-medium font-sans">
                    {step.text[lang] || step.text.en}
                  </p>
                </div>
              ) : (
                <div key={idx} className="bg-white rounded-xl border border-[#E6E1DC] overflow-hidden shadow-sm flex flex-col transition-all group">
                  <div className="relative w-full h-48 bg-[#E6E1DC]">
                    <img
                      alt={`Step ${idx + 1}`}
                      className="w-full h-full object-cover"
                      src={step.image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTgL9HdVqVTd3rN0858gr-CmnbshY3FPcXbFW0VDaNxi-kzx3o9QJll0A5QG2gHHhUj0gJ91mycpQ-Gm1BQ8C9vF9IF81Aj0_A6tYTQ5GKYsUhev0hIBubciUhOqvHbGKqLKVqZxDbGbaROBnp6iFFGbzQHET6lQMfqPZh2i-FTJamZN8FWyuKhU4AWwn-LifMfbAIuSiVWQe-ZrshNq6eeFK86RoB6epwXGClCOC67kE9qWZzdK_oXFpyoAJleJOZuAWzDxRA6g'}
                    />
                    <div className="absolute top-3 left-3 bg-white w-10 h-10 rounded-lg shadow-sm flex items-center justify-center text-[22px] font-extrabold text-[#965020] leading-none">
                      {idx + 1}
                    </div>
                  </div>

                  <div className="p-5 flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex flex-col gap-1 pr-2">
                        <h4 className="text-[17px] font-bold text-[#1E293B] leading-tight">{step.text[lang] || step.text.en}</h4>
                      </div>
                      
                      <button
                        onClick={() => handlePlayVoice(step.text[lang] || step.text.en)}
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

      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 animate-fadeIn w-full max-w-5xl mx-auto pb-4 px-4">
      
      {/* Title / Header Styled per Request */}
      <section className="flex flex-col items-center text-center gap-1.5 mt-4 mb-0 max-w-2xl mx-auto">
        <h1 className="font-display-lg text-3xl md:text-4xl text-on-surface font-bold tracking-tight">
          {lang === 'en' ? 'Recipe Self-Study Library' : 'Resep Pembelajaran Mandiri'}
        </h1>
        <p className="font-body-lg text-on-surface-variant leading-relaxed">
          {lang === 'en'
            ? 'Easily explore our collection with a staggered scroll experience. Study instructions and tools anytime.'
            : 'Jelajahi koleksi kami dengan pengalaman scroll yang halus. Pelajari instruksi dan peralatan kapan saja.'}
        </p>
      </section>

      {/* Staggered Grid Listing using GSAP Batch */}
      <section className="w-full mt-8">
        <div className="recipe-batch-container">
          {recipes.map((recipe) => (
            <div
              key={recipe.recipeID}
              onClick={() => setSelectedRecipe(recipe)}
              className="recipe-batch-item flex flex-col cursor-pointer group animate-fadeIn"
            >
              {/* Layer 1: Image & Favorite Icon */}
              <div className="relative aspect-[4/5] w-full bg-[#f6f6f6] overflow-hidden rounded-md mb-3">
                <img
                  alt={recipe.title[lang]}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  src={getRecipeImage(recipe)}
                  referrerPolicy="no-referrer"
                />
                <button 
                  className="absolute top-3 right-3 p-1.5 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/40 transition-colors"
                  onClick={(e) => { e.stopPropagation(); }}
                >
                  <Heart className="w-4 h-4 text-[#1B1B1B] stroke-[1.5px]" />
                </button>
              </div>
              
              {/* Layer 2: Brand/Category Style */}
              <div className="flex flex-col gap-0.5 px-0.5">
                <span className="text-[11px] font-bold text-[#1B1B1B] uppercase tracking-wider">
                  {lang === 'en' ? 'HK HOME KITCHEN' : 'DAPUR HONG KONG'}
                </span>
                
                {/* Layer 3: Product Name/Recipe Title */}
                <h3 className="text-[14px] text-[#1B1B1B] font-normal leading-tight line-clamp-2">
                  {recipe.title[lang]}
                </h3>
                
                {/* Layer 4: Clean Metadata */}
                <div className="flex flex-col mt-1">
                  <div className="flex items-center gap-3 text-[11px] text-[#666666] font-medium font-mono">
                    <span>{recipe.prepTime}m Prep</span>
                    <span className="opacity-30">|</span>
                    <span>{recipe.cookTime}m Cook</span>
                  </div>
                  <span className="text-[14px] text-[#1B1B1B] font-bold mt-1 font-mono">
                    Total: {recipe.prepTime + recipe.cookTime}m
                  </span>
                </div>

                {/* Layer 5: Category Badge */}
                <div className="flex gap-1.5 mt-2.5">
                  <span className="bg-[#1B1B1B] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                    {recipe.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
