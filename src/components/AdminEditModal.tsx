import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Link as LinkIcon,
  Check,
  Trash2,
  Globe,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import { MenuItem, Category } from '../types/menu';
import { CATEGORIES } from '../data/menu';

interface AdminEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: MenuItem | null;
  allDishes?: MenuItem[];
  onSelectDish?: (dish: MenuItem) => void;
  onSaveDish: (updatedDish: MenuItem) => void | Promise<void>;
  onDeleteDish?: (dishId: string) => void | Promise<void>;
}

export const AdminEditModal: React.FC<AdminEditModalProps> = ({
  isOpen,
  onClose,
  dish,
  allDishes = [],
  onSelectDish,
  onSaveDish,
  onDeleteDish,
}) => {
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<Category>('မုန့်ဟင်းခါး');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('🍜');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [badge, setBadge] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [imageLoadError, setImageLoadError] = useState(false);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper to sanitize duplicated protocol URLs (e.g. https://www.fhttps://...)
  const sanitizeImageUrl = (val: string) => {
    let clean = val.trim();
    // If duplicated https:// exists in string
    const secondHttps = clean.indexOf('https://', 7);
    if (secondHttps !== -1) {
      clean = clean.substring(secondHttps);
    }
    const secondHttp = clean.indexOf('http://', 7);
    if (secondHttp !== -1) {
      clean = clean.substring(secondHttp);
    }
    return clean;
  };

  const isSocialPageLink = (url: string) => {
    if (!url) return false;
    return (
      /facebook\.com|fb\.watch|instagram\.com|pinterest\.com\/pin|twitter\.com|x\.com/i.test(url) &&
      !/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url)
    );
  };

  // Sync state whenever active dish changes
  useEffect(() => {
    if (dish) {
      setName(dish.name || '');
      setEnglishName(dish.englishName || '');
      setPrice(typeof dish.price === 'number' ? dish.price : '');
      setCategory(dish.category || 'မုန့်ဟင်းခါး');
      setDescription(dish.description || '');
      setEmoji(dish.emoji || '🍜');
      setImageUrl(dish.imageUrl || '');
      setBadge(dish.badge || '');
      setIsPopular(Boolean(dish.isPopular));
      setError('');
      setImageLoadError(false);
      setSaveSuccess(false);
      setImageInputMode(dish.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    }
  }, [dish]);

  if (!isOpen || !dish) return null;

  // Calculate currentIndex and next/prev dishes
  const currentIndex = allDishes.findIndex((d) => d.id === dish.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < allDishes.length - 1;

  const handlePrev = () => {
    if (hasPrev && onSelectDish) {
      onSelectDish(allDishes[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onSelectDish) {
      onSelectDish(allDishes[currentIndex + 1]);
    }
  };

  // Handle local image file upload (converts to base64 Data URL)
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError('ဓာတ်ပုံဖိုင်ဆိုဒ် 2MB ထက် မကျော်ရပါ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (andNext: boolean = false) => {
    if (!name.trim()) {
      setError('ဟင်းလျာ အမည် ထည့်သွင်းပေးပါ');
      return;
    }
    if (price === '' || isNaN(Number(price)) || Number(price) <= 0) {
      setError('မှန်ကန်သော ဈေးနှုန်း ထည့်သွင်းပေးပါ');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const updated: MenuItem = {
        ...dish,
        name: name.trim(),
        englishName: englishName.trim() || name.trim(),
        price: Number(price),
        category,
        description: description.trim(),
        emoji: emoji.trim() || '🍲',
        imageUrl: imageUrl.trim() || undefined,
        badge: badge.trim() || undefined,
        isPopular,
      };

      await onSaveDish(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);

      if (andNext && hasNext && onSelectDish) {
        onSelectDish(allDishes[currentIndex + 1]);
      } else if (!andNext) {
        onClose();
      }
    } catch (err) {
      setError('ပြင်ဆင်မှု သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-xl bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-amber-900/10 z-10 animate-in zoom-in-95 duration-200 space-y-4 max-h-[92vh] flex flex-col my-auto">
        {/* Header with Navigation for All Dishes */}
        <div className="border-b border-amber-900/10 pb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-100 text-amber-900 text-base sm:text-lg">
                ✏️
              </span>
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-amber-950 font-serif">
                  ဟင်းလျာ မီနူး ပြင်ဆင်ရန် (Edit Menu)
                </h3>
                <p className="text-xs text-stone-500">
                  {allDishes.length > 0 && currentIndex >= 0
                    ? `ဟင်းလျာ (${currentIndex + 1} / ${allDishes.length}) • ${dish.name}`
                    : `${dish.name} • Golden Monstate Kitchen`}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Navigator for All Dishes */}
          {allDishes.length > 1 && onSelectDish && (
            <div className="flex items-center justify-between gap-2 pt-1 bg-amber-50/70 p-2 rounded-xl border border-amber-200/50">
              <button
                type="button"
                onClick={handlePrev}
                disabled={!hasPrev}
                className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ရှေ့တစ်ခု</span>
              </button>

              <div className="flex-1 min-w-0">
                <select
                  value={dish.id}
                  onChange={(e) => {
                    const target = allDishes.find((d) => d.id === e.target.value);
                    if (target) onSelectDish(target);
                  }}
                  className="w-full text-xs font-semibold bg-white border border-amber-300 rounded-lg py-1 px-2 text-amber-950 focus:outline-hidden"
                >
                  {allDishes.map((d, idx) => (
                    <option key={d.id} value={d.id}>
                      {idx + 1}. {d.emoji} {d.name} ({d.price.toLocaleString()} Ks)
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleNext}
                disabled={!hasNext}
                className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-white rounded-lg border border-amber-200 hover:bg-amber-100 disabled:opacity-40 disabled:hover:bg-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span className="hidden sm:inline">နောက်တစ်ခု</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
            {error}
          </div>
        )}

        {/* Save success banner */}
        {saveSuccess && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>သိမ်းဆည်းပြီးပါပြီ!</span>
          </div>
        )}

        {/* Form Fields */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave(false);
          }}
          className="space-y-4 overflow-y-auto flex-1 pr-1"
        >
          {/* Dish Image Section */}
          <div className="space-y-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                <span>ဟင်းလျာ ဓာတ်ပုံ (Food Image)</span>
              </label>

              {/* Mode switch: URL Link vs File Upload */}
              <div className="flex bg-stone-200/70 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setImageInputMode('url')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    imageInputMode === 'url'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <LinkIcon className="w-3 h-3" />
                  <span>URL Link</span>
                </button>
                <button
                  type="button"
                  onClick={() => setImageInputMode('upload')}
                  className={`px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer ${
                    imageInputMode === 'upload'
                      ? 'bg-white text-amber-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  <span>Upload ဖိုင်</span>
                </button>
              </div>
            </div>

            {/* Input according to mode */}
            {imageInputMode === 'url' ? (
              <div className="space-y-2">
                <div className="relative">
                  <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => {
                      const cleaned = sanitizeImageUrl(e.target.value);
                      setImageUrl(cleaned);
                      setImageLoadError(false);
                      setError('');
                    }}
                    placeholder="https://example.com/food-photo.jpg (Direct Image Link)"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:border-amber-600 focus:outline-hidden text-stone-800"
                  />
                </div>

                {/* Social media / Webpage Link Warning Guide */}
                {isSocialPageLink(imageUrl) && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 space-y-1.5 animate-in fade-in">
                    <div className="font-bold flex items-center gap-1.5 text-[11px] text-amber-950">
                      <span>⚠️</span>
                      <span>Facebook Post / Webpage Link ဖြစ်နေပါသည်</span>
                    </div>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Facebook post link များသည် direct ဓာတ်ပုံဖိုင်မဟုတ်သဖြင့် ပုံပေါ်မည်မဟုတ်ပါ။
                      အလွယ်ကူဆုံးအနေဖြင့် <strong>"Upload ဖိုင်"</strong> ဖြင့် ဖုန်းထဲမှ ဓာတ်ပုံကို တိုက်ရိုက်ရွေးချယ်တင်ပေးပါ (သို့မဟုတ် .jpg/.png တိုက်ရိုက် link ထည့်ပါ)။
                    </p>
                    <button
                      type="button"
                      onClick={() => setImageInputMode('upload')}
                      className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload ဖိုင်ဖြင့် ဓာတ်ပုံရွေးချယ်မည်</span>
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-stone-500">
                  💡 အကြံပြုချက်: Imgur / PostImages သို့မဟုတ် .jpg/.png တိုက်ရိုက် link ထည့်ပါ (သို့မဟုတ် ဘေးရှိ Upload ဖိုင် သုံးပါ)
                </p>
              </div>
            ) : (
              <div className="space-y-1.5">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                />
                <p className="text-[10px] text-stone-500">
                  ဖုန်း (သို့) ကွန်ပျူတာထဲမှ ဟင်းလျာဓာတ်ပုံ ရွေးချယ်ပါ (အများဆုံး 2MB)
                </p>
              </div>
            )}

            {/* Live Image Preview Thumbnail */}
            {imageUrl && (
              <div className="flex items-center gap-3 pt-1 border-t border-stone-200/60">
                <div className="w-14 h-14 rounded-xl border border-amber-300 overflow-hidden bg-amber-50 shrink-0 shadow-2xs flex items-center justify-center">
                  {!imageLoadError ? (
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div className="text-[10px] text-red-600 text-center font-bold p-1">
                      ပုံ load မရပါ
                    </div>
                  )}
                </div>

                <div className="text-xs space-y-1 flex-1 min-w-0">
                  {!imageLoadError ? (
                    <p className="font-semibold text-emerald-700 flex items-center gap-1 text-[11px]">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> ဓာတ်ပုံ ထည့်သွင်းထားပါသည်
                    </p>
                  ) : (
                    <p className="font-semibold text-red-600 flex items-center gap-1 text-[11px]">
                      ⚠️ ဓာတ်ပုံ Link မှ ပုံကို load မလုပ်နိုင်ပါ
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    {imageLoadError && (
                      <button
                        type="button"
                        onClick={() => setImageInputMode('upload')}
                        className="text-[11px] font-bold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Upload className="w-3 h-3" />
                        <span>Upload ဖိုင်ဖြင့် တင်မည်</span>
                      </button>
                    )}
                    {imageLoadError && <span className="text-stone-300">•</span>}
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl('');
                        setImageLoadError(false);
                      }}
                      className="text-[11px] text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ဓာတ်ပုံဖယ်ရှားမည်</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* အမည် (Burmese) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                ဟင်းလျာအမည် (Burmese) *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ဥပမာ - မုန့်ဟင်းခါး"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* ဈေးနှုန်း */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                ဈေးနှုန်း (Price in ကျပ်) *
              </label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="2500"
                min="0"
                step="50"
                required
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden font-bold text-amber-950"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* အမျိုးအစား (Category) */}
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                အမျိုးအစား (Category)
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              >
                {CATEGORIES.filter((c) => c.label !== 'အားလုံး').map((c) => (
                  <option key={c.label} value={c.label}>
                    {c.emoji} {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Emoji */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Emoji
              </label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full px-3 py-2 text-center text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English / Alternative Name */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                English / အခြားအမည်
              </label>
              <input
                type="text"
                value={englishName}
                onChange={(e) => setEnglishName(e.target.value)}
                placeholder="Mohinga"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Badge (e.g. Signature, စပါယ်ရှယ်) */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-stone-700">
                Badge အညွှန်း (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="ဥပမာ - မွန်ရိုးရာစစ်စစ် (သို့) စပါယ်ရှယ်"
                className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          {/* Popular toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="edit-isPopular"
              checked={isPopular}
              onChange={(e) => setIsPopular(e.target.checked)}
              className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
            />
            <label htmlFor="edit-isPopular" className="text-xs font-bold text-stone-800 cursor-pointer">
              🔥 လူကြိုက်များသော ဟင်းလျာ (Popular / Best Seller အဖြစ် သတ်မှတ်မည်)
            </label>
          </div>

          {/* ဖော်ပြချက် (Description) */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-stone-700">
              ပါဝင်ပစ္စည်း / အရသာ ရှင်းလင်းချက်
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ပါဝင်ပစ္စည်းများနှင့် အရသာအကျဉ်း..."
              className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:outline-hidden"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-amber-900/10">
            {onDeleteDish && !dish.id.startsWith('new-') ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ဖျက်မည်</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                ပိတ်မည်
              </button>

              {hasNext && onSelectDish && (
                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                  className="px-3.5 sm:px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="ယခုဟင်းလျာကို သိမ်းပြီး နောက်တစ်ခုသို့ ဆက်သွားမည်"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-amber-300" />
                  <span>သိမ်းပြီး နောက်တစ်ခု</span>
                </button>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-4 sm:px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-900/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isSaving ? 'သိမ်းနေသည်...' : 'သိမ်းဆည်းမည်'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* In-App Delete Confirmation Modal (Avoids blocked window.confirm in iframe) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-80 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-200 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl">
              🗑️
            </div>
            <div>
              <h4 className="font-extrabold text-base text-stone-900">
                ဟင်းလျာ ဖျက်ရန် သေချာပါသလား?
              </h4>
              <p className="text-xs text-stone-600 mt-1">
                "<span className="font-bold text-red-700">{dish.name}</span>" ကို မီနူးနှင့် Firestore မှ အပြီးတိုင် ဖျက်ပစ်ပါမည်။
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs transition-colors cursor-pointer"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (!onDeleteDish) return;
                  setIsDeleting(true);
                  try {
                    await onDeleteDish(dish.id);
                    setShowDeleteConfirm(false);
                    onClose();
                  } catch (err) {
                    setError('ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
                    setShowDeleteConfirm(false);
                  } finally {
                    setIsDeleting(false);
                  }
                }}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? 'ဖျက်နေသည်...' : 'အပြီးဖျက်မည်'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
