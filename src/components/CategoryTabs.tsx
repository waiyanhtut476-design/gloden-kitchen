import React from 'react';
import { Category } from '../types/menu';
import { CATEGORIES } from '../data/menu';

interface CategoryTabsProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  itemCounts: Record<string, number>;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
  itemCounts,
}) => {
  return (
    <div className="w-full">
      {/* Category scroll container */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.label;
          const count = cat.label === 'အားလုံး' 
            ? Object.values(itemCounts).reduce((a, b) => a + b, 0)
            : (itemCounts[cat.label] || 0);

          return (
            <button
              key={cat.label}
              onClick={() => onSelectCategory(cat.label)}
              type="button"
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all border ${
                isSelected
                  ? 'bg-amber-800 text-amber-50 border-amber-900 shadow-md shadow-amber-900/20 scale-[1.02]'
                  : 'bg-white hover:bg-amber-50 text-amber-950/80 border-amber-900/10 hover:border-amber-400'
              }`}
            >
              <span className="text-base sm:text-lg">{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? 'bg-amber-950 text-amber-200'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
