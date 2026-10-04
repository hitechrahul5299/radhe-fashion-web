import React, { useState } from 'react';
import { StoreProvider } from './context/StoreContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DashboardView } from './components/DashboardView';
import { POSBillingView } from './components/POSBillingView';
import { InventoryView } from './components/InventoryView';
import { LedgerAccountingView } from './components/LedgerAccountingView';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { MobileNavigation } from './components/MobileNavigation';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'billing' | 'inventory' | 'ledger'>(
    'dashboard'
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <StoreProvider>
      <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950 pb-16 lg:pb-0">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenNewBill={() => setCurrentTab('billing')}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              onNavigateToPOS={() => setCurrentTab('billing')}
              onNavigateToInventory={() => setCurrentTab('inventory')}
              onNavigateToLedger={() => setCurrentTab('ledger')}
            />
          )}

          {currentTab === 'billing' && <POSBillingView />}

          {currentTab === 'inventory' && <InventoryView />}

          {currentTab === 'ledger' && <LedgerAccountingView />}
        </main>

        {/* Store Settings & Backup Modal */}
        <StoreSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />

        {/* Bottom Navigation for Mobile Touch */}
        <MobileNavigation
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
        />

        {/* Business Details Footer */}
        <Footer />
      </div>
    </StoreProvider>
  );
}
