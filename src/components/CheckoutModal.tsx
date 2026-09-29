import React, { useState } from 'react';
import { X, Truck, Store, Phone, User, MapPin, FileText } from 'lucide-react';
import { CartItem } from '../types/menu';

// LINE Official Account configurations
export const LINE_OA_ID = '@602xywtq';
export const LINE_NAME = 'Golden Kitchen';
export const LINE_CHANNEL_ACCESS_TOKEN =
  'LXEyQOV6IWI4ET6sI0648xP+EgImsgoGQf+069WjOOwq5lMf2UIdGmuZ7hwjx/PC9Qyym5rDrk2RGxafJcxN+lCdEMcBXBimAwUVzse5jkfSnGg03oCj5O6Bh3Jmsk+VnBsVR94uEdHyWhDsS1Q0+AdB04t89/1O/w1cDnyilFU=';
export const LINE_WEBHOOK_URL = 'https://webhook.site/0689ad60-f275-46a9-9b15-c0920dab061c';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderSuccess: (orderSummary: string, lineUrl: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderSuccess,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const validate = () => {
    const newErrors: { name?: string; phone?: string; address?: string } = {};
    if (!name.trim()) newErrors.name = 'ကျေးဇူးပြု၍ အမည် ဖြည့်သွင်းပါ';

    const cleanPhone = phone.replace(/[\s-]/g, '');
    const isDigitsOnly = /^\d+$/.test(cleanPhone);

    if (!cleanPhone) {
      newErrors.phone = 'ကျေးဇူးပြု၍ ဖုန်းနံပါတ် ဖြည့်သွင်းပါ';
    } else if (!isDigitsOnly) {
      newErrors.phone = 'ဖုန်းနံပါတ်ကို ဂဏန်းသီးသန့်သာ ထည့်ပါ';
    } else if (cleanPhone.length < 9) {
      newErrors.phone = 'ဖုန်းနံပါတ်သည် အနည်းဆုံး ၉ လုံး ရှိရပါမည်';
    }

    if (orderType === 'delivery' && !address.trim()) {
      newErrors.address = 'ပို့ဆောင်ရန် လိပ်စာ ဖြည့်သွင်းပေးပါ';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0 || !validate()) return;

    const itemsPart = cartItems
      .map((it) => `${it.name} x${it.quantity} (${(it.price * it.quantity).toLocaleString()} ကျပ်)`)
      .join(', ');

    const destinationPart =
      orderType === 'delivery'
        ? `Delivery to: ${address.trim()}`
        : 'Pickup at shop: ဆိုင်သို့ ကိုယ်တိုင်လာယူမည်';

    const notePart = note.trim() ? ` (မှတ်ချက်: ${note.trim()})` : '';
    const orderSummaryText = `Order: ${itemsPart} — စုစုပေါင်း ${totalAmount.toLocaleString()} ကျပ်။ အမည်: ${name.trim()}, ဖုန်း: ${phone.trim()}, ${destinationPart}${notePart}`;
    const encodedText = encodeURIComponent(orderSummaryText);

    // Dynamic link using LINE_OA_ID constant
    const lineUrl = `https://line.me/R/oaMessage/${LINE_OA_ID}/?${encodedText}`;

    // Background webhook trigger
    try {
      fetch(LINE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurant: LINE_NAME,
          customerName: name.trim(),
          phone: phone.trim(),
          orderType,
          address: address.trim(),
          note: note.trim(),
          items: cartItems,
          totalAmount,
          orderSummary: orderSummaryText,
          createdAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    } catch {}

    try {
      window.open(lineUrl, '_blank', 'noopener,noreferrer');
    } catch {}

    onOrderSuccess(orderSummaryText, lineUrl);
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-lg bg-[#FFFDF9] rounded-3xl shadow-2xl border border-amber-900/10 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-900 to-amber-950 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold font-serif">အော်ဒါမှာယူမှု အတည်ပြုရန်</h3>
            <p className="text-xs text-amber-200/80">အချက်အလက်ဖြည့်သွင်းပြီး Line ဖြင့် တိုက်ရိုက်မှာယူပါ</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-200 transition-colors"
            aria-label="ပိတ်ရန်"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Order Type Toggle */}
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1.5">မှာယူမည့်ပုံစံ ရွေးချယ်ပါ</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  orderType === 'delivery'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-stone-700 border-amber-900/15 hover:bg-amber-50'
                }`}
              >
                <Truck className="w-4 h-4" />
                <span>အိမ်အရောက် (Delivery)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  orderType === 'pickup'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                    : 'bg-white text-stone-700 border-amber-900/15 hover:bg-amber-50'
                }`}
              >
                <Store className="w-4 h-4" />
                <span>ဆိုင်လာယူမည် (Pickup)</span>
              </button>
            </div>
          </div>

          {/* Customer Name */}
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-700" />
              <span>အမည် <span className="text-red-500">*</span></span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="ဥပမာ - မလှလှ / ကိုအောင်"
              className={`w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                errors.name ? 'border-red-500 bg-red-50/20' : 'border-amber-900/15 focus:border-amber-600'
              }`}
            />
            {errors.name && <p className="text-[11px] text-red-600 mt-1">{errors.name}</p>}
          </div>

          {/* Customer Phone */}
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-700" />
              <span>ဖုန်းနံပါတ် <span className="text-red-500">*</span></span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[\d\s+-]*$/.test(val)) {
                  setPhone(val);
                  if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder="ဥပမာ - 09123456789"
              className={`w-full px-3.5 py-2.5 bg-white rounded-xl border text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                errors.phone ? 'border-red-500 bg-red-50/20' : 'border-amber-900/15 focus:border-amber-600'
              }`}
            />
            {errors.phone && <p className="text-[11px] text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Delivery Address */}
          {orderType === 'delivery' && (
            <div>
              <label className="block text-xs font-bold text-amber-950 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>ပို့ဆောင်ပေးရမည့် လိပ်စာ <span className="text-red-500">*</span></span>
              </label>
              <textarea
                rows={2}
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value);
                  if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="အိမ်အမှတ်၊ လမ်း၊ ရပ်ကွက်၊ မြို့နယ် အပြည့်အစုံ..."
                className={`w-full px-3.5 py-2 bg-white rounded-xl border text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-hidden transition-colors ${
                  errors.address ? 'border-red-500 bg-red-50/20' : 'border-amber-900/15 focus:border-amber-600'
                }`}
              />
              {errors.address && <p className="text-[11px] text-red-600 mt-1">{errors.address}</p>}
            </div>
          )}

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-stone-400" />
              <span>အထူးမှာကြားချက် (မဖြစ်မနေ မလိုပါ)</span>
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="ဥပမာ - အစပ်လျှော့ပေးပါ / ပဲကြော်များများထည့်ပါ"
              className="w-full px-3.5 py-2 bg-white rounded-xl border border-amber-900/15 text-xs text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-hidden"
            />
          </div>

          {/* Order Summary Box */}
          <div className="bg-amber-50/80 rounded-2xl p-3.5 border border-amber-200/70 space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-amber-950 border-b border-amber-200/60 pb-1.5">
              <span>မှာယူမည့် ဟင်းလျာစာရင်း</span>
              <span className="text-[11px] text-amber-800">
                {orderType === 'delivery' ? '🚚 အိမ်အရောက်ပို့' : '🏬 ဆိုင်လာယူ'}
              </span>
            </div>

            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.itemId} className="flex justify-between items-center text-xs text-stone-700">
                  <span className="truncate pr-2">
                    {item.emoji} {item.name} <span className="text-stone-500">×{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-amber-950 shrink-0">
                    {(item.price * item.quantity).toLocaleString()} ကျပ်
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-amber-200/60 pt-2 flex justify-between items-center text-sm font-black text-amber-950">
              <span>စုစုပေါင်းငွေ:</span>
              <span className="text-amber-800">{totalAmount.toLocaleString()} ကျပ်</span>
            </div>
          </div>

          {/* Submit Button with Line Color #06C755 */}
          <button
            type="submit"
            disabled={cartItems.length === 0}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
              cartItems.length === 0
                ? 'bg-stone-300 cursor-not-allowed opacity-60'
                : 'bg-[#06C755] hover:bg-[#05B34C] active:scale-[0.99] shadow-[#06C755]/25'
            }`}
          >
            <span className="inline-flex items-center justify-center bg-white text-[#06C755] text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none shadow-2xs">
              LINE
            </span>
            <span>Line ဖြင့် Order ပို့ရန်</span>
          </button>
        </form>
      </div>
    </div>
  );
};
