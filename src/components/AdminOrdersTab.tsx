import React, { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Store,
  ChefHat,
  XCircle,
  Phone,
  MapPin,
  RotateCcw,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Order, OrderStatus, MenuItem } from '../types/menu';
import { db, hasFirebaseConfig } from '../lib/firebase';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

interface AdminOrdersTabProps {
  menuItems?: MenuItem[];
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ menuItems = [] }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  // Real-time Firestore subscription to orders
  useEffect(() => {
    if (!hasFirebaseConfig) {
      setOrders(getFallbackSampleOrders());
      setLoading(false);
      return;
    }

    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, limit(200));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: Order[] = [];
          snapshot.forEach((d) => {
            const data = d.data();
            list.push({
              id: d.id,
              customerName: data.customerName || 'Customer',
              phone: data.phone || '-',
              orderType: data.orderType || 'delivery',
              address: data.address,
              note: data.note,
              items: Array.isArray(data.items) ? data.items : [],
              totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount : 0,
              status: (data.status as OrderStatus) || 'pending',
              createdAt: data.createdAt || new Date().toISOString(),
              orderNumber: data.orderNumber || `#${d.id.slice(-4)}`,
            });
          });

          // Sort descending by date
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(list);
          setLoading(false);
        },
        (error) => {
          console.warn('Firestore orders read error:', error);
          setOrders(getFallbackSampleOrders());
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      console.warn('Failed to listen to orders:', err);
      setOrders(getFallbackSampleOrders());
      setLoading(false);
    }
  }, []);

  // Update order status in Firestore
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    if (!hasFirebaseConfig) {
      setOrders((prev) =>
        prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
      );
      showToast('success', 'Status အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ');
      setUpdatingId(null);
      return;
    }

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      showToast('success', 'Status အောင်မြင်စွာ ပြောင်းလဲပြီးပါပြီ');
    } catch (err) {
      console.error('Failed to update status:', err);
      showToast('error', 'Status ပြောင်းလဲရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete an order
  const handleDeleteOrder = async (orderId: string) => {
    if (!hasFirebaseConfig) {
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      showToast('success', 'အော်ဒါမှတ်တမ်း ဖျက်ပြီးပါပြီ');
      return;
    }

    try {
      await deleteDoc(doc(db, 'orders', orderId));
      showToast('success', 'အော်ဒါမှတ်တမ်း ဖျက်ပြီးပါပြီ');
    } catch (err) {
      console.error('Failed to delete order:', err);
      showToast('error', 'ဖျက်ရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    }
  };

  // Seed realistic sample orders for sales demo & trends tracking
  const handleSeedSampleOrders = async () => {
    setIsSeeding(true);
    const sampleList = getRealisticSeedOrders();

    try {
      if (hasFirebaseConfig) {
        for (const sample of sampleList) {
          await setDoc(doc(db, 'orders', sample.id), sample);
        }
      } else {
        setOrders(sampleList);
      }
      showToast('success', 'နမူနာ အရောင်းမှတ်တမ်းများ ထည့်သွင်းပြီးပါပြီ');
    } catch (err) {
      console.error('Failed to seed orders:', err);
      showToast('error', 'မှတ်တမ်းထည့်သွင်းရာတွင် အမှားဖြစ်ပေါ်ပါသည်');
    } finally {
      setIsSeeding(false);
    }
  };

  // -------------------------------------------------------------
  // ANALYTICS & TRENDS COMPUTATION
  // -------------------------------------------------------------
  const analytics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter((o) => o.status !== 'cancelled');
    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
    const todayCompleted = todayOrders.filter((o) => o.status !== 'cancelled');
    const todayRevenue = todayCompleted.reduce((sum, o) => sum + o.totalAmount, 0);

    const deliveryCount = orders.filter((o) => o.orderType === 'delivery').length;
    const pickupCount = orders.filter((o) => o.orderType === 'pickup').length;
    const pendingCount = orders.filter((o) => o.status === 'pending').length;
    const preparingCount = orders.filter((o) => o.status === 'preparing').length;
    const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

    // Top selling dish items
    const itemMap: Record<string, { name: string; emoji: string; count: number; revenue: number }> = {};
    completedOrders.forEach((ord) => {
      ord.items.forEach((it) => {
        const key = it.name || it.itemId;
        if (!itemMap[key]) {
          itemMap[key] = {
            name: it.name,
            emoji: it.emoji || '🍜',
            count: 0,
            revenue: 0,
          };
        }
        itemMap[key].count += it.quantity;
        itemMap[key].revenue += it.price * it.quantity;
      });
    });

    const topDishes = Object.values(itemMap).sort((a, b) => b.count - a.count).slice(0, 5);

    // Group sales by day (last 7 days)
    const dailyMap: Record<string, { label: string; revenue: number; count: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('my-MM', { weekday: 'short' });
      const displayLabel = `${dayName} (${d.getDate()}/${d.getMonth() + 1})`;
      dailyMap[dateKey] = { label: displayLabel, revenue: 0, count: 0 };
    }

    completedOrders.forEach((o) => {
      const dateKey = o.createdAt.split('T')[0];
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].revenue += o.totalAmount;
        dailyMap[dateKey].count += 1;
      }
    });

    const dailyChart = Object.values(dailyMap);
    const maxDailyRevenue = Math.max(...dailyChart.map((d) => d.revenue), 10000);

    return {
      totalOrders,
      totalRevenue,
      todayOrdersCount: todayOrders.length,
      todayRevenue,
      deliveryCount,
      pickupCount,
      pendingCount,
      preparingCount,
      deliveredCount,
      topDishes,
      dailyChart,
      maxDailyRevenue,
    };
  }, [orders]);

  // -------------------------------------------------------------
  // FILTERED ORDERS LIST
  // -------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false;
      }

      // Date range filter
      if (dateFilter !== 'all') {
        const orderDate = new Date(order.createdAt).getTime();
        const now = Date.now();
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (dateFilter === 'today') {
          const todayStart = new Date();
          todayStart.setHours(0, 0, 0, 0);
          if (orderDate < todayStart.getTime()) return false;
        } else if (dateFilter === '7days') {
          if (now - orderDate > 7 * oneDayMs) return false;
        } else if (dateFilter === '30days') {
          if (now - orderDate > 30 * oneDayMs) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = order.customerName.toLowerCase().includes(q);
        const matchPhone = order.phone.toLowerCase().includes(q);
        const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
        const matchItem = order.items.some((it) => it.name.toLowerCase().includes(q));
        const matchAddress = (order.address || '').toLowerCase().includes(q);
        if (!matchName && !matchPhone && !matchNumber && !matchItem && !matchAddress) {
          return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, dateFilter, searchQuery]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <Clock className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>စောင့်ဆိုင်းဆဲ</span>
          </span>
        );
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600" />
            <span>အတည်ပြုပြီး</span>
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-300">
            <ChefHat className="w-3 h-3 text-purple-600" />
            <span>ချက်ပြုတ်နေဆဲ</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <Truck className="w-3 h-3 text-emerald-600" />
            <span>ပို့ဆောင်ပြီး</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3 text-red-500" />
            <span>ပယ်ဖျက်</span>
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('my-MM', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Toast Feedback */}
      {feedbackMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. TOP STATS & REVENUE OVERVIEW CARDS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-100 text-xs font-bold">
            <span>စုစုပေါင်း ရောင်းရငွေ</span>
            <span className="p-1.5 rounded-lg bg-white/20">💰</span>
          </div>
          <p className="text-xl sm:text-2xl font-black font-serif">
            {analytics.totalRevenue.toLocaleString()}{' '}
            <span className="text-xs font-normal text-amber-200">ကျပ်</span>
          </p>
          <p className="text-[11px] text-amber-200/90 font-medium">
            စုစုပေါင်း {analytics.totalOrders} ခု မှ ရရှိငွေ
          </p>
        </div>

        {/* Today's Sales */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>ယနေ့ ရောင်းရငွေ</span>
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
              Today
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-950 font-serif">
            {analytics.todayRevenue.toLocaleString()}{' '}
            <span className="text-xs font-normal text-stone-500">ကျပ်</span>
          </p>
          <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>ယနေ့ အော်ဒါ {analytics.todayOrdersCount} ခု</span>
          </p>
        </div>

        {/* Pending & Active Orders */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>လုပ်ဆောင်ရန် အော်ဒါများ</span>
            <span className="p-1.5 rounded-lg bg-amber-100 text-amber-900 text-xs">⏳</span>
          </div>
          <p className="text-xl sm:text-2xl font-black text-amber-900 font-serif">
            {analytics.pendingCount + analytics.preparingCount}{' '}
            <span className="text-xs font-normal text-stone-500">ခု</span>
          </p>
          <div className="text-[11px] text-stone-500 flex items-center gap-2">
            <span className="text-amber-700 font-semibold">စောင့်ဆိုင်းဆဲ ({analytics.pendingCount})</span>
            <span>•</span>
            <span className="text-purple-700 font-semibold">ချက်နေဆဲ ({analytics.preparingCount})</span>
          </div>
        </div>

        {/* Delivery vs Pickup */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-bold">
            <span>ပို့ဆောင်မှု အချိုးအစား</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-900 text-xs">🛵</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <div>
              <p className="text-xs text-stone-500">အိမ်အရောက်ပို့</p>
              <p className="text-base font-bold text-amber-950">{analytics.deliveryCount} ခု</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-500">ဆိုင်လာယူ</p>
              <p className="text-base font-bold text-amber-950">{analytics.pickupCount} ခု</p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SALES TRENDS & POPULAR DISHES CHARTS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Revenue Bar Chart (Last 7 Days) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-700" />
              <h4 className="font-bold text-sm text-amber-950 font-serif">
                ပြီးခဲ့သော ၇ ရက်အတွင်း နေ့စဉ်ရောင်းရငွေ (Daily Sales Trend)
              </h4>
            </div>
            <span className="text-xs text-stone-500">ကျပ် / နေ့စဉ်</span>
          </div>

          {/* Bar Chart Visual */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-stone-100">
            {analytics.dailyChart.map((day, idx) => {
              const heightPercent = Math.max(
                Math.round((day.revenue / analytics.maxDailyRevenue) * 100),
                8
              );
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="text-[10px] font-bold text-amber-900 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {day.revenue > 0 ? `${(day.revenue / 1000).toFixed(0)}k` : '0'}
                  </div>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[36px] rounded-t-lg transition-all duration-300 ${
                      day.revenue > 0
                        ? 'bg-gradient-to-t from-amber-600 to-amber-500 group-hover:from-amber-700 group-hover:to-amber-600 shadow-xs'
                        : 'bg-stone-100'
                    }`}
                  />
                  <span className="text-[10px] font-semibold text-stone-600 truncate max-w-full text-center">
                    {day.label.split(' ')[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-stone-500">
            💡 အရောင်းအချက်အလက်များကို ပိုမိုသိရှိနိုင်ရန် နေ့စဉ် အော်ဒါများကို စနစ်တကျ အတည်ပြုပေးပါ
          </p>
        </div>

        {/* Top 5 Best Selling Dishes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-900/10 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-amber-950 font-serif">
              🔥 အရောင်းရဆုံး ဟင်းလျာများ
            </h4>
            <span className="text-xs text-amber-800 font-bold">Top 5</span>
          </div>

          {analytics.topDishes.length === 0 ? (
            <div className="text-center py-8 text-xs text-stone-400">
              အော်ဒါမှတ်တမ်း မရှိသေးပါ
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topDishes.map((dish, i) => {
                const maxCount = analytics.topDishes[0]?.count || 1;
                const percent = Math.round((dish.count / maxCount) * 100);
                return (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-stone-800 flex items-center gap-1.5 truncate">
                        <span>{dish.emoji}</span>
                        <span className="truncate">{dish.name}</span>
                      </span>
                      <span className="font-bold text-amber-900 shrink-0">
                        {dish.count} ပွဲ ({dish.revenue.toLocaleString()} Ks)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%` }}
                        className="h-full bg-amber-600 rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ORDERS LIST HEADER & FILTERS */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-amber-900/10 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/70 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-amber-950 font-serif">
              အော်ဒါမှတ်တမ်း စာရင်း ({filteredOrders.length})
            </h3>
            <p className="text-xs text-stone-500">
              Firestore မှ အချိန်နှင့်တစ်ပြေးညီ ရရှိသော အော်ဒါမှတ်တမ်းများ
            </p>
          </div>

          <div className="flex items-center gap-2">
            {orders.length === 0 && (
              <button
                type="button"
                onClick={handleSeedSampleOrders}
                disabled={isSeeding}
                className="px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                <span>{isSeeding ? 'ထည့်သွင်းနေသည်...' : 'နမူနာ အော်ဒါများ ထည့်မည်'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="အမည်၊ ဖုန်း၊ အော်ဒါနံပါတ် ရှာရန်..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 rounded-xl border border-stone-200 focus:border-amber-600 focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-stone-800 focus:outline-hidden"
            >
              <option value="all">အခြေအနေ အားလုံး (All Statuses)</option>
              <option value="pending">⏳ စောင့်ဆိုင်းဆဲ (Pending)</option>
              <option value="confirmed">✓ အတည်ပြုပြီး (Confirmed)</option>
              <option value="preparing">🍳 ချက်ပြုတ်နေဆဲ (Preparing)</option>
              <option value="delivered">🚚 ပို့ဆောင်ပြီး (Delivered)</option>
              <option value="cancelled">✕ ပယ်ဖျက် (Cancelled)</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="w-full text-xs bg-stone-50 border border-stone-200 rounded-xl py-2 px-3 text-stone-800 focus:outline-hidden"
            >
              <option value="all">ကာလ အားလုံး (All Time)</option>
              <option value="today">ယနေ့ အော်ဒါများ (Today)</option>
              <option value="7days">ပြီးခဲ့သော ၇ ရက် (Last 7 Days)</option>
              <option value="30days">ပြီးခဲ့သော ရက် ၃၀ (Last 30 Days)</option>
            </select>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. ORDERS TABLE / CARDS */}
        {/* ========================================================================= */}
        {loading ? (
          <div className="py-12 text-center text-xs text-stone-500 animate-pulse">
            Firestore မှ အော်ဒါမှတ်တမ်းများကို ရယူနေပါသည်...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl mx-auto">
              📦
            </div>
            <p className="text-xs font-bold text-stone-600">
              ရှာဖွေမှုနှင့် ကိုက်ညီသော အော်ဒါမှတ်တမ်း မတွေ့ရှိပါ
            </p>
            {orders.length === 0 && (
              <button
                type="button"
                onClick={handleSeedSampleOrders}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
              >
                နမူနာ အရောင်းမှတ်တမ်းများ ထည့်သွင်းကြည့်ရန်
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border border-stone-200/80 hover:border-amber-400 bg-stone-50/50 hover:bg-amber-50/30 rounded-2xl p-3.5 sm:p-4 transition-colors space-y-3"
              >
                {/* Top Row: Order ID, Time, Type, Status Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                      {order.orderNumber || `#${order.id.slice(-4)}`}
                    </span>
                    <span className="text-xs text-stone-500 font-medium">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600">
                      {order.orderType === 'delivery' ? (
                        <>
                          <Truck className="w-3 h-3 text-amber-700" />
                          <span>Delivery</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-3 h-3 text-blue-700" />
                          <span>Pickup</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}

                    {/* Status update dropdown */}
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      className="text-xs font-bold bg-white border border-stone-200 rounded-lg py-1 px-2 text-stone-800 focus:outline-hidden cursor-pointer"
                    >
                      <option value="pending">⏳ စောင့်ဆိုင်းဆဲ</option>
                      <option value="confirmed">✓ အတည်ပြုပြီး</option>
                      <option value="preparing">🍳 ချက်ပြုတ်နေဆဲ</option>
                      <option value="delivered">🚚 ပို့ဆောင်ပြီး</option>
                      <option value="cancelled">✕ ပယ်ဖျက်</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleDeleteOrder(order.id)}
                      title="အော်ဒါမှတ်တမ်း ဖျက်ရန်"
                      className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Items Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-stone-200/60 text-xs">
                  {/* Customer Info */}
                  <div className="space-y-1">
                    <p className="font-bold text-stone-900 flex items-center gap-1">
                      <span>👤 {order.customerName}</span>
                    </p>
                    <p className="text-stone-600 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-amber-700" />
                      <a href={`tel:${order.phone}`} className="hover:underline font-semibold text-amber-900">
                        {order.phone}
                      </a>
                    </p>
                    {order.address && (
                      <p className="text-stone-500 flex items-start gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{order.address}</span>
                      </p>
                    )}
                  </div>

                  {/* Items list */}
                  <div className="space-y-1 md:col-span-2">
                    <p className="font-bold text-stone-700">မှာယူထားသော ဟင်းလျာများ:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {order.items.map((it, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 font-medium text-[11px]"
                        >
                          <span>{it.emoji || '🍲'}</span>
                          <span>{it.name}</span>
                          <span className="font-bold text-amber-800">x{it.quantity}</span>
                          <span className="text-stone-400">({(it.price * it.quantity).toLocaleString()} Ks)</span>
                        </span>
                      ))}
                    </div>

                    {order.note && (
                      <p className="text-[11px] text-amber-800 bg-amber-50/70 p-1.5 rounded-lg border border-amber-200/60 mt-1">
                        <strong>မှတ်ချက်:</strong> {order.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Total amount bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/50">
                  <span className="text-xs text-stone-500 font-medium">ကျသင့်ငွေ စုစုပေါင်း</span>
                  <span className="text-sm font-black text-amber-950 font-serif">
                    {order.totalAmount.toLocaleString()} ကျပ်
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Realistic sample orders for first-time dashboard preview & sales trend calculation
function getRealisticSeedOrders(): Order[] {
  const now = new Date();
  const formatIso = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    return d.toISOString();
  };

  return [
    {
      id: 'ord-seed-01',
      orderNumber: '#1024',
      customerName: 'ကိုအောင်ကျော်',
      phone: '09781234567',
      orderType: 'delivery',
      address: 'အမှတ် (၁၂)၊ ကမ်းနားလမ်း၊ မော်လမြိုင်မြို့',
      note: 'ငရုတ်သီးစိမ်း များများထည့်ပေးပါ',
      items: [
        { itemId: 'm-1', name: 'မွန်ရိုးရာ မုန့်ဟင်းခါး', price: 3000, quantity: 2, emoji: '🍜' },
        { itemId: 'f-1', name: 'ပဲကြော်စုံကြွပ်ကြွပ်', price: 1500, quantity: 1, emoji: '🥠' },
      ],
      totalAmount: 7500,
      status: 'delivered',
      createdAt: formatIso(1),
    },
    {
      id: 'ord-seed-02',
      orderNumber: '#1023',
      customerName: 'မသီတာထွေး',
      phone: '09456789012',
      orderType: 'delivery',
      address: 'ဗိုလ်ချုပ်လမ်း၊ ဈေးကြိုရပ်ကွက်',
      note: 'ဆီလျှော့ချက်ပေးပါ',
      items: [
        { itemId: 'c-1', name: 'မွန်ရိုးရာ ငါးသလောက်ပေါင်း', price: 8500, quantity: 1, emoji: '🐟' },
        { itemId: 's-1', name: 'မွန်ရိုးရာ သရက်သီးသုပ်', price: 3000, quantity: 1, emoji: '🥗' },
      ],
      totalAmount: 11500,
      status: 'preparing',
      createdAt: formatIso(3),
    },
    {
      id: 'ord-seed-03',
      orderNumber: '#1022',
      customerName: 'ကိုဇော်မင်း',
      phone: '09250123987',
      orderType: 'pickup',
      items: [
        { itemId: 'm-2', name: 'ငါးဖယ်အစာသွပ် မုန့်ဟင်းခါး', price: 3500, quantity: 3, emoji: '🍲' },
      ],
      totalAmount: 10500,
      status: 'confirmed',
      createdAt: formatIso(5),
    },
    {
      id: 'ord-seed-04',
      orderNumber: '#1021',
      customerName: 'ဒေါ်လှလှမေ',
      phone: '09971239988',
      orderType: 'delivery',
      address: 'မင်းလမ်း၊ မော်လမြိုင်',
      items: [
        { itemId: 'm-1', name: 'မွန်ရိုးရာ မုန့်ဟင်းခါး', price: 3000, quantity: 2, emoji: '🍜' },
        { itemId: 'd-1', name: 'မွန်ရိုးရာ သာကူကျို', price: 1500, quantity: 2, emoji: '🥣' },
      ],
      totalAmount: 9000,
      status: 'delivered',
      createdAt: formatIso(24),
    },
    {
      id: 'ord-seed-05',
      orderNumber: '#1020',
      customerName: 'ကိုဖြိုးဝေ',
      phone: '09798887766',
      orderType: 'delivery',
      address: 'တောင်ဝိုင်းလမ်းမကြီး',
      items: [
        { itemId: 'c-2', name: 'မွန်ရိုးရာ ပုဇွန်ဆီပြန်ဟင်း', price: 7500, quantity: 2, emoji: '🦐' },
        { itemId: 's-2', name: 'ရှမ်းလက်ဖက်သုပ် အကြွပ်ကြော်', price: 2500, quantity: 1, emoji: '🥗' },
      ],
      totalAmount: 17500,
      status: 'delivered',
      createdAt: formatIso(48),
    },
    {
      id: 'ord-seed-06',
      orderNumber: '#1019',
      customerName: 'မနှင်းနု',
      phone: '09420011223',
      orderType: 'pickup',
      items: [
        { itemId: 'm-1', name: 'မွန်ရိုးရာ မုန့်ဟင်းခါး', price: 3000, quantity: 4, emoji: '🍜' },
        { itemId: 'f-1', name: 'ပဲကြော်စုံကြွပ်ကြွပ်', price: 1500, quantity: 2, emoji: '🥠' },
      ],
      totalAmount: 15000,
      status: 'delivered',
      createdAt: formatIso(72),
    },
  ];
}

function getFallbackSampleOrders(): Order[] {
  return getRealisticSeedOrders();
}
