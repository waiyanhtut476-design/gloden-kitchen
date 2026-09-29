import React, { useState } from 'react';
import { UtensilsCrossed, ShoppingBag, Menu as MenuIcon, X, Clock, MapPin, Shield, ShieldAlert } from 'lucide-react';

interface HeaderProps {
  cartCount: number;
  onOpenCart?: () => void;
  onOpenCartHint?: () => void;
  isAdmin?: boolean;
  onToggleAdmin?: () => void;
  onOpenLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartCount,
  onOpenCart,
  onOpenCartHint,
  isAdmin,
  onToggleAdmin,
  onOpenLogin,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const handleCartClick = onOpenCart || onOpenCartHint;

  const navLinks = [
    { label: 'ဟင်းလျာများ', href: '#menu', en: 'Menu' },
    { label: 'ဆိုင်အကြောင်း', href: '#about', en: 'About' },
    { label: 'ဆက်သွယ်ရန်', href: '#contact', en: 'Contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#FFFDF9] border-b border-amber-900/10 shadow-xs transition-all">
      {/* Top micro bar for opening hours & address */}
      <div className="bg-amber-950 text-amber-100 text-xs py-1.5 px-4 hidden sm:block">
        <div className="max-w-6xl mx-auto flex justify-between items-center tracking-wide font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-amber-200">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>ဖွင့်ချိန်: နေ့စဉ် 10:00 AM – 9:00 PM</span>
            </span>
            <span className="text-amber-400/50">|</span>
            <span className="flex items-center gap-1.5 text-amber-200">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>မြန်မာ့ရိုးရာ နှင့် မွန်ဒေသထွက် အစားအစာစစ်စစ်</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {!isAdmin && onOpenLogin && (
              <button
                onClick={onOpenLogin}
                type="button"
                className="text-amber-300 hover:text-amber-100 underline text-[11px] cursor-pointer"
              >
                Admin Login
              </button>
            )}
            <span className="text-amber-300 font-semibold">ကြိုဆိုပါ၏ • Welcome</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-amber-500 via-amber-600 to-amber-800 flex items-center justify-center text-white shadow-md shadow-amber-900/20 ring-2 ring-amber-400/40 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-amber-100" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-amber-950 font-serif block leading-tight">
                Golden Monstate Kitchen
              </span>
              <span className="text-[11px] sm:text-xs font-semibold tracking-wider text-amber-700 block">
                မြန်မာ့ရိုးရာအစားအစာ
              </span>
            </div>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 shrink-0">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-amber-900 hover:text-amber-600 font-medium text-sm transition-colors relative py-1 whitespace-nowrap inline-flex items-center gap-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-amber-600 hover:after:w-full after:transition-all"
              >
                <span className="whitespace-nowrap">{link.label}</span>
                <span className="text-xs text-amber-950/50 font-sans whitespace-nowrap">({link.en})</span>
              </a>
            ))}
          </nav>

          {/* Action buttons: Admin Mode, Cart Icon & Mobile Menu Toggle */}
          <div className="flex items-center gap-2">
            {/* Admin Panel Button (Shown only when authenticated) */}
            {isAdmin ? (
              <button
                onClick={onToggleAdmin}
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border bg-amber-900 text-amber-100 border-amber-950 shadow-xs ring-2 ring-amber-400 cursor-pointer"
                title="Admin Management Panel"
              >
                <Shield className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Admin Panel</span>
              </button>
            ) : onOpenLogin ? (
              <button
                onClick={onOpenLogin}
                type="button"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-stone-600 hover:text-amber-900 hover:bg-amber-50 border border-stone-200 transition-all cursor-pointer"
                title="Admin Login"
              >
                <Shield className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline text-[11px]">Admin</span>
              </button>
            ) : null}

            {/* Cart Button */}
            <button
              onClick={handleCartClick}
              type="button"
              className="relative p-2.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors flex items-center justify-center cursor-pointer"
              title="ခြင်းတောင်း (Cart)"
              aria-label="ခြင်းတောင်း"
            >
              <ShoppingBag className="w-5 h-5 text-amber-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-xs animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="md:hidden p-2 rounded-lg text-amber-900 hover:bg-amber-100 focus:outline-hidden"
              aria-label="ဖွင့်ရန်"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown nav */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-amber-900/10 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between px-3 py-1.5 bg-amber-50 rounded-lg text-xs text-amber-800 font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>ဖွင့်ချိန်: နေ့စဉ် 10:00 AM – 9:00 PM</span>
              </span>
              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onToggleAdmin?.();
                  }}
                  className="text-[11px] font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full cursor-pointer"
                >
                  Admin Panel
                </button>
              )}
            </div>
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 rounded-lg text-amber-950 font-medium hover:bg-amber-100/70 transition-colors"
              >
                <span className="text-base">{link.label}</span>
                <span className="text-xs text-amber-600 uppercase tracking-wider">{link.en}</span>
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};
