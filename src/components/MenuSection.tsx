import React, { useState, useMemo } from 'react';
import { Category, MenuItem } from '../types/menu';
import { CategoryTabs } from './CategoryTabs';
import { MenuCard } from './MenuCard';
import { Search, Sparkles, PlusCircle, Edit3 } from 'lucide-react';

interface MenuSectionProps {
  items: MenuItem[];
  isLoading?: boolean;
  onAddToCart: (item: MenuItem) => void;
  isAdmin?: boolean;
  onEditDish?: (item: MenuItem) => void;
  onAddNewDish?: () => void;
  onEditAllMenu?: () => void;
  onSeedDishes?: () => void;
}

export const MenuSection: React.FC<MenuSectionProps> = ({
  items,
  isLoading = false,
  onAddToCart,
  isAdmin,
  onEditDish,
  onAddNewDish,
  onEditAllMenu,
  onSeedDishes,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('အားလုံး');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate item counts per category from current items
  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Filter items based on category and search query
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory =
        selectedCategory === 'အားလုံး' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.englishName.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchQuery]);

  return (
    <section id="menu" className="py-12 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="text-center space-y-3 mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
          <span>ရိုးရာဟင်းလျာများ မာတိကာ</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-amber-950 font-serif">
          တို့ဆိုင်၏ အရသာစုံ မီနူး
        </h2>
        <p className="text-stone-600 text-xs sm:text-base max-w-xl mx-auto">
          လတ်ဆတ်သန့်ရှင်းသော ကုန်ကြမ်းများဖြင့် နေ့စဉ်ချက်ပြုတ် တည်ခင်းထားသော မြန်မာ့ရိုးရာနှင့် မွန်ရိုးရာဟင်းလျာများ
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Category Tabs */}
          <div className="flex-1 overflow-hidden">
            <CategoryTabs
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              itemCounts={itemCounts}
            />
          </div>

          {/* Quick Search & Admin Add Button */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ဟင်းလျာ ရှာရန်..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-white rounded-full border border-amber-900/15 focus:border-amber-600 focus:outline-hidden text-amber-950 placeholder-stone-400 shadow-xs"
              />
            </div>

            {isAdmin && (
              <div className="flex items-center gap-1.5 shrink-0">
                {onEditAllMenu && (
                  <button
                    onClick={onEditAllMenu}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-900/90 hover:bg-amber-950 text-amber-200 border border-amber-600/40 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="မီနူးများ အားလုံး ပြင်ဆင်ရန် (Batch Editor)"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    <span>မီနူးအားလုံး ပြင်မည်</span>
                  </button>
                )}
                {onAddNewDish && (
                  <button
                    onClick={onAddNewDish}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-amber-50 text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    title="ဟင်းလျာအသစ်ထည့်မည်"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                    <span className="hidden sm:inline">ဟင်းလျာအသစ်</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Currency notice banner */}
        <div className="flex items-center justify-between text-[11px] sm:text-xs text-amber-900/80 bg-amber-50/90 px-3.5 py-2 rounded-xl border border-amber-200/60 shadow-2xs">
          <span className="flex items-center gap-1.5">
            <span>🏷️</span>
            <span className="font-semibold">ဈေးနှုန်းများကို "ကျပ်" ဖြင့် ဖော်ပြထားပါသည်</span>
            {isAdmin && (
              <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                Admin ဈေးနှုန်း/ပုံ ပြင်ဆင်နိုင်သည်
              </span>
            )}
          </span>
          <span className="hidden sm:inline text-stone-500">
            နေ့စဉ် 10:00 AM မှ 9:00 PM အထိ အော်ဒါမှာယူနိုင်ပါသည်
          </span>
        </div>
      </div>

      {/* Menu Grid: 2 columns on mobile, 3 columns on desktop */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-amber-900/10 p-4 space-y-3 animate-pulse"
            >
              <div className="aspect-4/3 bg-amber-100/60 rounded-xl" />
              <div className="h-4 bg-amber-100/80 rounded-md w-3/4" />
              <div className="h-3 bg-stone-100 rounded-md w-1/2" />
              <div className="h-5 bg-amber-200/50 rounded-md w-1/3 pt-2" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredItems.map((item) => (
            <MenuCard
              key={item.id}
              item={item}
              onAddToCart={onAddToCart}
              isAdmin={isAdmin}
              onEditDish={onEditDish}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-amber-300 p-8 space-y-3">
          <span className="text-4xl mb-2 block">🍽️</span>
          <p className="text-base font-bold text-amber-950">
            {searchQuery ? `"${searchQuery}" နှင့် ကိုက်ညီသော ဟင်းလျာ မရှိပါ` : 'ဟင်းလျာ မရှိသေးပါ'}
          </p>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery
              ? 'အခြားအမည်ဖြင့် ရှာဖွေကြည့်ပါ'
              : 'Admin Panel မှ ဟင်းလျာအသစ် ထည့်သွင်းနိုင်ပါသည်'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('အားလုံး');
                }}
                type="button"
                className="px-4 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
              >
                မီနူးအားလုံး ပြန်ကြည့်ရန်
              </button>
            )}
            {isAdmin && onSeedDishes && items.length === 0 && !searchQuery && (
              <button
                onClick={onSeedDishes}
                type="button"
                className="px-4 py-2 rounded-full bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4 text-amber-300" />
                <span>နမူနာ မီနူးများ အလိုအလျောက် ထည့်သွင်းမည်</span>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
