import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { CartItem } from '../types/menu';

interface CartPanelProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (itemId: string, delta: number) => void;
  onRemoveItem: (itemId: string) => void;
  onClearCart: () => void;
  onCheckout: () => void;
}

export const CartPanel: React.FC<CartPanelProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckout,
}) => {
  // Prevent body scrolling when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop for outside click */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container: Bottom sheet on mobile, slide-in right drawer on desktop */}
      <div className="fixed inset-x-0 bottom-0 md:inset-y-0 md:left-auto md:right-0 max-h-[90vh] md:max-h-full w-full md:max-w-md bg-[#FFFDF9] rounded-t-3xl md:rounded-none md:rounded-l-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom md:slide-in-from-right duration-300 border-t md:border-t-0 md:border-l border-amber-900/10">
        
        {/* Mobile handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mt-3 mb-1 md:hidden" />

        {/* Panel Header */}
        <div className="p-4 sm:p-5 border-b border-amber-900/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-amber-950 font-serif">
                ခြင်းတောင်း
              </h3>
              <p className="text-xs text-stone-500">
                {totalCount > 0 ? `ရွေးချယ်ထားသော ဟင်းလျာ (${totalCount}) ခု` : 'ဗလာဖြစ်နေပါသည်'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={onClearCart}
                className="text-xs text-stone-500 hover:text-red-600 px-2 py-1 rounded-md hover:bg-red-50 transition-colors"
                title="အားလုံးဖျက်မည်"
              >
                ရှင်းမည်
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-stone-100 text-stone-600 transition-colors"
              aria-label="ပိတ်ရန်"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 divide-y divide-amber-950/5">
          {cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center text-3xl mx-auto border border-amber-200">
                🛒
              </div>
              <h4 className="font-bold text-amber-950 text-base">ခြင်းတောင်းထဲတွင် မည်သည့်ဟင်းလျာမှ မရှိသေးပါ</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                မီနူးမှ နှစ်သက်ရာ မြန်မာ့ရိုးရာဟင်းလျာများကို ရွေးချယ်ပြီး ခြင်းထဲထည့်ပါ
              </p>
              <button
                onClick={onClose}
                className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors"
              >
                <span>မီနူးသို့ သွားရန်</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.itemId}
                className="pt-3 first:pt-0 flex items-center justify-between gap-3 group"
              >
                {/* Left: Emoji + Name + Unit Price */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-100 to-orange-50 border border-amber-200/60 flex items-center justify-center text-2xl shrink-0 shadow-xs">
                    {item.emoji || '🍲'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-amber-950 truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs text-stone-500">
                      {item.price.toLocaleString()} ကျပ်
                    </p>
                    <p className="text-xs font-bold text-amber-900 mt-0.5">
                      {(item.price * item.quantity).toLocaleString()} ကျပ်
                    </p>
                  </div>
                </div>

                {/* Right: Quantity Stepper & Delete */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center bg-stone-100 border border-stone-200 rounded-xl p-0.5 shadow-2xs">
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, -1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 hover:text-amber-950 transition-colors"
                      title={item.quantity === 1 ? 'ဖျက်မည်' : 'လျှော့မည်'}
                      aria-label="လျှော့ရန်"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-amber-950">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.itemId, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white text-stone-700 hover:text-amber-950 transition-colors"
                      title="တိုးမည်"
                      aria-label="တိုးရန်"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveItem(item.itemId)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="ဖျက်မည်"
                    aria-label="ဖျက်ရန်"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Panel Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-amber-900/10 space-y-3">
          {/* Subtotal row */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600 font-medium">စုစုပေါင်း</span>
            <span className="text-lg sm:text-xl font-black text-amber-900">
              {totalAmount.toLocaleString()} ကျပ်
            </span>
          </div>

          <div className="text-[11px] text-stone-500 flex items-center justify-between">
            <span>အခွန်နှင့် ဝန်ဆောင်ခ အပါအဝင်</span>
            <span>ဆိုင်ဖွင့်ချိန် 10:00 AM – 9:00 PM</span>
          </div>

          {/* Checkout Button */}
          <button
            onClick={onCheckout}
            disabled={cartItems.length === 0}
            type="button"
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              cartItems.length === 0
                ? 'bg-stone-300 text-stone-500 cursor-not-allowed opacity-60 shadow-none'
                : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white shadow-amber-900/20 active:scale-[0.99] cursor-pointer'
            }`}
          >
            <span>မှာယူရန်</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
