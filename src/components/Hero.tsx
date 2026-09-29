import React from 'react';
import { Sparkles, ArrowDown, Clock, ShieldCheck, Flame } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-amber-900 via-amber-950 to-[#28180E] text-white py-12 sm:py-20 px-4 sm:px-6">
      {/* Decorative background glow & pattern circles */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Subtle traditional Burmese grid pattern backdrop */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
        {/* Top badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-200 text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-xs">
          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          <span>မွန်နှင့် မြန်မာ့ရိုးရာစစ်စစ် ဟင်းလျာများ</span>
        </div>

        {/* Main Title & Tagline */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-amber-100 font-serif leading-tight">
            Golden Monstate Kitchen
          </h1>
          <p className="text-lg sm:text-2xl text-amber-200/90 font-medium max-w-3xl mx-auto leading-relaxed">
            မွန်နှင့် မြန်မာ့ ရိုးရာအရသာစစ်စစ်ကို မေတ္တာဖြင့် ချက်ပြုတ်ဖန်တီးထားသည်
          </p>
          <p className="text-xs sm:text-sm text-amber-300/75 max-w-xl mx-auto">
            ရနံ့သင်းပျံ့သော မုန့်ဟင်းခါးပူပူမှသည် မွန်ရိုးရာ ငါးသလောက်ပေါင်း၊ လက်ဖက်သုပ်ချဉ်စပ် နှင့် အချိုပွဲစုံလင်စွာ သုံးဆောင်နိုင်ပါသည်
          </p>
        </div>

        {/* Feature highlight badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-2">
          <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-500/20 text-xs sm:text-sm text-amber-200">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>နေ့စဉ် 10:00 AM – 9:00 PM</span>
          </div>
          <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-500/20 text-xs sm:text-sm text-amber-200">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>၁၀၀% လတ်ဆတ်သန့်ရှင်း</span>
          </div>
          <div className="flex items-center gap-2 bg-black/25 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-amber-500/20 text-xs sm:text-sm text-amber-200">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>အမြဲပူပူနွေးနွေး တည်ခင်း</span>
          </div>
        </div>

        {/* Primary CTA Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <a
            href="#menu"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-amber-950 font-bold text-base shadow-lg shadow-amber-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>ဟင်းလျာများ ရွေးချယ်ရန်</span>
            <ArrowDown className="w-4 h-4 text-amber-950 animate-bounce" />
          </a>
          <a
            href="#about"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-full bg-white/10 hover:bg-white/15 text-amber-200 font-semibold text-sm border border-amber-300/20 transition-all"
          >
            ဆိုင်အကြောင်း သိကောင်းစရာ
          </a>
        </div>
      </div>
    </section>
  );
};
