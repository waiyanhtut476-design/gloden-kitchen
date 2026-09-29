import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, hasFirebaseConfig } from '../lib/firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasFirebaseConfig) {
      setErrorMessage('Firebase configuration မရှိသေးပါ');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMessage('Email နှင့် Password ကို ဖြည့်သွင်းပေးပါ');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      setEmail('');
      setPassword('');
      onLoginSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { code?: string; message?: string };
      if (
        errorObj?.code === 'auth/invalid-credential' ||
        errorObj?.code === 'auth/wrong-password' ||
        errorObj?.code === 'auth/user-not-found'
      ) {
        setErrorMessage('Email (သို့) Password မှားနေပါသည်');
      } else if (errorObj?.code === 'auth/too-many-requests') {
        setErrorMessage('အကြိမ်များစွာ ကြိုးစားထားသဖြင့် ခေတ္တစောင့်ဆိုင်းပေးပါ');
      } else if (errorObj?.code === 'auth/invalid-email') {
        setErrorMessage('မှန်ကန်သော Email လိပ်စာ ဖြစ်ရပါမည်');
      } else if (errorObj?.code === 'auth/operation-not-allowed') {
        setErrorMessage('Email/Password provider ဖွင့်မထားပါ');
      } else {
        setErrorMessage(errorObj?.message || 'အကောင့်ဝင်ရောက်မှု မအောင်မြင်ပါ');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      onLoginSuccess?.();
      onClose();
    } catch (err: unknown) {
      const errObj = err as { code?: string; message?: string };
      if (errObj?.code !== 'auth/popup-closed-by-user') {
        setErrorMessage(errObj?.message || 'Google ဖြင့် ဝင်ရောက်မှု မအောင်မြင်ပါ');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-amber-900/10 z-10 animate-in zoom-in-95 duration-200 space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
          aria-label="ပိတ်ရန်"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-7 h-7" />
        </div>

        <div className="text-center space-y-1">
          <h3 className="text-lg font-black text-amber-950 font-serif">
            Admin စီမံခန့်ခွဲသူ ဝင်ရောက်ရန်
          </h3>
          <p className="text-xs text-stone-500">
            စီမံခန့်ခွဲသူ အကောင့်ဖြင့် ဝင်ရောက်ပါ
          </p>
        </div>

        {/* Real Error Message (only when caught from Firebase try-catch) */}
        {errorMessage && (
          <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-200 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-950">
              Email လိပ်စာ
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              autoFocus
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:outline-hidden text-amber-950 placeholder-stone-400"
            />
          </div>

          {/* Password input with eye toggle */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-amber-950">
              စကားဝှက် (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password ထည့်ပါ"
                required
                className="w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:outline-hidden text-amber-950 placeholder-stone-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                aria-label={showPassword ? 'ဝှက်ရန်' : 'ပြရန်'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !hasFirebaseConfig}
            className="w-full mt-2 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>စစ်ဆေးနေပါသည်...</span>
              </>
            ) : (
              <span>အကောင့်ဝင်မည် (Login)</span>
            )}
          </button>
        </form>

        {/* Alternative: Google Login */}
        <div className="pt-1">
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-white px-2 text-stone-400 font-semibold">သို့မဟုတ်</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || !hasFirebaseConfig}
            className="w-full py-2.5 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-bold text-xs shadow-2xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Google အကောင့်ဖြင့် ဝင်မည်</span>
          </button>
        </div>
      </div>
    </div>
  );
};
