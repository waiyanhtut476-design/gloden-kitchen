import React, { useState } from 'react';
import { MenuItem } from '../types/menu';
import { Plus, Check, Flame, Edit3, Camera } from 'lucide-react';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
  isAdmin?: boolean;
  onEditDish?: (item: MenuItem) => void;
}

export const MenuCard: React.FC<MenuCardProps> = ({
  item,
  onAddToCart,
  isAdmin,
  onEditDish,
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAddToCart(item);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  // Format price with comma
  const formattedPrice = item.price.toLocaleString('en-US');

  return (
    <div className="group bg-white rounded-2xl border border-amber-900/10 shadow-xs hover:shadow-lg hover:border-amber-400/40 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Popular or Specialty badge */}
      {item.badge && (
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 bg-amber-700/90 backdrop-blur-xs text-amber-50 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shadow-xs">
            <Flame className="w-3 h-3 text-amber-300" />
            <span>{item.badge}</span>
          </span>
        </div>
      )}

      {/* Admin Edit Floating Button on top right */}
      {isAdmin && onEditDish && (
        <button
          onClick={() => onEditDish(item)}
          type="button"
          className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-full bg-amber-950/85 hover:bg-amber-900 text-amber-200 border border-amber-500/50 shadow-md text-[11px] font-bold flex items-center gap-1 backdrop-blur-xs transition-transform active:scale-95"
          title="ဈေးနှုန်းနှင့် ပုံ ပြင်ဆင်ရန်"
        >
          <Edit3 className="w-3 h-3 text-amber-400" />
          <span>ပြင်ဆင်မည်</span>
        </button>
      )}

      {/* Food Visual Block (Uploaded Image OR CSS gradient + Emoji placeholder) */}
      <div className="relative w-full aspect-4/3 bg-gradient-to-tr from-amber-100 via-amber-50 to-orange-100 flex items-center justify-center overflow-hidden border-b border-amber-100/60 group-hover:from-amber-200/50 group-hover:to-orange-100/80 transition-colors">
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Dark gradient overlay at bottom for subtle depth */}
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/25 to-transparent pointer-events-none" />
          </>
        ) : (
          <>
            {/* Decorative subtle concentric rings */}
            <div className="absolute w-24 h-24 rounded-full border border-amber-300/30 group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute w-16 h-16 rounded-full bg-amber-200/30 blur-xs" />

            {/* Large Emoji food icon */}
            <span className="text-4xl sm:text-6xl drop-shadow-md select-none transform group-hover:scale-110 transition-transform duration-300">
              {item.emoji}
            </span>
          </>
        )}

        {/* Quick Admin Camera Icon when hovered */}
        {isAdmin && onEditDish && (
          <button
            onClick={() => onEditDish(item)}
            className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity"
            title="ပုံပြောင်းရန်"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Area */}
      <div className="p-3 sm:p-4.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Burmese Title */}
          <h3 className="font-bold text-sm sm:text-base text-amber-950 line-clamp-1 leading-snug group-hover:text-amber-700 transition-colors">
            {item.name}
          </h3>

          {/* English Subtitle (Only show if different from name) */}
          {item.englishName && item.englishName.trim() !== item.name.trim() && (
            <p className="text-[11px] sm:text-xs text-stone-500 line-clamp-1 mb-1 font-sans">
              {item.englishName}
            </p>
          )}

          {/* Description (Only show if provided and not identical to dish name) */}
          {item.description &&
            item.description.trim() !== item.name.trim() &&
            item.description.trim() !== (item.englishName || '').trim() && (
              <p className="text-[11px] sm:text-xs text-stone-600 line-clamp-2 leading-relaxed mb-3">
                {item.description}
              </p>
            )}
        </div>

        {/* Price & Add to Cart row */}
        <div className="pt-2 border-t border-amber-950/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <div className="text-sm sm:text-lg font-extrabold text-amber-900 leading-tight">
              {item.price === 0 ? 'အခမဲ့' : `${formattedPrice} ကျပ်`}
            </div>
            {isAdmin && (
              <span className="text-[10px] text-amber-700 bg-amber-100 px-1 rounded-sm font-semibold">
                Admin
              </span>
            )}
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            type="button"
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-xs font-bold transition-all shadow-xs cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white scale-95'
                : 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white'
            }`}
            title="ခြင်းထဲထည့်ရန်"
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>ထည့်ပြီး</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>ခြင်းထဲထည့်ရန်</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
