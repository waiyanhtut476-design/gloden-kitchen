import React from 'react';
import { ShoppingBag, CheckCircle, Info } from 'lucide-react';
import { MenuItem } from '../types/menu';

interface CartNoticeProps {
  lastAddedItem: MenuItem | null;
  totalCount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const CartNotice: React.FC<CartNoticeProps> = ({
  lastAddedItem,
  totalCount,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100vw-40px)] bg-white rounded-2xl shadow-2xl border border-amber-900/15 p-4 animate-in slide-in-from-bottom-5 duration-300">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
          <CheckCircle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-amber-950">ခြင်းထဲသို့ ထည့်ပြီးပါပြီ</h4>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 text-xs font-bold p-1"
            >
              ✕
            </button>
          </div>
          {lastAddedItem && (
            <p className="text-xs text-amber-900 font-semibold mt-1">
              {lastAddedItem.emoji} {lastAddedItem.name} ({lastAddedItem.price.toLocaleString()} ကျပ်)
            </p>
          )}
          <div className="mt-2 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1 font-medium text-amber-800">
              <ShoppingBag className="w-3.5 h-3.5" />
              စုစုပေါင်း: {totalCount} ခု
            </span>
            <span className="text-amber-700">အပိုင်း (၂) တွင် Checkout ရပါမည်</span>
          </div>
        </div>
      </div>
    </div>
  );
};
