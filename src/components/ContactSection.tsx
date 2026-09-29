import React from 'react';
import { Clock, Phone, MapPin, Truck } from 'lucide-react';

export const ContactSection: React.FC = () => {
  return (
    <section id="contact" className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      <div className="text-center space-y-2 mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
          ဆက်သွယ်ရန် • Contact Information
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-amber-950 font-serif">
          ဆိုင်သို့ လာရောက်အားပေးရန် ဖိတ်ခေါ်ပါသည်
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 max-w-lg mx-auto">
          စားပွဲကြိုတင်မှာယူရန်၊ ပါဆယ်မှာယူရန် သို့မဟုတ် အိမ်အရောက်ပို့ မှာယူရန် ဆက်သွယ်နိုင်ပါသည်
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Hours */}
        <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-xs flex flex-col items-center text-center space-y-2.5 hover:border-amber-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-lg">
            🕒
          </div>
          <h3 className="font-bold text-sm text-amber-950">ဆိုင်ဖွင့်ချိန် (Hours)</h3>
          <div className="space-y-0.5 text-xs text-stone-600">
            <p className="font-bold text-amber-900">နေ့စဉ် 10:00 AM – 9:00 PM</p>
            <p className="text-[11px] text-stone-500">ပိတ်ရက်မရှိ ဖွင့်လှစ်သည်</p>
          </div>
        </div>

        {/* Card 2: Phone */}
        <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-xs flex flex-col items-center text-center space-y-2.5 hover:border-amber-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-lg">
            📞
          </div>
          <h3 className="font-bold text-sm text-amber-950">ဖုန်းဆက်သွယ်ရန် (Phone)</h3>
          <div className="space-y-0.5 text-xs text-stone-600">
            <a href="tel:09789123456" className="font-bold text-amber-900 hover:underline block">
              09-789-123-456
            </a>
            <p className="text-[11px] text-stone-500">ကြိုတင်မှာယူမှု & Delivery</p>
          </div>
        </div>

        {/* Card 3: Location */}
        <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-xs flex flex-col items-center text-center space-y-2.5 hover:border-amber-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-lg">
            📍
          </div>
          <h3 className="font-bold text-sm text-amber-950">ဆိုင်လိပ်စာ (Location)</h3>
          <div className="space-y-0.5 text-xs text-stone-600">
            <p className="font-medium text-amber-900">မင်းလမ်းမကြီး၊ မော်လမြိုင်မြို့</p>
            <p className="text-[11px] text-stone-500">မွန်ပြည်နယ်၊ မြန်မာနိုင်ငံ</p>
          </div>
        </div>

        {/* Card 4: Delivery Area */}
        <div className="bg-white rounded-2xl p-5 border border-amber-900/10 shadow-xs flex flex-col items-center text-center space-y-2.5 hover:border-amber-400 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 text-lg">
            🛵
          </div>
          <h3 className="font-bold text-sm text-amber-950">ပို့ဆောင်မှု (Delivery)</h3>
          <div className="space-y-0.5 text-xs text-stone-600">
            <p className="font-medium text-amber-900">မော်လမြိုင်မြို့တွင်း</p>
            <p className="text-[11px] text-stone-500">နှင့် အနီးတစ်ဝိုက် အိမ်အရောက်ပို့</p>
          </div>
        </div>
      </div>
    </section>
  );
};
