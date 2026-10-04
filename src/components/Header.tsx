import React, { useState } from 'react';
import {
  Store,
  Phone,
  MapPin,
  PlusCircle,
  LayoutDashboard,
  Receipt,
  Package,
  BookOpen,
  Settings,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeaderProps {
  currentTab: 'dashboard' | 'billing' | 'inventory' | 'ledger';
  setCurrentTab: (tab: 'dashboard' | 'billing' | 'inventory' | 'ledger') => void;
  onOpenNewBill: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewBill,
  onOpenSettings,
}) => {
  const { storeInfo, products, customerDues } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  const totalDuePending = customerDues.reduce((sum, c) => sum + c.totalDue, 0);

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing' as const, label: 'Billing & POS', icon: Receipt },
    {
      id: 'inventory' as const,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : undefined,
    },
    {
      id: 'ledger' as const,
      label: 'Ledger & Khata',
      icon: BookOpen,
      badge: totalDuePending > 0 ? `₹${totalDuePending.toLocaleString()}` : undefined,
    },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-30 shadow-md no-print">
      {/* Top Banner with Store Details */}
      <div className="border-b border-slate-800/80 bg-slate-950/60 px-4 py-1.5 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block"></span>
              Proprietor: <span className="text-amber-300 font-semibold">{storeInfo.ownerName}</span>
            </span>
            <span className="hidden sm:inline-block text-slate-600">|</span>
            <a
              href={`tel:${storeInfo.mobile}`}
              className="flex items-center gap-1 text-slate-300 hover:text-amber-300 transition-colors"
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>{storeInfo.mobile}</span>
            </a>
            <span className="hidden md:inline-block text-slate-600">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-400 truncate max-w-md">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">{storeInfo.address}</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 ml-auto sm:ml-0">
            <span className="text-[11px] text-amber-400/90 font-mono font-medium">
              Jehanabad, Bihar
            </span>
            <button
              onClick={onOpenSettings}
              className="hover:text-slate-200 p-1 rounded hover:bg-slate-800 transition-colors"
              title="Store Settings & Backup"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 font-bold shadow-inner shrink-0">
            <span className="font-display text-lg tracking-wider">RF</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5">
                {storeInfo.storeName}
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {storeInfo.subTitle}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Accounting & Inventory Management Suite
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-slate-950 text-amber-300'
                        : item.id === 'inventory'
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40'
                        : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenNewBill}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs sm:text-sm transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="whitespace-nowrap">New Bill (POS)</span>
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 px-4 py-3 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-mono font-bold ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-amber-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
