import React, { useState } from 'react';
import { Star, Settings, Languages, LogOut, CheckCircle } from 'lucide-react';
import { Language, Review, Role } from '../types';

interface FeedbackSettingsPageProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onSubmitReview: (starRate: number, comment: string) => void;
  reviews: Review[];
  latestTaskTitle: string | null;
  role: Role | null;
  onLogout?: () => void;
}

export function FeedbackSettingsPage({
  lang,
  onSetLang,
  onSubmitReview,
  reviews,
  latestTaskTitle,
  role,
  onLogout
}: FeedbackSettingsPageProps) {
  const [starRate, setStarRate] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [successToast, setSuccessToast] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);


  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitReview(starRate, comment);
    setComment('');
    setSuccessToast(lang === 'en' ? 'Rating sent' : 'Ulasan/skor berhasil terkirim');
    setTimeout(() => setSuccessToast(''), 3000);
  };

  return (
    <div className="flex flex-col gap-[28px] animate-fadeIn w-full max-w-[480px] mx-auto">
      
      {/* Title */}
      <section className="flex flex-col gap-2 mt-2">
        <h1 className="text-[34px] font-bold text-app-text-title leading-tight">
          {lang === 'en' ? 'Ratings & Settings' : lang === 'id' ? 'Ulasan & Pengaturan' : 'Mga Rating at Setting'}
        </h1>
        <p className="text-[20px] font-normal text-app-text-muted leading-relaxed">
          {lang === 'en'
            ? (role === 'helper' 
                ? 'Complete your self-evaluation, reflect on your cooking, and configure preferences.'
                : 'Evaluate the cooked meals, provide feedback to your helper, and configure preferences.')
            : (role === 'helper'
                ? 'Selesaikan evaluasi diri Anda, renungkan masakan Anda, dan atur preferensi.'
                : 'Evaluasi masakan, berikan umpan balik kepada asisten Anda, dan atur preferensi.')}
        </p>
      </section>

      {/* Success notification */}
      {successToast && (
        <div className="p-5 bg-[#E8F8EA] border border-green-200 text-emerald-950 font-bold text-[20px] rounded-[14px] flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Star satisfaction score submission */}
      {latestTaskTitle ? (
        <form onSubmit={handleReviewSubmit} className="bg-white border border-app-border rounded-[14px] p-[28px] flex flex-col gap-5 shadow-sm">
          <div>
            <h3 className="text-[24px] font-bold text-app-text-title">
              {lang === 'en' 
                ? (role === 'helper' ? 'Self-Evaluation' : 'Evaluation') 
                : (role === 'helper' ? 'Evaluasi Diri' : 'Evaluasi')}
            </h3>
            <p className="text-[18px] font-normal text-app-text-muted mt-1">
              {lang === 'en' 
                ? (role === 'helper' ? "Self-evaluation for today's cooked:" : "Evaluation for today's cooked:") 
                : (role === 'helper' ? 'Evaluasi diri untuk masakan hari ini:' : 'Evaluasi untuk masakan hari ini:')} <strong>{latestTaskTitle}</strong>
            </p>
          </div>

          {/* Stars Row */}
          <div className="flex flex-col gap-2">
            <span className="text-[18px] font-semibold text-app-text-muted uppercase tracking-wider">
              {lang === 'en' ? 'Meal Quality Rating' : lang === 'id' ? 'Rating Kualitas Makanan' : 'Rating ng Kalidad ng Pagkain'}
            </span>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(idx => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStarRate(idx)}
                  className="p-1 transition-transform hover:scale-110 select-none cursor-pointer"
                >
                  <Star
                    className={`w-9 h-9 ${
                      starRate >= idx ? 'fill-app-orange text-app-orange' : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Commentary */}
          <div className="flex flex-col gap-2">
            <span className="text-[18px] font-semibold text-app-text-muted uppercase tracking-wider">
              {lang === 'en' 
                ? (role === 'helper' ? 'Self-Evaluation (Auto-translated)' : 'Evaluation (Auto-translated)') 
                : (role === 'helper' ? 'Evaluasi Diri (Terjemahan Otomatis)' : 'Evaluasi (Terjemahan Otomatis)')}
            </span>
            <textarea
              value={comment}
              required
              onChange={e => setComment(e.target.value)}
              placeholder={lang === 'en' 
                ? (role === 'helper' 
                    ? "e.g. My stir-fry was a bit too dry today, I will add more water next time..." 
                    : "e.g. The stir-fry was delicious! Maybe a bit less salt next time...") 
                : (role === 'helper'
                    ? "misal: Masakan saya agak terlalu kering hari ini, saya akan tambahkan lebih banyak air lain kali..."
                    : "misal: Masakannya enak! Mungkin kurangi sedikit garam lain kali...")}
              rows={3}
              className="w-full bg-[#FCF9F2] border border-app-border rounded-[14px] p-4 text-[20px] text-app-text-title focus:outline-none focus:border-app-orange font-sans placeholder-gray-400"
            />
          </div>

          <button
            type="submit"
            className="w-full h-14 bg-app-orange hover:bg-orange-400 text-[#444444] font-bold text-[20px] rounded-[14px] shadow-sm cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1"
          >
            {lang === 'en' 
              ? (role === 'helper' ? 'Submit Self-Evaluation' : 'Submit Evaluation') 
              : (role === 'helper' ? 'Kirim Evaluasi Diri' : 'Kirim Evaluasi')}
          </button>
        </form>
      ) : (
        <div className="bg-white border border-app-border p-[32px] rounded-[14px] text-center flex flex-col items-center gap-3 py-10">
          <Star className="w-12 h-12 text-gray-300" strokeWidth={1} />
          <span className="text-[20px] font-medium text-app-text-muted">
            No unrated dishes found today. Finish a cooking roadmap first to trigger score reviews.
          </span>
        </div>
      )}

      {/* System Settings Configurations */}
      <section className="bg-white border border-app-border rounded-[14px] p-[28px] flex flex-col gap-5 shadow-sm">
        <div>
          <h3 className="text-[24px] font-bold text-app-text-title flex items-center gap-2">
            <Settings className="w-5 h-5 text-app-orange" />
            <span>Accessibility Preferences</span>
          </h3>
          <p className="text-[18px] font-normal text-app-text-muted mt-1 leading-snug">
            Manage vocal read-aloud options, languages toggles, and senior readability modes.
          </p>
        </div>

        {/* Dynamic List Switches */}
        <div className="flex flex-col gap-4 pt-3 border-t border-app-border">
          
          {/* Sounds Switch */}
          <div className="flex items-center justify-between p-4 bg-[#FCF9F2] rounded-[14px] border border-app-border">
            <div className="flex flex-col gap-0.5 max-w-[240px]">
              <span className="text-[20px] font-bold text-app-text-title">Vocal Audio Guide</span>
              <p className="text-[16px] text-app-text-muted">Play loud audio-vocal directions for foreign helper.</p>
            </div>
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-app-orange' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all ${
                soundEnabled ? 'left-6' : 'left-1'
              }`} />
            </button>
          </div>


        </div>
      </section>

      {/* Historical feedback reviews scores */}
      <section className="bg-white border border-app-border rounded-[14px] p-[28px] flex flex-col gap-4 shadow-sm">
        <h3 className="text-[24px] font-bold text-app-text-title">
          {lang === 'en' 
             ? (role === 'employer' ? 'Historical Evaluation Scores' : 'Historical Self-Evaluation Scores') 
             : (role === 'employer' ? 'Riwayat Skor Evaluasi' : 'Riwayat Skor Evaluasi Diri')}
        </h3>
        
        <div className="flex flex-col gap-4">
          {reviews.length > 0 ? (
            reviews.map((rev, idx) => {
              const dt = new Date(rev.createTime);
              const validDate = !isNaN(dt.getTime());
              const isEmployerReview = rev.role === 'employer';
              return (
              <div key={idx} className="bg-[#FCF9F2] p-4 border border-app-border rounded-[14px] flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[18px] font-bold text-[#444444]">{rev.taskTitle}</span>
                    <div className="flex text-app-orange gap-0.5">
                      {Array.from({ length: rev.starRate }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current text-app-orange" />
                      ))}
                      {Array.from({ length: 5 - rev.starRate }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-gray-300" />
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 text-[14px] text-app-text-muted">
                    <div className="flex flex-col items-end leading-tight">
                      <span>{validDate ? dt.toLocaleDateString() : ''}</span>
                      <span>{validDate ? dt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}</span>
                    </div>
                    <span className={`whitespace-nowrap px-2 py-0.5 rounded text-[12px] font-bold ${isEmployerReview ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {isEmployerReview ? 'Employer Eval' : 'Self-Eval'}
                    </span>
                  </div>
                </div>
                <p className="text-[20px] italic text-[#444444] mt-2">"{rev.comment}"</p>
              </div>
            )})
          ) : (
            <span className="text-[18px] text-app-text-muted italic">
              No historical scores registered yet.
            </span>
          )}
        </div>
      </section>

      {/* Logout button at screen bottom */}
      {onLogout && (
        <button
          onClick={onLogout}
          className="w-full h-14 border border-red-200 hover:bg-red-50 text-red-600 rounded-[14px] font-bold text-[20px] transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
        >
          <LogOut className="w-5 h-5" />
          <span>Exit Workspace (Switch Role)</span>
        </button>
      )}

    </div>
  );
}
