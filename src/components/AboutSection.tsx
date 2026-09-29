import React from 'react';
import { Heart, Sparkles, UtensilsCrossed, ShieldCheck } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-16 bg-amber-50/60 border-y border-amber-900/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Tag */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>ဆိုင်အကြောင်း အနှစ်ချုပ် • About Us</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950 font-serif">
            Golden Monstate Kitchen
          </h2>
        </div>

        {/* Core Summary Card (Icon/Emoji + ၂-၃ စာကြောင်း) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-amber-900/10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Left Emoji Badge */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-4xl sm:text-5xl shadow-md shrink-0">
              🇲🇲
            </div>

            {/* Right: Concise 2-3 Sentence Summary */}
            <div className="space-y-3 text-center md:text-left flex-1">
              <p className="text-base sm:text-lg font-bold text-amber-950 leading-relaxed">
                Golden Monstate Kitchen သည် မွန်ပြည်နယ်နှင့် မြန်မာ့ရိုးရာ အစားအစာစစ်စစ်များကို မူရင်းဒေသလက်ရာ မပျက်စေဘဲ မေတ္တာဖြင့် အထူးချက်ပြုတ်တည်ခင်းပေးနေသော ရိုးရာစားသောက်ဆိုင် ဖြစ်ပါသည်။
              </p>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                လတ်ဆတ်သန့်ရှင်းသော ကုန်ကြမ်းများကိုသာ နေ့စဉ်အသုံးပြုပြီး မိသားစုတိုင်း စိတ်ချလက်ချ သုံးဆောင်နိုင်စေရန် ဓာတုဆိုးဆေး လုံးဝမသုံးဘဲ အရသာပြည့်ဝအောင် ဖန်တီးထားပါသည်။
              </p>
              <p className="text-xs sm:text-sm text-amber-800 font-semibold">
                ဆိုင်တွင်း လာရောက်သုံးဆောင်နိုင်သလို အိမ်အရောက် Delivery နှင့် ပါဆယ်များကိုလည်း နွေးထွေးမြန်ဆန်စွာ ဝန်ဆောင်မှုပေးနေပါသည်။
              </p>
            </div>
          </div>

          {/* 3 Value Highlights */}
          <div className="mt-6 pt-6 border-t border-amber-900/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-amber-50/50 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
              <span className="text-lg">🍜</span>
              <span>ရိုးရာလက်ရာ အစစ်အမှန်</span>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
              <span className="text-lg">🌿</span>
              <span>၁၀၀% လတ်ဆတ်သန့်ရှင်း</span>
            </div>
            <div className="p-3 bg-amber-50/50 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-amber-900">
              <span className="text-lg">🛵</span>
              <span>အိမ်အရောက် အမြန်ပို့</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
