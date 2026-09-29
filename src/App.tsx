import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { MenuSection } from './components/MenuSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CartPanel } from './components/CartPanel';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminEditModal } from './components/AdminEditModal';
import { MenuItem, CartItem } from './types/menu';
import { MENU_ITEMS } from './data/menu';
import { db, auth, hasFirebaseConfig, handleFirestoreError, OperationType } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ShoppingBag, Check } from 'lucide-react';

export default function App() {
  // Initial state uses authentic default MENU_ITEMS so website is immediately usable, syncing in real-time with Firestore
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminPanelTab, setAdminPanelTab] = useState<'all' | 'single' | 'orders'>('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastOrderedItems, setLastOrderedItems] = useState<CartItem[]>([]);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [lastLineUrl, setLastLineUrl] = useState('');
  const [lastSummary, setLastSummary] = useState('');

  // 1. Manage isAdmin strictly from onAuthStateChanged
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAdmin(Boolean(user));
    });
    return () => unsubscribe();
  }, []);

  // 2. Real-time Firestore sync on menuItems collection
  useEffect(() => {
    if (!hasFirebaseConfig) {
      console.warn('⚠️ [Firebase] hasFirebaseConfig is false. Missing API key or Project ID.');
      setLoadingMenu(false);
      return;
    }

    console.log('📡 [Firestore onSnapshot] Attaching real-time listener to collection: "menuItems"');
    const colRef = collection(db, 'menuItems');
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        console.log(`📡 [Firestore onSnapshot] Real-time update received: ${snapshot.docs.length} menu items from Firestore database`);
        if (!snapshot.empty) {
          const items: MenuItem[] = snapshot.docs.map((d) => ({
            id: d.id,
            ...(d.data() as Omit<MenuItem, 'id'>),
          }));
          setMenuItems(items);
        } else {
          // If Firestore collection has not been seeded yet, maintain standard default dishes
          setMenuItems(MENU_ITEMS);
        }
        setLoadingMenu(false);
      },
      (error) => {
        console.error('❌ [Firestore onSnapshot Error]:', error);
        handleFirestoreError(error, OperationType.GET, 'menuItems');
        setLoadingMenu(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSeedDishes = async () => {
    if (!auth.currentUser) return;
    try {
      for (const dish of MENU_ITEMS) {
        const dishData: Record<string, any> = {
          name: dish.name,
          englishName: dish.englishName,
          category: dish.category,
          price: dish.price,
          emoji: dish.emoji,
          description: dish.description,
          badge: dish.badge || '',
          isPopular: Boolean(dish.isPopular),
        };
        if (dish.imageUrl) {
          dishData.imageUrl = dish.imageUrl;
        }
        await setDoc(doc(db, 'menuItems', dish.id), dishData, { merge: true });
      }
      setToastMessage('SAMPLE_DISHES များကို Firestore သို့ Seed လုပ်ပြီးပါပြီ');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menuItems');
    }
  };

  // Add new dish in Firestore
  const handleAddDish = async (newDish: Omit<MenuItem, 'id'>) => {
    const docId = `dish-${Date.now()}`;
    try {
      const cleanData: Record<string, any> = {
        name: newDish.name,
        englishName: newDish.englishName || newDish.name,
        category: newDish.category,
        price: Number(newDish.price),
        emoji: newDish.emoji || '🍜',
        description: newDish.description || '',
      };
      if (newDish.imageUrl && newDish.imageUrl.trim()) {
        cleanData.imageUrl = newDish.imageUrl.trim();
      }
      if (newDish.badge && newDish.badge.trim()) {
        cleanData.badge = newDish.badge.trim();
      }
      if (typeof newDish.isPopular === 'boolean') {
        cleanData.isPopular = newDish.isPopular;
      }

      await setDoc(doc(db, 'menuItems', docId), cleanData);
      setToastMessage(`"${newDish.name}" ကို Firestore သို့ ထည့်ပြီးပါပြီ`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `menuItems/${docId}`);
      throw err;
    }
  };

  // Update existing dish in Firestore
  const handleSaveDish = async (updatedDish: MenuItem) => {
    try {
      const cleanData: Record<string, any> = {
        name: updatedDish.name,
        englishName: updatedDish.englishName || updatedDish.name,
        category: updatedDish.category,
        price: Number(updatedDish.price),
        emoji: updatedDish.emoji || '🍜',
        description: updatedDish.description || '',
      };
      if (updatedDish.imageUrl && updatedDish.imageUrl.trim()) {
        cleanData.imageUrl = updatedDish.imageUrl.trim();
      }
      if (updatedDish.badge && updatedDish.badge.trim()) {
        cleanData.badge = updatedDish.badge.trim();
      }
      if (typeof updatedDish.isPopular === 'boolean') {
        cleanData.isPopular = updatedDish.isPopular;
      }

      await setDoc(doc(db, 'menuItems', updatedDish.id), cleanData);
      setToastMessage(`"${updatedDish.name}" ကို ပြင်ဆင်သိမ်းဆည်းပြီးပါပြီ`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `menuItems/${updatedDish.id}`);
      throw err;
    }
  };

  // Update multiple dishes in Firestore in an atomic batch
  const handleSaveAllDishes = async (updatedDishes: MenuItem[]) => {
    try {
      const batch = writeBatch(db);
      for (const dish of updatedDishes) {
        const cleanData: Record<string, any> = {
          name: dish.name,
          englishName: dish.englishName || dish.name,
          category: dish.category,
          price: Number(dish.price),
          emoji: dish.emoji || '🍜',
          description: dish.description || '',
        };
        if (dish.imageUrl && dish.imageUrl.trim()) {
          cleanData.imageUrl = dish.imageUrl.trim();
        } else {
          cleanData.imageUrl = '';
        }
        if (dish.badge && dish.badge.trim()) {
          cleanData.badge = dish.badge.trim();
        } else {
          cleanData.badge = '';
        }
        if (typeof dish.isPopular === 'boolean') {
          cleanData.isPopular = dish.isPopular;
        }
        batch.set(doc(db, 'menuItems', dish.id), cleanData, { merge: true });
      }
      await batch.commit();
      setToastMessage(`ဟင်းလျာ (${updatedDishes.length}) ခုလုံး၏ ပြင်ဆင်ချက်များကို သိမ်းဆည်းပြီးပါပြီ`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menuItems');
      throw err;
    }
  };

  // Delete dish from Firestore
  const handleDeleteDish = async (dishId: string) => {
    try {
      await deleteDoc(doc(db, 'menuItems', dishId));
      setMenuItems((prev) => prev.filter((item) => item.id !== dishId));
      setCartItems((prev) => prev.filter((item) => item.itemId !== dishId));
      setToastMessage('ဟင်းလျာကို အောင်မြင်စွာ ဖျက်လိုက်ပါပြီ');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2400);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menuItems/${dishId}`);
      throw err;
    }
  };

  // Total quantity of items in cart
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (dish: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.itemId === dish.id);
      if (existing) {
        return prev.map((item) =>
          item.itemId === dish.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [
        ...prev,
        {
          itemId: dish.id,
          name: dish.name,
          price: dish.price,
          quantity: 1,
          emoji: dish.emoji,
          imageUrl: dish.imageUrl,
        },
      ];
    });

    setToastMessage(`${dish.emoji} ${dish.name} ကို ခြင်းထဲထည့်လိုက်ပါပြီ`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const handleUpdateQuantity = (itemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.itemId === itemId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId));
  };

  const handleClearCart = () => setCartItems([]);

  const handleOrderSuccess = (orderSummary: string, lineUrl: string) => {
    const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setLastOrderedItems([...cartItems]);
    setLastOrderTotal(totalAmount);
    setLastSummary(orderSummary);
    setLastLineUrl(lineUrl);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
    setShowSuccessModal(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9] text-[#2D241E] font-sans relative">
      {/* Sticky Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        isAdmin={isAdmin}
        onToggleAdmin={() => {
          setAdminPanelTab('all');
          setIsAdminPanelOpen(true);
        }}
        onOpenLogin={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        <Hero />
        <MenuSection
          items={menuItems}
          isLoading={loadingMenu}
          onAddToCart={handleAddToCart}
          isAdmin={isAdmin}
          onEditDish={(dish) => {
            setEditingDish(dish);
            setIsEditModalOpen(true);
          }}
          onAddNewDish={() => {
            setAdminPanelTab('single');
            setIsAdminPanelOpen(true);
          }}
          onEditAllMenu={() => {
            setAdminPanelTab('all');
            setIsAdminPanelOpen(true);
          }}
          onSeedDishes={handleSeedDishes}
        />
        <AboutSection />
        <ContactSection />
      </main>

      {/* Footer with small Admin Link */}
      <Footer
        isAdmin={isAdmin}
        onOpenAdminLogin={() => {
          if (isAdmin) {
            setAdminPanelTab('all');
            setIsAdminPanelOpen(true);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
      />

      {/* Cart Panel & Checkout Modals */}
      <CartPanel
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onCheckout={() => {
          if (cartItems.length > 0) setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderSuccess={handleOrderSuccess}
      />

      <OrderSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        items={lastOrderedItems}
        totalAmount={lastOrderTotal}
        lineUrl={lastLineUrl}
        orderSummary={lastSummary}
      />

      {/* Admin Panel Drawer */}
      <AdminPanel
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        items={menuItems}
        initialTab={adminPanelTab}
        onAddDish={handleAddDish}
        onEditDish={(dish) => {
          setEditingDish(dish);
          setIsEditModalOpen(true);
        }}
        onSaveDish={handleSaveDish}
        onSaveAllDishes={handleSaveAllDishes}
        onDeleteDish={handleDeleteDish}
        onSeedDishes={handleSeedDishes}
      />

      {/* Admin Quick Edit Modal */}
      <AdminEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDish(null);
        }}
        dish={editingDish}
        allDishes={menuItems}
        onSelectDish={(dish) => setEditingDish(dish)}
        onSaveDish={handleSaveDish}
        onDeleteDish={handleDeleteDish}
      />

      {/* Admin Login Modal (Firebase Auth) */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => setIsAdminPanelOpen(true)}
      />

      {/* Floating Cart Pill */}
      {totalCartCount > 0 && !isCartOpen && !isCheckoutOpen && (
        <aside aria-label="အမြန်ခြင်းတောင်း" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-amber-900 text-amber-50 shadow-2xl border border-amber-600/40 hover:bg-amber-800 active:scale-95 transition-all text-xs sm:text-sm font-bold cursor-pointer"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span className="absolute -top-1 -right-2 w-4 h-4 bg-amber-500 text-amber-950 rounded-full text-[10px] font-black flex items-center justify-center">
                {totalCartCount}
              </span>
            </div>
            <span>ခြင်းတောင်း ကြည့်ရန်</span>
            <span className="bg-amber-800/80 px-2 py-0.5 rounded-full text-amber-200 text-xs">
              {cartItems.reduce((s, i) => s + i.price * i.quantity, 0).toLocaleString()} ကျပ်
            </span>
          </button>
        </aside>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-amber-950 text-amber-100 px-4 py-2.5 rounded-2xl shadow-xl border border-amber-800/60 flex items-center gap-2.5 text-xs font-semibold animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
