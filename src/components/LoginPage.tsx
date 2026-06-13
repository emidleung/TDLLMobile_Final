import React, { useState, useRef } from 'react';
import { Globe, ChevronDown, Lock, ArrowLeft, Mail, Eye, EyeOff, Camera, User } from 'lucide-react';
import { Language, Role } from '../types';
import { auth, db, storage } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from "firebase/auth";
import { doc, setDoc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

// Firestore Error Helper conforming to Firebase-Integration skill guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  const errInfo: FirestoreErrorInfo = {
    error: errorMessage,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };

  console.error('Firestore Error: ', JSON.stringify(errInfo));

  // If it's an offline error, don't throw a fatal error that breaks the app,
  // just return null or throw a less scary error.
  if (errorMessage.includes("client is offline") || errorMessage.includes("network-error")) {
    console.warn("Firestore is currently offline. Some features may be unavailable.");
    return null;
  }

  throw new Error(JSON.stringify(errInfo));
}

const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const getAuthErrorMessage = (error: any, lang: Language): string => {
  const code = error?.code || "";
  const msg = error?.message || "";
  
  if (code === "auth/email-already-in-use" || msg.includes("auth/email-already-in-use") || msg.includes("email-already-in-use")) {
    if (lang === 'id') return "Alamat email ini sudah terdaftar atau sedang digunakan oleh akun lain.";
    if (lang === 'tg') return "Ang email address na ito ay nakarehistro na o kasalukuyang ginagamit ng ibang account.";
    return "This email address is already in use by another account.";
  }
  
  if (code === "auth/weak-password" || msg.includes("auth/weak-password") || msg.includes("weak-password")) {
    if (lang === 'id') return "Kata sandi terlalu lemah. Minimal harus terdiri dari 6 karakter.";
    if (lang === 'tg') return "Masyadong mahina ang password. Dapat ay hindi bababa sa 6 na karakter.";
    return "The password is too weak. It must be at least 6 characters long.";
  }

  if (code === "auth/invalid-email" || msg.includes("auth/invalid-email") || msg.includes("invalid-email")) {
    if (lang === 'id') return "Format alamat email tidak valid.";
    if (lang === 'tg') return "Hindi wasto ang format ng email address.";
    return "The email address is badly formatted.";
  }

  return error?.message || String(error);
};

interface LoginPageProps {
  onLogin: (overrideRole?: Role, userAvatar?: string | null, userFullName?: string | null, currentUserId?: string | null) => void;
  onBack: () => void;
  lang: Language;
  onSetLang: (lang: Language) => void;
  initialRole: Role;
}

