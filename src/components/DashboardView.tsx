import React, { useState } from 'react';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  PlusCircle,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  CreditCard,
  Banknote,
  Eye,
  CheckCircle,
  Plus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Invoice } from '../types';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';

interface DashboardViewProps {
  onNavigateToPOS: () => void;
  onNavigateToInventory: () => void;
  onNavigateToLedger: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateToPOS,
  onNavigateToInventory,
  onNavigateToLedger,
}) => {
  const { storeInfo, products, invoices, ledger, customerDues, adjustStock } = useStore();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Time boundaries for Today
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  // Today's invoices
  const todayInvoices = invoices.filter(
    (inv) => new Date(inv.date).getTime() >= todayStart
  );

  // Total Daily Sales (from today's invoices)
  const totalDailySales = todayInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalDailyCashCollected = todayInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  const totalDailyDueGenerated = todayInvoices.reduce((sum, inv) => sum + inv.dueAmount, 0);

  // Today's Gross Profit (Selling Price - Purchase Price on sold items)
  const todayGrossProfit = todayInvoices.reduce((sum, inv) => {
    const profitOnInvoice = inv.items.reduce(
      (itemSum, item) => itemSum + (item.unitPrice - item.purchasePrice) * item.quantity,
      0
    );
    return sum + (profitOnInvoice - inv.discount);
  }, 0);

  // Total Stock Available
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);

  // Low Stock Alerts (Stock <= minStockAlert)
  const lowStockItems = products.filter(
    (p) => p.stockQuantity <= p.minStockAlert
  );

  // Customer Due / Khata
  const totalPendingDue = customerDues.reduce((sum, c) => sum + c.totalDue, 0);

  // Category Distribution: Jeans, T-shirt, Shirt, Trouser
  const categories = ['Jeans', 'T-shirt', 'Shirt', 'Trouser'] as const;
  const categoryStats = categories.map((cat) => {
    const prods = products.filter((p) => p.category === cat);
    const count = prods.reduce((sum, p) => sum + p.stockQuantity, 0);
    const size28 = prods.filter((p) => p.size === '28').reduce((s, p) => s + p.stockQuantity, 0);
    const size30 = prods.filter((p) => p.size === '30').reduce((s, p) => s + p.stockQuantity, 0);
    const size32 = prods.filter((p) => p.size === '32').reduce((s, p) => s + p.stockQuantity, 0);
    return {
      category: cat,
      count,
      size28,
      size30,
      size32,
    };
  });

  // Today's Expenses
  const todayExpenses = ledger
    .filter((e) => e.type === 'expense' && new Date(e.date).getTime() >= todayStart)
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-widest font-semibold text-amber-400">
              Retail Control Center
            </span>
            <span className="text-slate-500">·</span>
            <span className="text-xs text-slate-300">
              {now.toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
            Welcome back, {storeInfo.ownerName}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {storeInfo.storeName} ({storeInfo.subTitle}) · {storeInfo.address}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={onNavigateToPOS}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Customer Bill</span>
          </button>
          <button
            onClick={onNavigateToInventory}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs sm:text-sm border border-slate-700 transition-colors cursor-pointer"
          >
            <Package className="w-4 h-4" />
            <span>Manage Stock</span>
          </button>
        </div>
      </div>

      {/* CORE 3 METRIC CARDS REQUIRED BY PROMPT (+ 1 FINANCIAL) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Daily Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Daily Sales</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-950 tabular-nums">
              ₹{totalDailySales.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-700 font-medium">
              <span>{todayInvoices.length} bills generated today</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Gross Margin:</span>
            <span className="font-mono font-semibold text-emerald-700 tabular-nums">
              +₹{todayGrossProfit.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 2. Total Stock Available */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Total Stock Available</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-slate-950 tabular-nums">
              {totalStockCount.toLocaleString()}{' '}
              <span className="text-sm font-normal text-slate-500">pcs</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
              <span>Across 4 core categories (28", 30", 32")</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Asset Valuation:</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              ₹{totalInventoryCost.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 3. Low Stock Alerts */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Low Stock Alerts</span>
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  lowStockItems.length > 0
                    ? 'bg-amber-100 text-amber-700 animate-pulse'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-bold font-mono tabular-nums ${
                lowStockItems.length > 0 ? 'text-amber-600' : 'text-emerald-700'
              }`}
            >
              {lowStockItems.length}{' '}
              <span className="text-sm font-normal text-slate-500">items</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
              <span>
                {lowStockItems.length > 0
                  ? 'Urgent replenishment needed (≤ 5 pcs)'
                  : 'All garments adequately stocked'}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Action:</span>
            <button
              onClick={onNavigateToInventory}
              className="text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>View items</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 4. Customer Due / Khata Ledger */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div>
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
              <span>Pending Customer Dues</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl sm:text-3xl font-bold font-mono text-rose-600 tabular-nums">
              ₹{totalPendingDue.toLocaleString()}
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-600">
              <span>Market credit outstanding (Khata)</span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Shop Khata:</span>
            <button
              onClick={onNavigateToLedger}
              className="text-slate-900 hover:text-amber-600 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Open Ledger</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Category Stock & Low Stock Items */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Category Stock & Size Visualizer (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Breakdown Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  Stock by Category & Sizes (28", 30", 32")
                </h3>
                <p className="text-xs text-slate-500">
                  Live distribution across core men's fashion inventory
                </p>
              </div>
              <button
                onClick={onNavigateToInventory}
                className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-4 pt-1">
              {categoryStats.map((item) => {
                const pct = totalStockCount > 0 ? (item.count / totalStockCount) * 100 : 0;
                return (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800">{item.category}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          ({item.count} pieces · {pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">28": {item.size28}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">30": {item.size30}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">32": {item.size32}</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-900 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(6, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Today's Sales Activity Feed */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Today's Store Sales Feed</h3>
                <p className="text-xs text-slate-500">{todayInvoices.length} invoices generated today</p>
              </div>
              <button
                onClick={onNavigateToPOS}
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>+ New Bill</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
              {todayInvoices.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-1" />
                  <p className="text-xs font-medium text-slate-600">No sales made yet today</p>
                  <p className="text-[11px] text-slate-400">Click 'New Customer Bill' to start POS billing</p>
                </div>
              ) : (
                todayInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                        {inv.paymentMethod === 'UPI' ? 'UPI' : 'CASH'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">{inv.id}</span>
                          <span className="text-[11px] text-slate-500">· {inv.customerName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {inv.items.length} items ({inv.items.map((i) => `${i.category} ${i.size}"`).join(', ')})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-bold text-xs text-slate-900 tabular-nums">
                          ₹{inv.grandTotal.toLocaleString()}
                        </p>
                        {inv.dueAmount > 0 ? (
                          <span className="text-[10px] text-rose-600 font-semibold">
                            Due: ₹{inv.dueAmount}
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-medium">Fully Paid</span>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        title="View / Print Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Low Stock Alerts & Fast Replenish (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock Alerts Action Box */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-amber-100 text-amber-800 flex items-center justify-center">
                  <AlertTriangle className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-sm text-slate-900">Low Stock Notice</h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {lowStockItems.length} items low
              </span>
            </div>

            <p className="text-xs text-slate-500">
              The following garment sizes are running low in the Jehanabad shop. Order or restock quickly:
            </p>

            <div className="divide-y divide-slate-100 space-y-1">
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                  <p className="text-xs font-semibold text-slate-700">Healthy Stock Levels</p>
                  <p className="text-[11px] text-slate-400">All garments above safety threshold</p>
                </div>
              ) : (
                lowStockItems.map((prod) => (
                  <div
                    key={prod.id}
                    className="py-2.5 flex items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-slate-900 line-clamp-1">{prod.title}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono text-slate-600 font-bold">{prod.id}</span>
                        <span>·</span>
                        <span className="font-semibold text-slate-700">{prod.category}</span>
                        <span>·</span>
                        <span className="bg-slate-100 px-1 rounded font-bold font-mono">
                          {prod.size}"
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                        {prod.stockQuantity} left
                      </span>
                      <button
                        onClick={() => adjustStock(prod.id, 5)}
                        className="flex items-center gap-0.5 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-300 font-semibold text-[11px] transition-colors cursor-pointer"
                        title="Quick add +5 stock"
                      >
                        <Plus className="w-3 h-3" />
                        <span>+5</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Cash Flow Reconciliation */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-amber-400" />
                <span>Today's Counter Summary</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Rahul Kumar</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Direct Sales Revenue:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-400">
                  ₹{totalDailySales.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Cash/UPI Collected Today:</span>
                <span className="font-mono tabular-nums font-bold text-white">
                  ₹{totalDailyCashCollected.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Credit Given (Customer Due):</span>
                <span className="font-mono tabular-nums font-bold text-rose-400">
                  ₹{totalDailyDueGenerated.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800 text-slate-300">
                <span>Today's Store Expenses:</span>
                <span className="font-mono tabular-nums font-bold text-amber-400">
                  -₹{todayExpenses.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-bold text-white">
                <span>Net Cash in Hand / Drawer:</span>
                <span className="font-mono tabular-nums text-amber-300">
                  ₹{Math.max(0, totalDailyCashCollected - todayExpenses).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Invoice Modal */}
      {selectedInvoice && (
        <PrintableInvoiceModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}
    </div>
  );
};
