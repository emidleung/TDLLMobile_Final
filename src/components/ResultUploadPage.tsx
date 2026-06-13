import React, { useState } from 'react';
import { Camera, Check, ShieldAlert, Sparkles, Send, Loader2, ArrowLeft, RefreshCw, Upload, Image } from 'lucide-react';
import { Task, Language } from '../types';

interface ResultUploadPageProps {
  task: Task;
  lang: Language;
  onSubmitAICheck: (imageUrl: string) => Promise<any>;
  onSubmitToEmployer: () => void;
  onNavigate: (view: string) => void;
}

import confetti from 'canvas-confetti';


export function ResultUploadPage({ task, lang, onSubmitAICheck, onSubmitToEmployer, onNavigate }: ResultUploadPageProps) {
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [aiReport, setAiReport] = useState<{ aiResult: 'pass' | 'minor_defect'; feedback: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      
      try {
        const report = await onSubmitAICheck(base64);
        if (report) {
          const formattedReport = {
            aiResult: report.rating === 'Pass' ? 'pass' as const : 'minor_defect' as const,
            feedback: report.explanation
          };
          setAiReport(formattedReport);
          if (formattedReport.aiResult === 'pass') {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ['#2E7D32', '#965020', '#F3A562']
            });
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = async (presetUrl: string) => {
    setSelectedImage(presetUrl);
    setIsUploading(true);
    setAiReport(null);
    try {
      const report = await onSubmitAICheck(presetUrl);
      if (report) {
        setAiReport({
          aiResult: report.rating === 'Pass' ? 'pass' as const : 'minor_defect' as const,
          feedback: report.explanation
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedImage('');
    setAiReport(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn w-full max-w-2xl mx-auto pb-12">
      
      {/* Visual back buttons */}
      <button
        onClick={() => onNavigate('dashboard')}
        className="flex items-center gap-1.5 text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'en' ? 'Back' : 'Kembali'}</span>
      </button>

      {/* Header section */}
      <section className="flex flex-col gap-1">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold">
          {lang === 'en' ? 'AI Plating Evaluation' : 'Evaluasi Tampilan Piring AI'}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {lang === 'en'
            ? 'Verify hygiene, plate surface spills, and food quality metrics with Gemini Vision checks instantly.'
            : 'Uji kebersihan sisa kuah tumpah di piring sebelum dihidangkan ke majikan.'}
        </p>
      </section>

      {/* Camera Capture box container */}
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm flex flex-col items-center justify-center min-h-[300px] relative">
        
        {selectedImage ? (
          <div className="w-full flex flex-col gap-4 animate-scaleUp">
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-outline-variant/60 max-h-[280px] bg-surface-container">
              <img src={selectedImage} alt="Dish Plate snapshot" className="w-full h-full object-cover" />
              
              <button
                onClick={handleReset}
                className="absolute top-3 right-3 bg-background/90 text-on-background border border-outline-variant hover:bg-surface-container-low rounded-full p-2.5 shadow transition-colors cursor-pointer"
                title="Change Photo"
              >
                <RefreshCw className="w-4.5 h-4.5" />
              </button>
            </div>
            
            <p className="text-center font-label-lg text-xs text-on-surface-variant italic font-semibold">
              {lang === 'en' ? 'Snapshot analysis completed.' : 'Analisis foto selesai terpilih.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-center py-6">
            <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center border border-primary/20">
              <Camera className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="font-headline-sm text-base text-on-surface font-bold leading-none">
                {lang === 'en' ? 'Take finished plate photo' : 'Pilih Foto Sajian'}
              </h3>
              <p className="font-body-md text-xs text-on-surface-variant max-w-[280px] mt-2 leading-relaxed">
                {lang === 'en' 
                  ? 'For best results, align the plate rim neatly in direct light.' 
                  : 'Letakkan piring sejajar berjarak 30cm di bawah sorot lampu.'}
              </p>
            </div>

            <label className="bg-primary text-on-primary font-label-lg font-bold px-5 py-3 rounded-xl hover:bg-surface-tint shadow-sm transition-all cursor-pointer flex items-center gap-1.5 mt-2">
              <Upload className="w-4 h-4" />
              <span>{lang === 'en' ? 'Select File / Capture' : 'Ambil Kamera / Unggah'}</span>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="sr-only"
              />
            </label>
          </div>
        )}

      </section>



      {/* AI Analyzing feedback indicator */}
      {isUploading && (
        <div className="bg-primary-fixed/30 border border-outline-variant rounded-xl p-5 flex items-center gap-4 text-left animate-pulse">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <div className="flex flex-col gap-1">
            <h4 className="font-label-lg font-bold text-[11px] text-primary uppercase tracking-wider leading-none">
              Gemini Vision Plating Auditor Running
            </h4>
            <p className="font-body-md text-xs text-on-surface-variant leading-snug">
               Auditing sauce overlaps... Analyzing dish volume... Comparing recipe visual consistency...
            </p>
          </div>
        </div>
      )}

      {/* Gemini response representation check */}
      {aiReport && (
        <div className={`p-5 rounded-xl border flex flex-col gap-3.5 shadow-sm ${
          aiReport.aiResult === 'pass'
            ? 'bg-secondary-container text-on-secondary-container border-secondary/35'
            : 'bg-error-container text-on-error-container border-error/35'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
              aiReport.aiResult === 'pass' ? 'bg-secondary' : 'bg-error'
            }`}>
              {aiReport.aiResult === 'pass' ? <Check className="w-5 h-5 font-bold" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            
            <div>
              <h4 className="font-headline-sm text-base font-bold text-on-surface">
                {lang === 'en' ? 'AI Evaluation Statement' : 'Hasil Verifikasi AI'}:{' '}
                <span className={aiReport.aiResult === 'pass' ? 'text-secondary font-bold' : 'text-error font-bold'}>
                  {aiReport.aiResult === 'pass' ? 'PASS (Bersih & Sesuai)' : 'FLAGGED (Butuh Dilap Rim)'}
                </span>
              </h4>
              <p className="font-mono text-[9px] tracking-wider uppercase text-on-surface-variant mt-0.5">
                Gemini Vision Kitchen Agent Verification
              </p>
            </div>
          </div>
          
          <p className="font-body-md text-xs text-on-surface/90 leading-relaxed bg-surface-container-lowest/50 p-3 rounded-lg border border-outline-variant/20 italic">
            "{aiReport.feedback}"
          </p>
        </div>
      )}

      {/* Form submit lock and navigation */}
      <div className="pt-4 flex justify-center border-t border-surface-variant mt-2">
        <button
          onClick={() => {
            onSubmitToEmployer();
            onNavigate('dashboard');
          }}
          disabled={!selectedImage || isUploading}
          className="w-full max-w-md h-[56px] bg-[#965020] text-white font-headline-sm rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>{lang === 'en' ? 'Submit to Employer' : 'Kirim Laporan Selesai'}</span>
        </button>
      </div>

    </div>
  );
}