export function LoginPage({ onLogin, onBack, lang, onSetLang, initialRole }: LoginPageProps) {
  // Navigation sub-steps of login process:
  // 'login' | 'create_account' | 'complete_profile' | 'forgot_details'
  const [subStep, setSubStep] = useState<'login' | 'create_account' | 'complete_profile' | 'forgot_details'>('login');
  
  // Fields state
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedProfileLang, setSelectedProfileLang] = useState<string>('English');
  const [selectedRole, setSelectedRole] = useState<Role>(initialRole || 'employer');
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string>('');
  
  // Custom Avatar upload state
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Interactive glow effect helper matching LaunchPage style
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

  const translations = {
    userIDLabel: {
      en: 'User ID',
      id: 'ID Pengguna',
      tg: 'ID ng User'
    },
    userIDPlaceholder: {
      en: 'Enter your 8-digit ID',
      id: 'Masukkan 8-digit ID Anda',
      tg: 'Ilagay ang iyong 8-digit ID'
    },
    passwordLabel: {
      en: 'Password',
      id: 'Kata Sandi',
      tg: 'Password'
    },
    logInBtn: {
      en: 'Log In',
      id: 'Masuk',
      tg: 'Mag-log In'
    },
    createAccountBtn: {
      en: 'Create Account',
      id: 'Buat Akun',
      tg: 'Gumawa ng Account'
    },
    forgotUIDBtn: {
      en: 'Forgot your User ID or Password?',
      id: 'Lupa ID Pengguna atau Kata Sandi?',
      tg: 'Nakalimutan ang User ID o Password?'
    },
    backText: {
      en: '← Back to Role Selection',
      id: '← Kembali ke Pemilihan Peran',
      tg: '← Bumalik sa Pagpili ng Papel'
    }
  };

  const languages = [
    { code: 'en' as Language, label: 'English' },
    { code: 'id' as Language, label: 'Bahasa Indonesia' },
    { code: 'tg' as Language, label: 'Tagalog' }
  ];

  const currentLangLabel = languages.find(l => l.code === lang)?.label || 'English';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let userEmail = '';
      let userRole: Role = selectedRole;
      let userAvatar: string | null = null;
      let userFullName: string | null = null;
      let resolvedUserId = userId;

      if (userId.includes('@')) {
        userEmail = userId;
        const q = query(collection(db, "users"), where("email", "==", userEmail));
        const qSnap = await getDocs(q).catch((err) => {
          return handleFirestoreError(err, OperationType.LIST, "users");
        });
        if (qSnap && !qSnap.empty) {
          const uDoc = qSnap.docs[0];
          resolvedUserId = uDoc.id;
          userRole = uDoc.data().role || selectedRole;
          userFullName = uDoc.data().fullName || null;

          // Load avatar
          const avatarSnap = await getDoc(doc(db, "users", resolvedUserId, "profile_data", "avatar")).catch((err) => {
            console.warn("Avatar subcollection read failed/skipped: ", err.message);
            return null;
          });
          if (avatarSnap && avatarSnap.exists()) {
            userAvatar = avatarSnap.data().base64Image;
          }
        }
      } else {
        resolvedUserId = userId;
        // Search Firestore directly for the user
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef).catch((err) => {
          return handleFirestoreError(err, OperationType.GET, `users/${userId}`);
        });

        if (docSnap && docSnap.exists()) {
          const userData = docSnap.data();
          userEmail = userData.email || `${userId}@mock.com`;
          userRole = userData.role || selectedRole;
          userFullName = userData.fullName || null;

          // Load avatar from the nested profile_data/avatar document
          const avatarSnap = await getDoc(doc(db, "users", userId, "profile_data", "avatar")).catch((err) => {
            console.warn("Avatar subcollection read failed/skipped: ", err.message);
            return null;
          });
          if (avatarSnap && avatarSnap.exists()) {
            userAvatar = avatarSnap.data().base64Image;
          }
        } else {
          // If not found, check if it's a known mock ID to bypass login (during seeding transition)
          if (userId === 'employer-1' || userId === 'helper-1') {
            userEmail = `${userId}@mock.com`;
            userRole = userId === 'employer-1' ? 'employer' : 'helper';
            onLogin(userRole, null, null, userId);
            return;
          } else {
            alert(lang === 'en' ? 'Incorrect User ID or Password.' : 'ID Pengguna atau Kata Sandi salah.');
            setIsSubmitting(false);
            return;
          }
        }
      }

      await signInWithEmailAndPassword(auth, userEmail, password);
      onLogin(userRole, userAvatar, userFullName, resolvedUserId);
    } catch (error: any) {
      console.warn("Login Error: ", error.message);
      alert(lang === 'en' ? 'Failed to log in: ' + error.message : 'Gagal masuk: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, `users/${userId}`);
      });
      if (docSnap && docSnap.exists()) {
        alert("This 8-Digit ID is already in use.");
        setIsSubmitting(false);
        return;
      }
      setSubStep('complete_profile');
    } catch (error: any) {
      alert("Verification failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Safety timeout: stop loading after 5 seconds no matter what
    const timeout = setTimeout(() => {
      setIsSubmitting(false);
      console.log("Forced stop due to potential timeout");
    }, 5000);

    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, `users/${userId}`);
      });
      if (docSnap && docSnap.exists()) {
        alert("This 8-Digit ID is already in use.");
        setIsSubmitting(false);
        clearTimeout(timeout);
        return;
      }

      let iconString = "";
      if (profileImageFile) {
        try {
          iconString = await convertToBase64(profileImageFile);
        } catch (base64Error: any) {
          console.warn("Base64 conversion failed: ", base64Error.message);
        }
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      const dietaryArray = dietaryRestrictions ? dietaryRestrictions.split(',').map(d => d.trim()).filter(Boolean) : [];
      
      // Save primary fields to primary document
      await setDoc(docRef, {
        email: email,
        fullName: fullName,
        role: selectedRole,
        primaryLanguage: selectedProfileLang,
        dietaryRestrictions: dietaryArray,
        firebaseUid: userCredential.user.uid,
        createdAt: new Date()
      }).catch((err) => {
        handleFirestoreError(err, OperationType.CREATE, `users/${userId}`);
      });

      // Save subcollection binary/base64 avatars
      if (iconString || avatarImage) {
        const base64ToSave = iconString || avatarImage || "";
        await setDoc(doc(db, "users", userId, "profile_data", "avatar"), {
          base64Image: base64ToSave,
          updatedAt: new Date()
        }).catch((err) => {
          handleFirestoreError(err, OperationType.CREATE, `users/${userId}/profile_data/avatar`);
        });
      }

      alert("Account and Profile Icon saved successfully!");
      onLogin(selectedRole, iconString || avatarImage || null, fullName, userId);
    } catch (error: any) {
      console.warn("Sign Up Error: ", error.message);
      const friendlyMessage = getAuthErrorMessage(error, lang);
      alert(lang === 'id' ? "Gagal membuat akun: " + friendlyMessage : lang === 'tg' ? "Bigo sa paggawa ng account: " + friendlyMessage : "Failed to create account: " + friendlyMessage);
    } finally {
      clearTimeout(timeout); // Clear the safety timer
      setIsSubmitting(false);
    }
  };

  const handleHeaderBack = () => {
    if (subStep === 'complete_profile') {
      setSubStep('create_account');
    } else if (subStep === 'create_account' || subStep === 'forgot_details') {
      setSubStep('login');
    } else {
      onBack();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex-grow flex flex-col w-full max-w-[480px] mx-auto animate-fadeIn px-2 py-4 relative" id="login-screen-view">
      
      {/* Top Header Row with Back Button on left and language selector dropdown on right */}
      <div className="w-full flex items-center justify-between mb-8 px-2" id="login-top-bar">
        <div className="flex items-center gap-2">
          {/* High-fidelity Back Arrow Icon Button */}
          <button
            type="button"
            onClick={handleHeaderBack}
            className="p-1.5 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#475569] hover:text-black focus:outline-none flex items-center justify-center shrink-0 mr-1"
            id="login-back-arrow"
            title="Go back"
          >
            <ArrowLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          
          {/* Brand Logo matching original style */}
          <span className="font-sans font-bold text-[28px] text-[#FF9D54]">
            Belaja
          </span>
        </div>

        {/* Floating Language Dropdown Pill exactly like the png design */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 h-10 px-4 rounded-full border border-[#D1D5DB] bg-white text-[#4B5563] text-[15px] font-semibold shadow-sm hover:bg-[#F9FAFB] cursor-pointer focus:outline-none transition-all"
            id="login-lang-selector"
          >
            <Globe className="w-4 h-4 text-[#F3A562]" />
            <span>{currentLangLabel}</span>
            <ChevronDown className="w-4 h-4 text-[#6B7280] ml-1" />
          </button>

          {showLangDropdown && (
            <div className="absolute right-0 mt-2 w-48 rounded-[16px] bg-white border border-[#E5E7EB] shadow-lg py-2 z-50 animate-fadeIn">
              {languages.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => {
                    onSetLang(item.code);
                    setShowLangDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-2.5 text-[14px] font-semibold hover:bg-[#F3F4F6] cursor-pointer block ${
                    lang === item.code ? 'text-[#FF9D54] bg-[#FFFBEB]' : 'text-[#374151]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* VIEW SWITCHER: LOGIN SCREEN */}
      {subStep === 'login' && (
        <>
          <form
            onSubmit={handleLoginSubmit}
            className="w-full bg-[#FFA65C] rounded-[40px] px-8 pt-10 pb-12 shadow-xl flex flex-col gap-6"
            id="login-orange-card"
          >
            {/* User ID Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                {translations.userIDLabel[lang]}
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-[#F3A562]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                    <line x1="7" y1="8" x2="11" y2="8" />
                    <line x1="7" y1="12" x2="11" y2="12" />
                    <circle cx="16" cy="11" r="2" />
                  </svg>
                </div>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={8}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder={translations.userIDPlaceholder[lang]}
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="login-userid-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                {translations.passwordLabel[lang]}
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#F3A562]" strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-15 pl-14 pr-12 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="login-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#F3A562] hover:text-[#FFA65C] transition-colors focus:outline-none p-1 shrink-0"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-2" />

            {/* Log In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => triggerGlow('#login-submit-button')}
              className="w-full h-15 rounded-full bg-[#EEF2FF] text-[#111827] text-[18px] font-bold shadow-md hover:bg-[#E2E8F0] active:scale-[0.99] transition-all cursor-pointer focus:outline-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              id="login-submit-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin"></span>
                  Please wait...
                </span>
              ) : translations.logInBtn[lang]}
            </button>

            {/* Bottom Accent Line matching visual mockup design */}
            <hr className="border-t border-white/40 mt-3" />
          </form>

          {/* Under Screen Buttons */}
          <div className="w-full flex flex-col items-center gap-4.5 mt-8 px-4" id="login-bottom-links">
            <button
              type="button"
              onClick={() => setSubStep('create_account')}
              className="font-sans font-bold text-[16px] text-black hover:underline cursor-pointer focus:outline-none"
            >
              {translations.createAccountBtn[lang]}
            </button>
            <button
              type="button"
              onClick={() => setSubStep('forgot_details')}
              className="font-sans font-bold text-[16px] text-black hover:underline cursor-pointer focus:outline-none"
            >
              {translations.forgotUIDBtn[lang]}
            </button>
            
            {/* Back Button to return to Role Selection */}
            <button
              type="button"
              onClick={onBack}
              className="mt-2 text-[14px] font-bold text-[#E28743] hover:underline focus:outline-none cursor-pointer"
              id="login-bottom-back-btn"
            >
              {translations.backText[lang]}
            </button>
          </div>
        </>
      )}

      {/* VIEW SWITCHER: CREATE ACCOUNT SCREEN */}
      {subStep === 'create_account' && (
        <>
          <form
            onSubmit={handleRegisterSubmit}
            className="w-full bg-[#FFA65C] rounded-[40px] px-8 pt-10 pb-12 shadow-xl flex flex-col gap-6"
            id="register-orange-card"
          >
            {/* Desired User ID Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Desired User ID (Digits only)
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-6 h-6 text-[#F3A562]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                    <line x1="7" y1="8" x2="11" y2="8" />
                    <line x1="7" y1="12" x2="11" y2="12" />
                    <circle cx="16" cy="11" r="2" />
                  </svg>
                </div>
                <input
                  type="text"
                  pattern="[0-9]*"
                  inputMode="numeric"
                  maxLength={8}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="Enter your 8-digit ID"
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="register-userid-input"
                  required
                />
              </div>
            </div>

            {/* Email Address Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Email Address
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#F3A562]" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@example.com"
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="register-email-input"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Password
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#F3A562]" strokeWidth={2.5} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-15 pl-14 pr-12 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="register-password-input"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-[#F3A562] hover:text-[#FFA65C] transition-colors focus:outline-none p-1 shrink-0"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Spacer */}
            <div className="h-2" />

            {/* Continue Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => triggerGlow('#register-submit-button')}
              className="w-full h-15 rounded-full bg-[#EEF2FF] text-[#111827] text-[18px] font-bold shadow-md hover:bg-[#E2E8F0] active:scale-[0.99] transition-all cursor-pointer focus:outline-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              id="register-submit-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin"></span>
                  Verifying ID...
                </span>
              ) : "Continue"}
            </button>
          </form>

          {/* Bottom redirection trigger links */}
          <div className="w-full flex flex-col items-center gap-4.5 mt-8 px-4" id="register-bottom-links">
            <button
              type="button"
              onClick={() => setSubStep('login')}
              className="font-sans font-bold text-[16px] text-black hover:underline cursor-pointer focus:outline-none"
            >
              Already have an account? Log In
            </button>
          </div>
        </>
      )}

      {/* VIEW SWITCHER: COMPLETE YOUR PROFILE SCREEN */}
      {subStep === 'complete_profile' && (
        <>
          <form
            onSubmit={handleProfileSubmit}
            className="w-full bg-[#FFA65C] rounded-[40px] px-8 pt-10 pb-12 shadow-xl flex flex-col gap-6 animate-fadeIn"
            id="profile-orange-card"
          >
            {/* Header Text Area */}
            <div className="text-center w-full flex flex-col items-center">
              <h2 className="text-[25px] font-bold text-[#1E293B] tracking-tight text-center">
                Complete your profile
              </h2>
              <p className="font-sans font-semibold text-[15px] text-[#1E293B] mt-2.5 leading-snug px-3 text-center">
                Tell us a bit about yourself to enhance the experience !
              </p>
            </div>

            {/* Custom Circular Avatar with overlay camera selector icon badge strictly matching mockup */}
            <div className="w-full flex justify-center py-2" id="profile-avatar-selector">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
              <div 
                onClick={triggerUpload}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerUpload(); }}
                className="relative w-28 h-28 rounded-full bg-[#EEF2FF] border-[3px] border-white cursor-pointer hover:scale-105 active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-white/30 shadow-[0_4px_16px_rgba(0,0,0,0.15)] flex items-center justify-center animate-fadeIn"
                title="Click to upload customized profile icon"
              >
                {/* Inner shape styled with overflow hidden to safely mask custom upload image without clipping status badges */}
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {avatarImage ? (
                    <img
                      src={avatarImage}
                      alt="Upload customized icon"
                      className="w-full h-full object-cover animate-fadeIn"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-14 h-14 text-[#94A3B8]" />
                  )}
                </div>
                
                {/* High contrast, prominent camera badge that stands out and overlaps the corner border beautifully */}
                <div 
                  className="absolute -bottom-1 -right-1 bg-white hover:bg-[#FFF5ED] text-[#FF9D54] h-10 w-10 rounded-full shadow-[0_4px_12px_rgba(255,157,84,0.3)] border-2 border-white flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95 z-20"
                  id="camera-badge-icon"
                >
                  <Camera className="w-5 h-5 text-[#FF9D54]" strokeWidth={2.5} />
                </div>
              </div>
            </div>

            {/* Full Name Field */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Full Name
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-[#F3A562]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="profile-fullname-input"
                  required
                />
              </div>
            </div>

            {/* Choose Employer or Helper Option (Requirement: The users are able to choose if they are employer or helper) */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Identify Your Role
              </label>
              <div className="grid grid-cols-2 gap-3 mt-1" id="profile-role-pill-row">
                {(['employer', 'helper'] as Role[]).map((r) => {
                  const isSelected = selectedRole === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedRole(r)}
                      className={`h-12 rounded-full text-[15px] font-bold text-center transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-2 ${
                        isSelected 
                          ? 'bg-[#EEF2FF] text-[#1E293B] shadow-md font-extrabold ring-2 ring-white/40' 
                          : 'bg-white/30 text-[#1E293B]/80 border border-white/20 hover:bg-white/45'
                      }`}
                    >
                      <span className="capitalize">{r === 'employer' ? 'Employer' : 'Helper'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dietary Restrictions Column Field (Requirement: add a column which the user can enter their dietary restrictions) */}
            {selectedRole === 'employer' && (
              <div className="flex flex-col gap-2 animate-fadeIn">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Dietary Restrictions
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-5 h-5 text-[#F3A562]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2c1.38 0 2.5 1.12 2.5 2.5S13.38 7 12 7 9.5 5.88 9.5 4.5 10.62 2 12 2z" />
                    <path d="M12 7c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z" />
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={dietaryRestrictions}
                  onChange={(e) => setDietaryRestrictions(e.target.value)}
                  placeholder="e.g. No Pork, Seafood, Halal, Vegetarian"
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-medium placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="profile-dietary-input"
                />
              </div>
            </div>
            )}

            {/* Primary Language selection row exactly matching the photo layout */}
            <div className="flex flex-col gap-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Primary Language
              </label>
              
              <div className="grid grid-cols-3 gap-2 mt-1" id="profile-lang-pill-row">
                {['English', 'Tagalog', 'Bahasa Indon'].map((l) => {
                  const isSelected = selectedProfileLang === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setSelectedProfileLang(l)}
                      className={`h-12 px-1 rounded-full text-[14px] font-bold text-center transition-all cursor-pointer focus:outline-none shrink-0 ${
                        isSelected 
                          ? 'bg-[#EEF2FF] text-[#1E293B] shadow-sm font-extrabold' 
                          : 'bg-white/30 text-[#1E293B]/70 border border-white/20 hover:bg-white/45'
                      }`}
                    >
                      {l}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Spacer */}
            <div className="h-1" />

            {/* Final Save Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => triggerGlow('#profile-save-button')}
              className="w-full h-15 rounded-full bg-[#EEF2FF] text-[#111827] text-[18px] font-bold shadow-md hover:bg-[#E2E8F0] active:scale-[0.99] transition-all cursor-pointer focus:outline-none flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
              id="profile-save-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin"></span>
                  Creating Account...
                </span>
              ) : "Continue"}
            </button>
          </form>

          {/* Back Trigger links */}
          <div className="w-full flex flex-col items-center gap-3 mt-6 px-4">
            <button
              type="button"
              onClick={handleHeaderBack}
              className="text-[14px] font-bold text-[#E28743] hover:underline focus:outline-none cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Account Creation
            </button>
          </div>
        </>
      )}

      {/* VIEW SWITCHER: FORGOT DETAILS SCREEN */}
      {subStep === 'forgot_details' && (
        <>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setIsSubmitting(true);
              try {
                await sendPasswordResetEmail(auth, forgotEmail);
                alert(lang === 'en' ? 'A recovery link has been sent to ' + forgotEmail : 'Tautan pemulihan telah dikirim ke ' + forgotEmail);
                setSubStep('login');
              } catch (error: any) {
                console.warn("Recovery Error: ", error.message);
                alert(lang === 'en' ? 'Failed to send recovery email: ' + error.message : 'Gagal mengirim email pemulihan: ' + error.message);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="w-full bg-[#FFA65C] rounded-[40px] px-8 pt-10 pb-12 shadow-xl flex flex-col gap-6 items-center animate-fadeIn"
            id="forgot-details-card"
          >
            {/* Custom Circular Reset Lock Icon Container */}
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md mt-1 animate-fadeIn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-10 h-10 text-[#FF9D54]"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Curved anticlockwise recovery/history arrow circle path */}
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                {/* Padlock shape */}
                <rect x="9" y="12" width="6" height="5" rx="1.5" />
                <path d="M10 12v-1.5a2 2 0 0 1 4 0V12" />
              </svg>
            </div>

            {/* Header Title */}
            <h2 className="text-[28px] font-extrabold text-[#1E293B] tracking-tight mt-1 animate-fadeIn">
              Forgot Details?
            </h2>

            {/* Description Paragraph */}
            <p className="font-sans font-semibold text-[15.5px] text-[#1E293B] text-center leading-normal max-w-[325px] -mt-1 px-1">
              Enter your registered email to recover your User ID and reset your password.
            </p>

            {/* Email Address Label and Field */}
            <div className="flex flex-col gap-2 w-full mt-2">
              <label className="font-sans font-bold text-[17px] text-[#1E293B] block">
                Email Address
              </label>
              <div className="w-full relative flex items-center">
                <div className="absolute left-4.5 z-10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#F3A562]" strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="e.g. maria@example.com"
                  className="w-full h-15 pl-14 pr-4 bg-[#EEF2FF] rounded-[22px] border-none text-[#1E293B] text-[16px] font-bold placeholder-[#B4B8D1] focus:ring-4 focus:ring-white/20 focus:outline-none transition-all"
                  id="forgot-email-input"
                  required
                />
              </div>
            </div>

            {/* Send Recovery Link Pill Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-15 rounded-full bg-[#EEF2FF] text-[#111827] text-[17px] font-extrabold shadow-md hover:bg-[#E2E8F0] active:scale-[0.99] transition-all cursor-pointer focus:outline-none flex items-center justify-center gap-1.5 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              id="send-recovery-submit-btn"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-5 h-5 border-2 border-[#1E293B] border-t-transparent rounded-full animate-spin"></span>
                  Sending...
                </span>
              ) : (
                <>
                  <span>Send Recovery Link</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>


        </>
      )}

    </div>
  );
}
