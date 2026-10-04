import React from 'react';
import { LayoutDashboard, Receipt, Package, BookOpen } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface MobileNavigationProps {
  currentTab: 'dashboard' | 'billing' | 'inventory' | 'ledger';
  setCurrentTab: (tab: 'dashboard' | 'billing' | 'inventory' | 'ledger') => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentTab,
  setCurrentTab,
}) => {
  const { products, customerDues } = useStore();

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockAlert).length;
  const pendingDue = customerDues.reduce((s, c) => s + c.totalDue, 0);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'billing' as const, label: 'POS Billing', icon: Receipt },
    {
      id: 'inventory' as const,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'ledger' as const,
      label: 'Ledger',
      icon: BookOpen,
      badge: pendingDue > 0 ? 'Due' : undefined,
      badgeColor: 'bg-amber-500',
    },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900 border-t border-slate-800 px-2 py-1.5 shadow-lg no-print">
      <div className="grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative cursor-pointer min-h-[44px] ${
                isActive
                  ? 'text-amber-400 bg-slate-800/80 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-2.5 text-[9px] text-white font-mono font-bold px-1 rounded-full ${
                      tab.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 truncate w-full text-center">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
