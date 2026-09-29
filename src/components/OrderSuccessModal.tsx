import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, ExternalLink, Copy, Check } from 'lucide-react';
import { CartItem } from '../types/menu';
import { LINE_OA_ID } from './CheckoutModal';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  totalAmount: number;
  lineUrl?: string;
  waUrl?: string; // backwards compatibility
  orderSummary?: string;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  items,
  totalAmount,
  lineUrl,
  waUrl,
  orderSummary,
}) => {
  const [copied, setCopied] = useState(false);

  // Auto-copy order text to clipboard on open as requested
  useEffect(() => {
    if (isOpen && orderSummary && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(orderSummary)
        .then(() => setCopied(true))
        .catch(() => {});
    }
  }, [isOpen, orderSummary]);

  if (!isOpen) return null;

  // Build lineUrl with LINE_OA_ID
  const finalLineUrl =
    lineUrl ||
    waUrl ||
    `https://line.me/R/oaMessage/${encodeURIComponent(LINE_OA_ID)}/?${encodeURIComponent(
      orderSummary || ''
    )}`;

  // Detect mobile device via navigator.userAgent
  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleOpenLine = () => {
    // Copy to clipboard
    if (orderSummary && typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(orderSummary)
        .then(() => setCopied(true))
        .catch(() => {});
    }

    // On mobile, use window.location.href; on desktop, use window.open
    if (isMobile) {
      window.location.href = finalLineUrl;
    } else {
      window.open(finalLineUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-amber-900/10 z-10 animate-in zoom-in-95 duration-200 text-center space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
          aria-label="ပိတ်ရန်"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#06C755] flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
            Order ပို့ပြီးပါပြီ
          </h3>
          <p className="text-xs sm:text-sm text-stone-600">
            Line မှတစ်ဆင့် စားသောက်ဆိုင်သို့ အော်ဒါအချက်အလက်များ အောင်မြင်စွာ ပို့ဆောင်ပြီးပါပြီ
          </p>
        </div>

        {/* Line Action Button */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleOpenLine}
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl bg-[#06C755] hover:bg-[#05B34C] text-white font-bold text-xs sm:text-sm shadow-md shadow-[#06C755]/25 transition-all cursor-pointer active:scale-[0.99]"
          >
            <span className="bg-white text-[#06C755] text-[10px] font-black px-1.5 py-0.5 rounded-sm">
              LINE
            </span>
            <span>Line စကားပြောခန်းသို့ သွားရန်</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          {/* Small Note Under Button as requested */}
          <p className="text-[11px] text-stone-500 font-medium">
            📱 ဖုန်းနဲ့ဖွင့်ထားရင် LINE app ချက်ချင်း ပွင့်ပါလိမ့်မည်
          </p>

          {/* Auto-copy notice */}
          {copied && (
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1 animate-in fade-in">
              <Check className="w-3.5 h-3.5" />
              <span>Order စာသားကို Clipboard ထဲသို့ Copy ကူးပြီးပါပြီ</span>
            </p>
          )}
        </div>

        {/* Order Details List */}
        <div className="bg-amber-50/70 rounded-2xl p-3.5 text-left max-h-40 overflow-y-auto space-y-1.5 border border-amber-200/60 text-xs">
          <p className="font-bold text-amber-950 border-b border-amber-200/60 pb-1">
            မှာယူထားသော စာရင်း:
          </p>
          {items.map((it) => (
            <div key={it.itemId} className="flex justify-between items-center text-stone-700 py-0.5">
              <span className="font-medium truncate pr-2">
                {it.emoji} {it.name} <span className="text-stone-500 font-normal">×{it.quantity}</span>
              </span>
              <span className="font-bold text-amber-900 shrink-0">
                {(it.price * it.quantity).toLocaleString()} ကျပ်
              </span>
            </div>
          ))}
          <div className="border-t border-amber-200/60 pt-2 flex justify-between font-extrabold text-amber-950 text-sm">
            <span>စုစုပေါင်းငွေ:</span>
            <span className="text-amber-800">{totalAmount.toLocaleString()} ကျပ်</span>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition-colors cursor-pointer"
        >
          ပိတ်မည်
        </button>
      </div>
    </div>
  );
};
