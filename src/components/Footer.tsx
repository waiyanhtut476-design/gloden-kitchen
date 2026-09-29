import React from 'react';
import { UtensilsCrossed, Phone, Clock, MapPin, MessageSquare, Send } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin?: () => void;
  isAdmin?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin, isAdmin }) => {
  return (
    <footer className="bg-[#24160D] text-amber-100/80 border-t border-amber-900/30 pt-12 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* 3-Column Layout: ဆိုင်အကြောင်း / ဆက်သွယ်ရန် / ဖွင့်ချိန် */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 pb-8 border-b border-amber-900/40">
          
          {/* Column 1: ဆိုင်အကြောင်း (About) */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md">
                <UtensilsCrossed className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <h4 className="font-extrabold text-amber-100 text-lg font-serif">
                  Golden Monstate Kitchen
                </h4>
                <p className="text-xs text-amber-400/80 font-medium">
                  မြန်မာ့ရိုးရာအစားအစာ
                </p>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-amber-200/70 leading-relaxed">
              မွန်ပြည်နယ်နှင့် မြန်မာ့ရိုးရာ ဟင်းလျာစစ်စစ်များကို နေ့စဉ် လတ်လတ်ဆတ်ဆတ် ချက်ပြုတ်တည်ခင်းပေးနေပါသည်။ မိသားစုဆန်သော ဧည့်ဝတ်ကျေပွန်မှုဖြင့် အမြဲကြိုဆိုလျက်ပါ။
            </p>
          </div>

          {/* Column 2: ဆက်သွယ်ရန် (Contact) */}
          <div className="space-y-4">
            <h4 className="font-bold text-amber-100 text-base font-serif border-b border-amber-800/40 pb-2">
              ဆက်သွယ်ရန်
            </h4>
            <div className="space-y-2.5 text-xs sm:text-sm text-amber-200/80">
              <p className="flex items-center gap-2.5">
                <span className="text-amber-400 text-base">📞</span>
                <a href="tel:0647568863" className="hover:text-amber-300 transition-colors font-medium">
                  064-756-8863
                </a>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="text-amber-400 text-base">📍</span>
                <span>မင်းလမ်းမကြီး၊ မော်လမြိုင်မြို့၊ မွန်ပြည်နယ်</span>
              </p>
              <p className="flex items-center gap-2.5">
                <span className="text-amber-400 text-base">🛵</span>
                <span>မြို့တွင်း နှင့် အနီးတစ်ဝိုက် Delivery</span>
              </p>
            </div>
          </div>

          {/* Column 3: ဖွင့်ချိန် (Opening Hours) */}
          <div className="space-y-4">
            <h4 className="font-bold text-amber-100 text-base font-serif border-b border-amber-800/40 pb-2">
              ဆိုင်ဖွင့်ချိန်
            </h4>
            <div className="space-y-2 text-xs sm:text-sm text-amber-200/80">
              <p className="flex items-center gap-2.5">
                <span className="text-amber-400 text-base">🕒</span>
                <span className="font-bold text-amber-200">နေ့စဉ် 10:00 AM – 9:00 PM</span>
              </p>
              <p className="text-xs text-amber-400/80 pl-6">
                ပိတ်ရက်မရှိ နေ့စဉ်ဖွင့်လှစ်ပါသည်
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-600/40 text-emerald-400 text-[11px] font-semibold">
                  ● ယခုဆိုင်ဖွင့်နေပါသည်
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Contact Summary Bar (Example format: 📞 ... | 🕒 ... | 📍 ...) */}
        <div className="bg-amber-950/60 rounded-2xl p-3 sm:p-4 border border-amber-800/30 text-center text-xs sm:text-sm text-amber-200/90 font-medium">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
            <span>📞 064-756-8863</span>
            <span className="text-amber-600 hidden sm:inline">|</span>
            <span>🕒 10:00 AM – 9:00 PM</span>
            <span className="text-amber-600 hidden sm:inline">|</span>
            <span>📍 Delivery အိမ်အရောက်ပို့</span>
          </div>
        </div>

        {/* Social Icon Row + Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          {/* Social Media Links */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-amber-300/70 font-semibold mr-1">Social Media:</span>
            
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-[#60A5FA] border border-[#1877F2]/30 text-xs font-semibold transition-colors"
              title="Facebook Page"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            {/* Viber */}
            <a
              href="viber://chat?number=%2B66647568863"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#7360F2]/20 hover:bg-[#7360F2]/40 text-[#A78BFA] border border-[#7360F2]/30 text-xs font-semibold transition-colors"
              title="Viber Chat"
            >
              <MessageSquare className="w-4 h-4 text-[#A78BFA]" />
              <span>Viber</span>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/66647568863"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#25D366]/20 hover:bg-[#25D366]/40 text-[#4ADE80] border border-[#25D366]/30 text-xs font-semibold transition-colors"
              title="WhatsApp"
            >
              <Send className="w-4 h-4 text-[#4ADE80]" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* Copyright & Tiny Admin link */}
          <div className="text-xs text-amber-300/50 text-center sm:text-right flex flex-col sm:items-end">
            <p>© {new Date().getFullYear()} Golden Monstate Kitchen. မူပိုင်ခွင့်များ ရယူပြီး။</p>
            {onOpenAdminLogin && (
              <button
                type="button"
                onClick={onOpenAdminLogin}
                className="text-[11px] text-amber-500/40 hover:text-amber-300 underline transition-colors cursor-pointer mt-1"
                title="Admin စီမံခန့်ခွဲသူ"
              >
                {isAdmin ? '⚙️ Admin Panel' : 'Admin'}
              </button>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
