import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { Role, Language } from '../types';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import MagicBento from './MagicBento';

interface LaunchPageProps {
  onSelectRole: (role: Role) => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
}

export function LaunchPage({ onSelectRole, lang, onSelectLang }: LaunchPageProps) {
  // Step can be 'lang' (Language selection screen) or 'role' (Role selection screen)
  const [step, setStep] = useState<'lang' | 'role'>('lang');
  
  const iconRef = useRef<HTMLDivElement>(null);
  const { contextSafe } = useGSAP({ scope: iconRef });

  const translations = {
    connectSubtitle: {
      en: 'Connect employers & domestic helpers for in-home homemade cooking service !',
      id: 'Menghubungkan majikan & asisten rumah tangga untuk layanan masak rumahan !',
      tg: 'Ikonekta ang mga employer at kasambahay para sa serbisyong pagluluto sa bahay !'
    },
    roleTitle: {
      en: 'Choose Your Role',
      id: 'Pilih Peran Anda',
      tg: 'Piliin ang Iyong Papel'
    },
    roleSubtitle: {
      en: 'Select your profile to continue with the experience.',
      id: 'Pilih profil Anda untuk melanjutkan pengalaman.',
      tg: 'Piliin ang iyong profile upang magpatuloy sa karanasan.'
    },
    employerTitle: {
      en: 'Employer',
      id: 'Majikan',
      tg: 'Employer'
    },
    helperTitle: {
      en: 'Helper',
      id: 'Asisten',
      tg: 'Helper'
    },
    backText: {
      en: '← Change Language / Back',
      id: '← Ganti Bahasa / Kembali',
      tg: '← Palitan ang Wika / Bumalik'
    }
  };

  const handleLangSelect = contextSafe((selectedLang: Language) => {
    onSelectLang(selectedLang);
    setStep('role');
  });

  const handleMouseMove = contextSafe((e: React.MouseEvent) => {
    if (!iconRef.current) return;
    
    const rect = iconRef.current.getBoundingClientRect();
    
    // If cursor is below the doll area (near the role selection text/buttons), reset tilt
    if (e.clientY > rect.bottom + 40) {
      gsap.to(iconRef.current, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "power2.out"
      });
      gsap.to(iconRef.current.querySelectorAll('.layer-back, .layer-mid, .layer-front'), {
        x: 0,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      });
      // Reset Smile & Squint when in the non-interaction zone
      gsap.to(iconRef.current.querySelectorAll('.mouth-path'), {
        attr: { d: "M 98 165 Q 105 168, 112 165" },
        duration: 0.8,
        ease: "power2.out"
      });
      gsap.to(iconRef.current.querySelectorAll('.eye-path'), {
        scaleY: 1,
        duration: 0.8,
        ease: "power2.out"
      });
      return;
    }

    // get center of the icon
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // get distance from center
    const xDist = e.clientX - centerX;
    const yDist = e.clientY - centerY;
    
    // normalize (approximate screen size for max distance)
    const xPct = xDist / window.innerWidth;
    const yPct = yDist / window.innerHeight;
    
    // Intensified tilt for more dramatic 3D effect
    gsap.to(iconRef.current, {
      rotateX: -yPct * 160,
      rotateY: xPct * 160,
      duration: 0.5,
      ease: "power2.out",
      transformPerspective: 1000,
      transformOrigin: "center center"
    });

    // Interactive Smile & Squint - Ensure it stays smiling while moving
    gsap.to(iconRef.current.querySelectorAll('.mouth-path'), {
      attr: { d: "M 98 162 Q 106 178, 112 159" },
      duration: 0.4,
      ease: "power2.out"
    });
    gsap.to(iconRef.current.querySelectorAll('.eye-path'), {
      scaleY: 0.6,
      transformOrigin: "center center",
      duration: 0.4,
      ease: "power2.out"
    });

    // Intensified 3D Parallax effect for internal layers
    gsap.to(iconRef.current.querySelectorAll('.layer-back'), {
      x: -xPct * 45,
      y: -yPct * 45,
      duration: 0.5,
      ease: "power2.out"
    });
    
    gsap.to(iconRef.current.querySelectorAll('.layer-mid'), {
      x: xPct * 15,
      y: yPct * 15,
      duration: 0.5,
      ease: "power2.out"
    });

    gsap.to(iconRef.current.querySelectorAll('.layer-front'), {
      x: xPct * 75,
      y: yPct * 75,
      duration: 0.5,
      ease: "power2.out"
    });
  });

  const handleMouseEnter = contextSafe(() => {
    if (!iconRef.current) return;
    // Interactive Smile & Squint - Trigger immediately on hover
    gsap.to(iconRef.current.querySelectorAll('.mouth-path'), {
      attr: { d: "M 98 162 Q 106 178, 112 159" },
      duration: 0.4,
      ease: "power2.out"
    });
    gsap.to(iconRef.current.querySelectorAll('.eye-path'), {
      scaleY: 0.6,
      transformOrigin: "center center",
      duration: 0.4,
      ease: "power2.out"
    });
  });

  const handleMouseLeave = contextSafe(() => {
    if (!iconRef.current) return;
    gsap.to(iconRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.4)"
    });
    gsap.to(iconRef.current.querySelectorAll('.layer-back, .layer-mid, .layer-front'), {
      x: 0,
      y: 0,
      duration: 1.2,
      ease: "elastic.out(1, 0.4)"
    });

    // Reset Smile & Squint
    gsap.to(iconRef.current.querySelectorAll('.mouth-path'), {
      attr: { d: "M 98 165 Q 105 168, 112 165" },
      duration: 0.8,
      ease: "elastic.out(1, 0.4)"
    });
    gsap.to(iconRef.current.querySelectorAll('.eye-path'), {
      scaleY: 1,
      duration: 0.8,
      ease: "elastic.out(1, 0.4)"
    });
  });

  // Interactive glow effect helper
  const triggerGlow = (selector: string) => {
    gsap.to(selector, {
      boxShadow: "0 0 25px 8px rgba(243, 165, 98, 0.6)",
      borderColor: "rgba(243, 165, 98, 0.8)",
      duration: 0.4,
      yoyo: true,
      repeat: 1,
      ease: "power2.out"
    });
  };

  const handleButtonClick = (type: 'lang' | 'role', value: any, selector: string) => {
    triggerGlow(selector);
    // Add a tiny delay to allow the glow to be seen before transition
    setTimeout(() => {
      if (type === 'lang') {
        handleLangSelect(value);
      } else {
        onSelectRole(value);
      }
    }, 200);
  };

  return (
    <div 
      className="flex-grow flex flex-col items-center justify-center py-4 w-full max-w-[480px] mx-auto animate-fadeIn px-4"
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      
      {/* 1. Custom Vector Graphic: High-fidelity line-art girl with blue cap and wavy hair matching user's image */}
      <div className="w-full flex justify-center mb-6" id="splash-vector-container" ref={iconRef}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 240 280"
          className="w-[210px] h-[245px] overflow-visible"
          fill="none"
        >
          {/* --- BACK LAYER --- */}
          <g className="layer-back">
            {/* Back Curly Hair Outline */}
            <path
              d="M 185 110 
                 C 195 125, 215 140, 210 165
                 C 205 180, 222 195, 210 215
                 C 200 230, 210 240, 195 242"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Hair volume on the left */}
            <path
              d="M 64 100
                 C 45 115, 30 135, 45 160
                 C 55 175, 40 195, 52 215
                 C 62 230, 50 245, 68 255
                 C 85 262, 102 250, 105 240"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* --- MID LAYER --- */}
          <g className="layer-mid">
            {/* Jaw / Face shape */}
            <path
              d="M 62 126
                 C 66 145, 78 190, 120 184
                 C 134 182, 144 170, 150 152"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Ear on the right */}
            <path
              d="M 148 130 
                 C 160 130, 166 138, 164 148 
                 C 162 154, 154 154, 150 152"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ear inner detail */}
            <path
              d="M 154 138 C 158 140, 158 144, 154 145"
              stroke="#1A66FF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* --- FRONT LAYER --- */}
          <g className="layer-front">
            {/* Front Left Curl Highlight */}
            <path
              d="M 60 162
                 C 42 178, 48 200, 58 215
                 C 68 228, 72 245, 90 250"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Bangs (wavy fringe over forehead) */}
            <path
              d="M 54 116 
                 C 56 126, 68 132, 72 120 
                 C 76 130, 88 132, 92 120 
                 C 96 130, 114 132, 122 118
                 C 126 128, 142 128, 148 116"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Left Eye */}
            <ellipse className="eye-path" cx="80" cy="138" rx="2.5" ry="5" fill="#1A66FF" />

            {/* Right Eye */}
            <ellipse className="eye-path" cx="112" cy="138" rx="2.5" ry="5" fill="#1A66FF" />

            {/* Cute Nose */}
            <path
              d="M 85 154 Q 88 156, 89 152"
              stroke="#1A66FF"
              strokeWidth="4.5"
              strokeLinecap="round"
            />

            {/* Smiling Mouth */}
            <path
              className="mouth-path"
              d="M 98 165 Q 105 168, 112 165"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Cap Base Dome Shape */}
            <path
              d="M 80 72 
                 C 90 28, 180 28, 205 78 
                 C 215 98, 208 108, 196 112
                 C 180 115, 152 100, 120 90
                 C 92 80, 84 76, 80 72 Z"
              fill="#126BFF"
              stroke="#126BFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Cap Visor / Brim */}
            <path
              d="M 68 76 
                 C 48 76, 30 88, 32 98
                 C 34 104, 45 106, 54 104
                 C 70 100, 98 94, 114 96
                 C 120 96, 124 90, 118 86
                 C 95 80, 80 78, 68 76 Z"
              fill="#126BFF"
              stroke="#126BFF"
              strokeWidth="3"
              strokeLinejoin="round"
            />

            {/* Highlight line on visor/brim */}
            <path
              d="M 40 92 C 44 88, 54 88, 60 88"
              stroke="#FFFFFF"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </g>

          {/* --- SHIRT & COLLAR (MID LAYER) --- */}
          <g className="layer-mid">
            {/* Neck lines */}
            <path
              d="M 115 186 L 132 230"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 148 178 L 158 200"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
            />

            {/* Collar Part left lapel */}
            <path
              d="M 125 212 L 146 226 L 168 198 L 148 190 Z"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="#FFFFFF"
            />

            {/* Collar Part right lapel / opening */}
            <path
              d="M 125 212 L 125 235 L 146 226"
              stroke="#1A66FF"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </svg>
      </div>

      {step === 'lang' && (
        <div className="w-full flex flex-col items-center">
          {/* Header text with orange highlighting for "Belaja" */}
          <div className="text-center w-full mb-3" id="splash-welcome-title">
            <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight">
              Welcome to <span className="text-[#FF9D54]">Belaja</span>
            </h2>
            <p className="font-sans font-normal text-[16px] text-[#475569] mt-3 leading-[19.25px] px-4">
              {translations.connectSubtitle[lang]}
            </p>
          </div>

          {/* Language Selection Buttons using MagicBento for enhanced visual effects */}
          <div className="w-full mt-6">
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={12}
              glowColor="132, 0, 255"
              disableAnimations={false}
              className="!grid-cols-1 !gap-4.5 !p-0"
              cardData={[
                {
                  id: 'bg-btn-en',
                  color: '#232734',
                  title: 'English',
                  description: 'Select English language',
                  label: 'EN',
                  onClick: () => handleButtonClick('lang', 'en', '#bg-btn-en'),
                  icon: <ArrowRight className="w-5 h-5 text-white mr-2" strokeWidth={2.5} />
                },
                {
                  id: 'bg-btn-id',
                  color: '#FFFFFF',
                  title: 'Bahasa Indonesia',
                  description: 'Pilih bahasa Indonesia',
                  label: 'ID',
                  onClick: () => handleButtonClick('lang', 'id', '#bg-btn-id'),
                  icon: <ArrowRight className="w-5 h-5 text-[#64748B] mr-2" strokeWidth={2} />
                },
                {
                  id: 'bg-btn-tg',
                  color: '#FFFFFF',
                  title: 'Tagalog',
                  description: 'Pumili ng wikang Tagalog',
                  label: 'PH',
                  onClick: () => handleButtonClick('lang', 'tg', '#bg-btn-tg'),
                  icon: <ArrowRight className="w-5 h-5 text-[#64748B] mr-2" strokeWidth={2} />
                }
              ].map(card => ({
                ...card,
                // Add conditional text colors for the cards based on background
                className: card.color === '#FFFFFF' ? 'magic-bento-card--light' : ''
              }))}
            />
          </div>
        </div>
      )}

      {step === 'role' && (
        <div className="w-full flex flex-col items-center animate-fadeIn">
          {/* Title Area for Role selection */}
          <div className="text-center w-full mb-3" id="splash-role-title">
            <h2 className="text-[28px] font-bold text-[#1E293B] tracking-tight">
              {translations.roleTitle[lang]}
            </h2>
            <p className="font-sans font-normal text-[16px] text-[#475569] mt-3 leading-[18.25px] px-4">
              {translations.roleSubtitle[lang]}
            </p>
          </div>
          {/* Role Selection Buttons using MagicBento */}
          <div className="w-full mt-6">
            <MagicBento 
              textAutoHide={true}
              enableStars={false}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={false}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={12}
              glowColor="132, 0, 255"
              disableAnimations={false}
              className="!grid-cols-1 !gap-4.5 !p-0"
              cardData={[
                {
                  id: 'role-btn-employer',
                  color: '#232734',
                  title: translations.employerTitle[lang],
                  description: 'Login as an employer',
                  label: 'USER',
                  onClick: () => handleButtonClick('role', 'employer', '#role-btn-employer'),
                  icon: <ArrowRight className="w-5 h-5 text-white mr-2" strokeWidth={2.5} />
                },
                {
                  id: 'role-btn-helper',
                  color: '#FFFFFF',
                  title: translations.helperTitle[lang],
                  description: 'Login as a helper',
                  label: 'USER',
                  onClick: () => handleButtonClick('role', 'helper', '#role-btn-helper'),
                  icon: <ArrowRight className="w-5 h-5 text-[#64748B] mr-2" strokeWidth={2} />
                }
              ].map(card => ({
                ...card,
                className: card.color === '#FFFFFF' ? 'magic-bento-card--light' : ''
              }))}
            />
          </div>

          {/* Back Button to return to step 1 */}
          <button
            onClick={() => setStep('lang')}
            className="mt-6 text-[14px] font-bold text-[#E28743] hover:underline focus:outline-none cursor-pointer"
          >
            {translations.backText[lang]}
          </button>
        </div>
      )}

    </div>
  );
}
