import React, { useState } from 'react';
import { Heart, UserPlus, Trash, ShieldAlert, Award, Smile, Plus, Clipboard, UserCheck } from 'lucide-react';
import { FamilyMember, Language } from '../types';

interface HealthProfilePageProps {
  members: FamilyMember[];
  lang: Language;
  onAddMember: (member: Omit<FamilyMember, 'memberID'>) => void;
  onDeleteMember: (id: string) => void;
}

export function HealthProfilePage({ members, lang, onAddMember, onDeleteMember }: HealthProfilePageProps) {
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [disease, setDisease] = useState<string>('None');
  const [allergy, setAllergy] = useState<string>('None');
  const [taste, setTaste] = useState<'light' | 'normal' | 'heavy'>('normal');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    onAddMember({
      userName: userName.trim(),
      disease,
      allergy,
      tastePreference: taste
    });
    setUserName('');
    setDisease('None');
    setAllergy('None');
    setTaste('normal');
    setShowAddForm(false);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn w-full max-w-2xl mx-auto pb-12">
      
      {/* Page Title */}
      <section className="flex flex-col gap-1">
        <h1 className="font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface font-bold">
          {lang === 'en' ? 'Family Health Profiles' : 'Profil Kesehatan Keluarga'}
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant">
          {lang === 'en'
            ? 'Declare family health criteria. Cooking steps adapt automatically to prevent mistakes.'
            : 'Simpan riwayat gizi keluarga Anda. Sistem otomatis memberi peringatan gizi ke asisten.'}
        </p>
      </section>

      {/* Buttons Controls */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-primary text-on-primary font-label-lg px-4 py-2.5 rounded-xl hover:bg-surface-tint shadow-sm transition-all cursor-pointer"
        >
          {showAddForm ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{showAddForm ? (lang === 'en' ? 'Close Form' : 'Tutup Formulir') : (lang === 'en' ? 'Add Family Profile' : 'Tambah Profil Anggota')}</span>
        </button>
      </div>

      {/* New profile creator form */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm flex flex-col gap-4 animate-scaleUp"
        >
          <div className="border-b border-surface-variant pb-2">
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {lang === 'en' ? 'Input New Profile Details' : 'Isi Informasi Anggota'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Name input */}
            <div className="flex flex-col gap-1">
              <label className="font-label-lg text-xs font-semibold text-on-surface-variant" htmlFor="person-name">
                {lang === 'en' ? 'Name / family relation' : 'Nama / Hubungan Keluarga'}
              </label>
              <input
                id="person-name"
                type="text"
                required
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Grandma, Uncle Charles"
                className="bg-surface border border-outline-variant rounded-lg p-2.5 font-body-md text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Disease control list */}
            <div className="flex flex-col gap-1">
              <label className="font-label-lg text-xs font-semibold text-on-surface-variant" htmlFor="condition-select">
                {lang === 'en' ? 'Diet Condition' : 'Pantangan Kesehatan / Penyakit'}
              </label>
              <select
                id="condition-select"
                value={disease}
                onChange={e => setDisease(e.target.value)}
                className="bg-surface border border-outline-variant rounded-lg p-2.5 font-body-md text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              >
                <option value="None">None (General Diet)</option>
                <option value="Diabetes">Diabetes (Low Sugar - Flag steps)</option>
                <option value="Hypertension">Hypertension (Low Sodium - Reductions)</option>
                <option value="Diabetes & Hypertension">Both Diabetes & Hypertension</option>
              </select>
            </div>

            {/* Food Allergies */}
            <div className="flex flex-col gap-1">
              <label className="font-label-lg text-xs font-semibold text-on-surface-variant" htmlFor="allergies-input">
                {lang === 'en' ? 'Allergenic Foods' : 'Alergi Bahan Makanan'}
              </label>
              <input
                id="allergies-input"
                type="text"
                value={allergy}
                onChange={e => setAllergy(e.target.value)}
                placeholder="e.g. Peanut, Crustaceans, Eggs or None"
                className="bg-surface border border-outline-variant rounded-lg p-2.5 font-body-md text-xs text-on-surface focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>

            {/* Taste preference */}
            <div className="flex flex-col gap-1">
              <label className="font-label-lg text-xs font-semibold text-on-surface-variant">
                {lang === 'en' ? 'Salt / Broth Dial' : 'Kekuatan Rasa Kuah'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['light', 'normal', 'heavy'] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTaste(t)}
                    className={`py-2 rounded-lg border text-xs font-bold font-label-lg capitalize cursor-pointer transition-all ${
                      taste === t
                        ? 'bg-primary text-on-primary border-primary shadow-sm'
                        : 'bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container-low'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-surface-variant">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-bold text-on-surface-variant hover:bg-surface-container-low cursor-pointer"
            >
              {lang === 'en' ? 'Cancel' : 'Batal'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-primary text-on-primary rounded-lg text-xs font-bold hover:bg-surface-tint shadow cursor-pointer"
            >
              {lang === 'en' ? 'Save Member Profile' : 'Simpan Anggota'}
            </button>
          </div>
        </form>
      )}

      {/* Profiles Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {members.map(member => {
          const isCautionRequired = member.disease !== 'None' || (member.allergy && member.allergy.toLowerCase() !== 'none');
          return (
            <div
              key={member.memberID}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-sm relative group hover:shadow-md transition-shadow"
            >
              {/* Trash card delete */}
              <button
                onClick={() => onDeleteMember(member.memberID)}
                className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-error hover:bg-error-container/30 rounded-lg transition-colors cursor-pointer"
                title="Remove profile"
              >
                <Trash className="w-4 h-4" />
              </button>

              <div className="flex flex-col gap-4">
                
                {/* Header detail */}
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isCautionRequired 
                      ? 'bg-error-container border-error text-error' 
                      : 'bg-secondary-container border-secondary text-secondary'
                  }`}>
                    {isCautionRequired ? (
                      <ShieldAlert className="w-6 h-6 animate-pulse" />
                    ) : (
                      <Smile className="w-6 h-6" />
                    )}
                  </div>
                  
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-on-surface">
                      {member.userName}
                    </h3>
                    <p className="font-mono text-[9px] uppercase tracking-wider text-on-surface-variant">
                      Member ID: {member.memberID}
                    </p>
                  </div>
                </div>

                {/* Characteristics listings */}
                <div className="pt-3 border-t border-surface-variant flex flex-col gap-2 text-xs">
                  
                  <div className="flex justify-between items-center bg-surface p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-on-surface-variant font-label-lg text-[11px]">{lang === 'en' ? 'Dietary Limitation' : 'Kondisi Diet'}</span>
                    <span className={`font-bold ${member.disease !== 'None' ? 'text-primary' : 'text-on-surface'}`}>
                      {member.disease}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-surface p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-on-surface-variant font-label-lg text-[11px]">{lang === 'en' ? 'Allergen Rules' : 'Alergen Alergi'}</span>
                    <span className={`font-bold ${member.allergy !== 'None' ? 'text-error font-bold' : 'text-on-surface'}`}>
                      {member.allergy}
                    </span>
                  </div>

                  <div className="flex justify-between items-center bg-surface p-2 rounded-lg border border-outline-variant/30">
                    <span className="text-on-surface-variant font-label-lg text-[11px]">{lang === 'en' ? 'Broth Level Preference' : 'Rasa Pilihan'}</span>
                    <span className="font-bold text-secondary capitalize text-xs">
                      {member.tastePreference}
                    </span>
                  </div>

                </div>

              </div>
            </div>
          );
        })}

        {members.length === 0 && (
          <div className="col-span-full py-12 text-center bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl">
            <Clipboard className="w-12 h-12 stroke-1 mx-auto mb-2 text-primary" />
            <p className="font-headline-sm text-sm text-on-surface font-semibold">
              {lang === 'en' ? 'No health profiles set.' : 'Belum ada data anggota keluarga.'}
            </p>
            <p className="font-body-md text-xs text-on-surface-variant mt-1 px-4">
              {lang === 'en' ? 'Assign healthy guidelines to safeguard senior grandparents or low-sugar diets.' : 'Atur data diet garam/gula sekarang.'}
            </p>
          </div>
        )}
      </section>

    </div>
  );
}
