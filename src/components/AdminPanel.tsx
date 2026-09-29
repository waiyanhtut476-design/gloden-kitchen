import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Upload,
  Link as LinkIcon,
  Globe,
  Database,
  Check,
  RotateCcw,
  Search,
  ExternalLink,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Flame,
  Layers,
  Sparkles,
  BarChart3,
  ShoppingBag
} from 'lucide-react';
import { MenuItem, Category } from '../types/menu';
import { CATEGORIES } from '../data/menu';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { AdminOrdersTab } from './AdminOrdersTab';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  initialTab?: 'all' | 'single' | 'orders';
  onAddDish: (dish: Omit<MenuItem, 'id'>) => Promise<void>;
  onEditDish: (dish: MenuItem) => void;
  onSaveDish?: (dish: MenuItem) => Promise<void>;
  onSaveAllDishes?: (dishes: MenuItem[]) => Promise<void>;
  onDeleteDish: (dishId: string) => Promise<void>;
  onSeedDishes: () => Promise<void>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  items,
  initialTab = 'all',
  onAddDish,
  onEditDish,
  onSaveDish,
  onSaveAllDishes,
  onDeleteDish,
  onSeedDishes,
}) => {
  // Main view tab: 'all' = Edit All Menus, 'orders' = Past Orders & Sales Trends, 'single' = Add Single Dish
  const [activeTab, setActiveTab] = useState<'all' | 'single' | 'orders'>(initialTab);

  // Sync tab if initialTab changes when opening
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // ==========================================
  // SINGLE DISH FORM STATE (Add or Single Edit)
  // ==========================================
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [name, setName] = useState('');
  const [englishName, setEnglishName] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [category, setCategory] = useState<Category>('မုန့်ဟင်းခါး');
  const [emoji, setEmoji] = useState('🍜');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<'url' | 'upload'>('url');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

  // ==========================================
  // BATCH / ALL MENU EDIT STATE
  // ==========================================
  // Map of dishId -> local draft changes
  const [allDrafts, setAllDrafts] = useState<Record<string, MenuItem>>({});
  const [dirtyIds, setDirtyIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterCategory, setSelectedFilterCategory] = useState<Category | 'အားလုံး'>('အားလုံး');
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const [batchSuccessMessage, setBatchSuccessMessage] = useState('');
  const [rowSavingId, setRowSavingId] = useState<string | null>(null);
  const [rowSavedSuccessId, setRowSavedSuccessId] = useState<string | null>(null);
  const [dishToDelete, setDishToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastError, setToastError] = useState('');

  const showToastErr = (msg: string) => {
    setToastError(msg);
    setTimeout(() => setToastError(''), 3000);
  };

  // Initialize or sync allDrafts when items change
  useEffect(() => {
    const draftMap: Record<string, MenuItem> = {};
    items.forEach((it) => {
      draftMap[it.id] = { ...it };
    });
    setAllDrafts(draftMap);
    setDirtyIds(new Set());
  }, [items]);

  if (!isOpen) return null;

  const sanitizeImageUrl = (val: string) => {
    let clean = val.trim();
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

  // ------------------------------------------
  // All-Menu Batch Handlers
  // ------------------------------------------
  const handleUpdateDraftField = <K extends keyof MenuItem>(
    dishId: string,
    field: K,
    val: MenuItem[K]
  ) => {
    const finalVal = field === 'imageUrl' && typeof val === 'string' ? sanitizeImageUrl(val) : val;
    setAllDrafts((prev) => {
      const current = prev[dishId] || items.find((i) => i.id === dishId);
      if (!current) return prev;
      return {
        ...prev,
        [dishId]: {
          ...current,
          [field]: finalVal as MenuItem[K],
        },
      };
    });
    setDirtyIds((prev) => new Set(prev).add(dishId));
  };

  const handleResetDrafts = () => {
    const draftMap: Record<string, MenuItem> = {};
    items.forEach((it) => {
      draftMap[it.id] = { ...it };
    });
    setAllDrafts(draftMap);
    setDirtyIds(new Set());
    setBatchSuccessMessage('');
  };

  // Save a single row directly from the table
  const handleSaveSingleRow = async (dishId: string) => {
    const draft = allDrafts[dishId];
    if (!draft || !onSaveDish) return;

    if (!draft.name.trim()) {
      showToastErr('ဟင်းလျာ အမည် ထည့်သွင်းပေးပါ');
      return;
    }
    if (!draft.price || isNaN(Number(draft.price)) || Number(draft.price) <= 0) {
      showToastErr('မှန်ကန်သော ဈေးနှုန်း ထည့်သွင်းပေးပါ');
      return;
    }

    setRowSavingId(dishId);
    try {
      await onSaveDish(draft);
      setDirtyIds((prev) => {
        const next = new Set(prev);
        next.delete(dishId);
        return next;
      });
      setRowSavedSuccessId(dishId);
      setTimeout(() => setRowSavedSuccessId(null), 2000);
    } catch (err) {
      showToastErr('သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setRowSavingId(null);
    }
  };

  // Save all modified dishes (or all dishes if onSaveAllDishes exists)
  const handleSaveAllModified = async () => {
    const dishesToSave = Array.from(dirtyIds)
      .map((id) => allDrafts[id])
      .filter(Boolean);

    if (dishesToSave.length === 0) {
      showToastErr('ပြင်ဆင်ထားသော ဟင်းလျာ မရှိသေးပါ');
      return;
    }

    setIsBatchSaving(true);
    setBatchSuccessMessage('');
    try {
      if (onSaveAllDishes) {
        await onSaveAllDishes(dishesToSave);
      } else if (onSaveDish) {
        // Fallback: parallel saves
        await Promise.all(dishesToSave.map((d) => onSaveDish(d)));
      }
      setDirtyIds(new Set());
      setBatchSuccessMessage(`ဟင်းလျာ (${dishesToSave.length}) ခုလုံး၏ ပြင်ဆင်ချက်များကို အောင်မြင်စွာ သိမ်းဆည်းပြီးပါပြီ!`);
      setTimeout(() => setBatchSuccessMessage(''), 3500);
    } catch (err) {
      showToastErr('အားလုံး သိမ်းဆည်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsBatchSaving(false);
    }
  };

  // Filter items for the All-Menu list
  const filteredAllItems = items.filter((it) => {
    const matchesCategory =
      selectedFilterCategory === 'အားလုံး' || it.category === selectedFilterCategory;
    const q = searchQuery.trim().toLowerCase();
    const draft = allDrafts[it.id] || it;
    const matchesSearch =
      !q ||
      draft.name.toLowerCase().includes(q) ||
      draft.englishName.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  // ------------------------------------------
  // Single Dish Form Handlers
  // ------------------------------------------
  const resetForm = () => {
    setName('');
    setEnglishName('');
    setPrice('');
    setCategory('မုန့်ဟင်းခါး');
    setEmoji('🍜');
    setDescription('');
    setImageUrl('');
    setBadge('');
    setIsPopular(false);
    setFormError('');
    setEditingItem(null);
  };

  const handleStartEdit = (it: MenuItem) => {
    setEditingItem(it);
    setName(it.name || '');
    setEnglishName(it.englishName || '');
    setPrice(typeof it.price === 'number' ? it.price : '');
    setCategory(it.category || 'မုန့်ဟင်းခါး');
    setEmoji(it.emoji || '🍜');
    setDescription(it.description || '');
    setImageUrl(it.imageUrl || '');
    setBadge(it.badge || '');
    setIsPopular(Boolean(it.isPopular));
    setImageInputMode(it.imageUrl?.startsWith('data:') ? 'upload' : 'url');
    setFormError('');
    setActiveTab('single');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError('ဓာတ်ပုံဖိုင်ဆိုဒ် 2MB ထက် မကျော်ရပါ');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setImageUrl(reader.result);
        setFormError('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('ဟင်းလျာ အမည် ထည့်သွင်းပေးပါ');
      return;
    }
    if (price === '' || isNaN(Number(price)) || Number(price) <= 0) {
      setFormError('မှန်ကန်သော ဈေးနှုန်း ထည့်သွင်းပေးပါ');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingItem && onSaveDish) {
        const updated: MenuItem = {
          ...editingItem,
          name: name.trim(),
          englishName: englishName.trim() || name.trim(),
          price: Number(price),
          category,
          emoji: emoji.trim() || '🍜',
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          badge: badge.trim() || undefined,
          isPopular,
        };
        await onSaveDish(updated);
        resetForm();
      } else {
        await onAddDish({
          name: name.trim(),
          englishName: englishName.trim() || name.trim(),
          price: Number(price),
          category,
          emoji: emoji.trim() || '🍜',
          description: description.trim(),
          imageUrl: imageUrl.trim() || undefined,
          badge: badge.trim() || undefined,
          isPopular,
        });
        resetForm();
      }
    } catch (err: any) {
      setFormError(
        editingItem
          ? 'ဟင်းလျာ ပြင်ဆင်မှု မအောင်မြင်ပါ'
          : 'ဟင်းလျာ အသစ်ထည့်သွင်းမှု မအောင်မြင်ပါ'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('golden_admin_logged_in');
      await signOut(auth);
      onClose();
    } catch (err) {
      console.error('Logout error:', err);
      localStorage.removeItem('golden_admin_logged_in');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-60 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Main Drawer Panel */}
      <div className="relative w-full max-w-3xl lg:max-w-4xl bg-[#FFFDF9] shadow-2xl h-full flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-amber-900/10">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-amber-950 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-amber-800 text-amber-200 text-lg">
              ⚙️
            </span>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg font-serif">
                Admin Management Panel
              </h3>
              <p className="text-xs text-amber-300/80">
                {auth.currentUser?.email || 'Admin'} • မီနူး ({items.length}) ခု
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="အကောင့်ထွက်မည်"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ထွက်မည်</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-amber-900 text-amber-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Switcher Tabs (All Menu Edit vs Orders & Trends vs Single Add) */}
        <div className="bg-amber-100/70 p-1.5 flex flex-wrap sm:flex-nowrap gap-1.5 border-b border-amber-900/10 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`flex-1 min-w-[120px] py-2 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-300" />
            <span>⚡ မီနူးအားလုံး ပြင်ရန် ({items.length})</span>
            {dirtyIds.size > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-red-500 text-white font-extrabold animate-pulse">
                {dirtyIds.size} ခု ပြင်ထား
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`flex-1 min-w-[140px] py-2 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-amber-300" />
            <span>📊 အော်ဒါနှင့် အရောင်းစာရင်း (Orders)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex-1 min-w-[120px] py-2 px-3 text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'single'
                ? 'bg-amber-800 text-amber-50 shadow-xs'
                : 'text-stone-700 hover:text-stone-900 hover:bg-white/60'
            }`}
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>
              {editingItem ? 'ဟင်းလျာ ပြင်ဆင်နေသည်' : 'ဟင်းလျာ အသစ်ထည့်ရန်'}
            </span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* ========================================================= */}
          {/* TAB 1: ALL MENU BATCH / INLINE EDITOR                     */}
          {/* ========================================================= */}
          {activeTab === 'all' && (
            <div className="space-y-4">
              {/* Batch Success Banner */}
              {batchSuccessMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-xs sm:text-sm text-emerald-800 font-bold flex items-center gap-2 shadow-xs animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{batchSuccessMessage}</span>
                </div>
              )}

              {/* Top Controls Toolbar */}
              <div className="bg-white p-4 rounded-2xl border border-amber-900/10 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>မီနူးအားလုံး အမြန်ပြင်ဆင်ရန် (All Menus Quick Editor)</span>
                    </h4>
                    <p className="text-xs text-stone-500">
                      ဟင်းလျာများ၏ အမည်၊ ဈေးနှုန်း၊ အမျိုးအစားနှင့် ဓာတ်ပုံ Link များကို တိုက်ရိုက် ပြင်ဆင်နိုင်ပါသည်
                    </p>
                  </div>

                  {/* Master Save All & Reset Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {dirtyIds.size > 0 && (
                      <button
                        type="button"
                        onClick={handleResetDrafts}
                        disabled={isBatchSaving}
                        className="px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>မူလအတိုင်း ပြန်စမည်</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleSaveAllModified}
                      disabled={isBatchSaving || dirtyIds.size === 0}
                      className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:hover:bg-amber-600 text-white text-xs sm:text-sm font-bold shadow-md shadow-amber-900/15 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Save className="w-4 h-4 text-amber-200" />
                      <span>
                        {isBatchSaving
                          ? 'သိမ်းဆည်းနေပါသည်...'
                          : dirtyIds.size > 0
                          ? `ပြင်ဆင်ထားသည်များ အားလုံး သိမ်းမည် (${dirtyIds.size} ခု)`
                          : 'ပြင်ဆင်ထားသည်များ အားလုံး သိမ်းမည်'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2 border-t border-stone-100">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ဟင်းလျာ အမည် ရှာရန်..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                    {(['အားလုံး', ...CATEGORIES.filter((c) => c.label !== 'အားလုံး').map((c) => c.label)] as (Category | 'အားလုံး')[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedFilterCategory(cat)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                          selectedFilterCategory === cat
                            ? 'bg-amber-700 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Items Card List / Table */}
              <div className="space-y-3">
                {filteredAllItems.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-amber-300 text-stone-500 text-xs">
                    ရှာဖွေမှုနှင့် ကိုက်ညီသော ဟင်းလျာ မရှိပါ။
                  </div>
                ) : (
                  filteredAllItems.map((it, idx) => {
                    const draft = allDrafts[it.id] || it;
                    const isDirty = dirtyIds.has(it.id);
                    const isSavingThisRow = rowSavingId === it.id;
                    const isSavedThisRow = rowSavedSuccessId === it.id;

                    return (
                      <div
                        key={it.id}
                        className={`bg-white rounded-2xl border p-3.5 sm:p-4 shadow-xs transition-all space-y-3 ${
                          isDirty
                            ? 'border-amber-400 ring-2 ring-amber-400/20 bg-amber-50/20'
                            : 'border-amber-900/10 hover:border-amber-300'
                        }`}
                      >
                        {/* Row Header & Main Info */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3 w-full sm:w-auto">
                            {/* Image Thumbnail Preview & Quick Mode */}
                            <div className="relative group/thumb w-14 h-14 rounded-xl bg-amber-100 border border-amber-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl shadow-2xs">
                              {draft.imageUrl ? (
                                <img
                                  src={draft.imageUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={() => {}}
                                />
                              ) : (
                                <span>{draft.emoji}</span>
                              )}
                              <button
                                type="button"
                                onClick={() => onEditDish(draft)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold"
                                title="ပုံပြောင်းရန် အသေးစိတ်ဖွင့်မည်"
                              >
                                ပုံပြင်မည်
                              </button>
                            </div>

                            {/* Title & Index Badge */}
                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-stone-400">
                                  #{idx + 1}
                                </span>
                                <input
                                  type="text"
                                  value={draft.name}
                                  onChange={(e) =>
                                    handleUpdateDraftField(it.id, 'name', e.target.value)
                                  }
                                  placeholder="ဟင်းလျာအမည်"
                                  className="font-bold text-xs sm:text-sm text-amber-950 px-2 py-1 bg-stone-50 hover:bg-white focus:bg-white rounded-lg border border-stone-200 focus:border-amber-600 focus:outline-hidden w-full max-w-xs"
                                />
                                {isDirty && (
                                  <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full shrink-0">
                                    ပြင်ဆင်ဆဲ
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={draft.englishName || ''}
                                  onChange={(e) =>
                                    handleUpdateDraftField(it.id, 'englishName', e.target.value)
                                  }
                                  placeholder="English / အခြားအမည်"
                                  className="text-[11px] text-stone-600 px-2 py-0.5 bg-stone-50 hover:bg-white focus:bg-white rounded-lg border border-stone-200 focus:border-amber-600 focus:outline-hidden w-full max-w-xs"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Quick Actions (Row Save, Full Edit Dialog, Delete) */}
                          <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                            {isSavedThisRow && (
                              <span className="text-xs text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span>သိမ်းပြီး</span>
                              </span>
                            )}

                            {onSaveDish && (
                              <button
                                type="button"
                                onClick={() => handleSaveSingleRow(it.id)}
                                disabled={isSavingThisRow || !isDirty}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                                  isDirty
                                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs'
                                    : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                                }`}
                                title="ဤဟင်းလျာကို သိမ်းဆည်းမည်"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>{isSavingThisRow ? 'သိမ်းနေ...' : 'သိမ်းမည်'}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => onEditDish(draft)}
                              className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer"
                              title="အသေးစိတ် Popup ဖြင့် ပြင်မည်"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => setDishToDelete({ id: it.id, name: draft.name || it.name })}
                              className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="ဖျက်မည်"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Inline Fields Grid (Price, Category, Image URL, Popular) */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-2 border-t border-stone-100 text-xs">
                          {/* ဈေးနှုန်း (Price) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 block">
                              ဈေးနှုန်း (ကျပ်)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                value={draft.price}
                                onChange={(e) =>
                                  handleUpdateDraftField(
                                    it.id,
                                    'price',
                                    e.target.value === '' ? ('' as any) : Number(e.target.value)
                                  )
                                }
                                placeholder="2500"
                                min="0"
                                step="50"
                                className="w-full px-2.5 py-1 font-bold text-amber-950 bg-stone-50 rounded-lg border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                              />
                            </div>
                          </div>

                          {/* အမျိုးအစား (Category) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 block">
                              အမျိုးအစား (Category)
                            </label>
                            <select
                              value={draft.category}
                              onChange={(e) =>
                                handleUpdateDraftField(it.id, 'category', e.target.value as Category)
                              }
                              className="w-full px-2 py-1 bg-stone-50 rounded-lg border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden font-semibold text-stone-800"
                            >
                              {CATEGORIES.filter((c) => c.label !== 'အားလုံး').map((c) => (
                                <option key={c.label} value={c.label}>
                                  {c.emoji} {c.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* ဓာတ်ပုံ URL Link & Upload */}
                          <div className="space-y-1 sm:col-span-1">
                            <label className="text-[10px] font-bold text-stone-500 flex items-center justify-between">
                              <span>ဓာတ်ပုံ (Image / URL)</span>
                              {draft.imageUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleUpdateDraftField(it.id, 'imageUrl', '')}
                                  className="text-[9px] text-red-600 hover:underline"
                                >
                                  ဖယ်ရှားမည်
                                </button>
                              )}
                            </label>
                            <div className="flex items-center gap-1.5">
                              <div className="relative flex-1">
                                <Globe className="w-3.5 h-3.5 text-stone-400 absolute left-2 top-1/2 -translate-y-1/2" />
                                <input
                                  type="url"
                                  value={draft.imageUrl || ''}
                                  onChange={(e) =>
                                    handleUpdateDraftField(it.id, 'imageUrl', e.target.value)
                                  }
                                  placeholder="https://... (သို့) Upload"
                                  className="w-full pl-6 pr-2 py-1 text-[11px] bg-stone-50 rounded-lg border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden text-stone-700"
                                />
                              </div>
                              <label
                                className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg cursor-pointer transition-colors shrink-0 shadow-2xs flex items-center justify-center"
                                title="ဖုန်း/ကွန်ပျူတာမှ ဓာတ်ပုံတင်မည်"
                              >
                                <Upload className="w-3.5 h-3.5" />
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    if (file.size > 2 * 1024 * 1024) {
                                      showToastErr('ဓာတ်ပုံဖိုင်ဆိုဒ် 2MB ထက် မကျော်ရပါ');
                                      return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        handleUpdateDraftField(it.id, 'imageUrl', reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }}
                                />
                              </label>
                            </div>
                          </div>

                          {/* Popular / Best Seller Toggle */}
                          <div className="flex items-center sm:justify-center pt-2 sm:pt-4">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(draft.isPopular)}
                                onChange={(e) =>
                                  handleUpdateDraftField(it.id, 'isPopular', e.target.checked)
                                }
                                className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
                              />
                              <span className="text-[11px] font-bold text-stone-700 flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-amber-500" />
                                <span>လူကြိုက်များ</span>
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: SINGLE DISH FORM (Add New or Edit Mode)            */}
          {/* ========================================================= */}
          {activeTab === 'single' && (
            <div className="space-y-6">
              {/* Form Card */}
              <div
                ref={formRef}
                className={`rounded-2xl p-5 border shadow-xs space-y-4 transition-all ${
                  editingItem
                    ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/30'
                    : 'bg-white border-amber-900/10'
                }`}
              >
                <div className="flex items-center justify-between border-b border-amber-900/10 pb-3">
                  <div className="flex items-center gap-2">
                    {editingItem ? (
                      <span className="p-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center gap-1">
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>ဟင်းလျာ ပြင်ဆင်ရန် (Editing: {editingItem.name})</span>
                      </span>
                    ) : (
                      <h4 className="font-bold text-sm sm:text-base text-amber-950 flex items-center gap-2">
                        <Plus className="w-4 h-4 text-amber-700" />
                        <span>ဟင်းလျာအသစ်ထည့်ရန် (Add New Dish)</span>
                      </h4>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingItem ? (
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="text-xs font-semibold text-stone-600 hover:text-stone-800 bg-stone-200/80 hover:bg-stone-300 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>မပြင်တော့ပါ</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onSeedDishes}
                        className="text-xs font-semibold text-amber-800 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="မူလဟင်းလျာများ ထည့်သွင်းရန်"
                      >
                        <Database className="w-3 h-3" />
                        <span>Seed မီနူး</span>
                      </button>
                    )}
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Image input with URL Link vs File Upload */}
                  <div className="space-y-2 bg-stone-50/80 p-3 rounded-2xl border border-stone-200/80">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-700" />
                        <span>ဟင်းလျာ ဓာတ်ပုံ (Food Image)</span>
                      </label>

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

                    {imageInputMode === 'url' ? (
                      <div className="space-y-2">
                        <div className="relative">
                          <Globe className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="url"
                            value={imageUrl}
                            onChange={(e) => {
                              setImageUrl(sanitizeImageUrl(e.target.value));
                              setFormError('');
                            }}
                            placeholder="https://example.com/food-photo.jpg (Direct Image Link)"
                            className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-stone-200 focus:border-amber-600 focus:outline-hidden"
                          />
                        </div>

                        {/* Social Page Link Guide */}
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
                      <div className="space-y-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-xs text-stone-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-900 hover:file:bg-amber-200 cursor-pointer"
                        />
                        <p className="text-[10px] text-stone-500">
                          ဖုန်း (သို့) ကွန်ပျူတာမှ ဓာတ်ပုံရွေးချယ်ပါ (အများဆုံး 2MB)
                        </p>
                      </div>
                    )}

                    {imageUrl && (
                      <div className="flex items-center gap-3 pt-1 border-t border-stone-200/60">
                        <div className="w-12 h-12 rounded-xl border border-amber-300 overflow-hidden bg-amber-50 shrink-0 flex items-center justify-center">
                          <img
                            src={imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={() => setFormError('ဓာတ်ပုံ URL မှ ပုံကို load မလုပ်နိုင်ပါ (Upload ဖိုင် ခလုတ်ဖြင့် စမ်းကြည့်ပါ)')}
                          />
                        </div>
                        <div className="text-xs space-y-0.5 flex-1 min-w-0">
                          <p className="font-semibold text-emerald-700 flex items-center gap-1 text-[11px]">
                            <Check className="w-3 h-3" /> ဓာတ်ပုံ ထည့်သွင်းထားပါသည်
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setImageUrl('');
                              setFormError('');
                            }}
                            className="text-[11px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>ဓာတ်ပုံဖယ်ရှားမည်</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        ဟင်းလျာအမည် (Name) *
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

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-stone-700">
                      ဖော်ပြချက် (Description)
                    </label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="ပါဝင်ပစ္စည်းနှင့် အရသာအကျဉ်း..."
                      className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        English / Alternative Name
                      </label>
                      <input
                        type="text"
                        value={englishName}
                        onChange={(e) => setEnglishName(e.target.value)}
                        placeholder="Mohinga"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-stone-700">
                        Badge (ဥပမာ- ရိုးရာစစ်စစ်)
                      </label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="ရိုးရာစစ်စစ်"
                        className="w-full px-3 py-2 text-xs sm:text-sm bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={isPopular}
                      onChange={(e) => setIsPopular(e.target.checked)}
                      className="w-4 h-4 text-amber-600 rounded-sm border-stone-300 focus:ring-amber-500"
                    />
                    <label htmlFor="isPopular" className="text-xs font-bold text-stone-800 cursor-pointer">
                      🔥 လူကြိုက်များသော ဟင်းလျာ (Popular / Best Seller)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-900/10 transition-colors cursor-pointer"
                  >
                    {editingItem ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>{isSubmitting ? 'သိမ်းဆည်းနေပါသည်...' : 'ပြင်ဆင်ချက် သိမ်းဆည်းမည်'}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>{isSubmitting ? 'ထည့်သွင်းနေပါသည်...' : 'ဟင်းလျာ ထည့်သွင်းမည်'}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Single View: Quick List below */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-amber-950">
                    လက်ရှိ ဟင်းလျာများ စာရင်း ({items.length}) ခု
                  </h4>
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className="text-xs font-bold text-amber-700 hover:underline flex items-center gap-1"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>ဇယားဖြင့် အားလုံး ပြင်မည်</span>
                  </button>
                </div>

                <div className="bg-white rounded-2xl border border-amber-900/10 shadow-xs divide-y divide-stone-100 overflow-hidden">
                  {items.map((it) => (
                    <div
                      key={it.id}
                      className="p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-amber-50/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                          {it.imageUrl ? (
                            <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            it.emoji
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-amber-950 truncate">
                            {it.name}
                          </p>
                          <p className="text-xs font-bold text-amber-800">
                            {it.price.toLocaleString()} ကျပ် • {it.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(it)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>ပြင်မည်</span>
                        </button>
                        <button
                          onClick={() => onEditDish(it)}
                          className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 cursor-pointer"
                          title="အသေးစိတ် Popup"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDishToDelete({ id: it.id, name: it.name })}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 cursor-pointer"
                          title="ဖျက်မည်"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: PAST ORDERS & SALES TRENDS ANALYTICS               */}
          {/* ========================================================= */}
          {activeTab === 'orders' && (
            <AdminOrdersTab menuItems={items} />
          )}

        </div>
      </div>

      {/* Floating Inline Toast Error */}
      {toastError && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-90 bg-red-600 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs sm:text-sm font-bold animate-in fade-in duration-200">
          {toastError}
        </div>
      )}

      {/* In-App Delete Confirmation Modal (Avoids blocked window.confirm in iframe) */}
      {dishToDelete && (
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
                "<span className="font-bold text-red-700">{dishToDelete.name}</span>" ကို မီနူးနှင့် Firestore မှ အပြီးတိုင် ဖျက်ပစ်ပါမည်။
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDishToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 font-bold text-xs transition-colors cursor-pointer"
              >
                မဖျက်တော့ပါ
              </button>
              <button
                type="button"
                onClick={async () => {
                  setIsDeleting(true);
                  try {
                    await onDeleteDish(dishToDelete.id);
                    if (editingItem?.id === dishToDelete.id) {
                      resetForm();
                    }
                    setDishToDelete(null);
                  } catch (err) {
                    showToastErr('ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
                    setDishToDelete(null);
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
