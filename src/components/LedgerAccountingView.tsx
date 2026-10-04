import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Users,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  X,
  CreditCard,
  Banknote,
  Search,
} from 'lucide-react';
import { LedgerEntry, LedgerType, CustomerDueRecord, ExpenseCategory } from '../types';
import { useStore } from '../context/StoreContext';

export const LedgerAccountingView: React.FC = () => {
  const { ledger, addLedgerEntry, deleteLedgerEntry, customerDues, recordDuePayment, storeInfo } =
    useStore();

  const [activeTab, setActiveTab] = useState<'ledger' | 'khata'>('ledger');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'all'>(
    'today'
  );
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [khataSearch, setKhataSearch] = useState('');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [repaymentCustomer, setRepaymentCustomer] = useState<CustomerDueRecord | null>(null);

  // Form states for Expense
  const [expenseCategory, setExpenseCategory] = useState<ExpenseCategory>('Tea & Refreshment');
  const [expenseAmount, setExpenseAmount] = useState<number>(100);
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaymentMethod, setExpensePaymentMethod] = useState<'Cash' | 'UPI'>('Cash');

  // Form states for Manual Income
  const [incomeCategory, setIncomeCategory] = useState('Sales');
  const [incomeAmount, setIncomeAmount] = useState<number>(500);
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeCustomerName, setIncomeCustomerName] = useState('');
  const [incomePaymentMethod, setIncomePaymentMethod] = useState<'Cash' | 'UPI'>('Cash');

  // Form state for Customer Due Repayment
  const [repayAmount, setRepayAmount] = useState<number>(0);
  const [repayMethod, setRepayMethod] = useState<'Cash' | 'UPI'>('Cash');
  const [repayNotes, setRepayNotes] = useState('');

  // Date helpers
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 7 * 86400000;
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();

  // Filter ledger entries
  const filteredLedger = ledger.filter((entry) => {
    const entryTime = new Date(entry.date).getTime();

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = entryTime >= todayStart;
    } else if (dateFilter === 'yesterday') {
      matchesDate = entryTime >= yesterdayStart && entryTime < todayStart;
    } else if (dateFilter === 'week') {
      matchesDate = entryTime >= weekStart;
    } else if (dateFilter === 'month') {
      matchesDate = entryTime >= monthStart;
    }

    const matchesType = typeFilter === 'all' || entry.type === typeFilter;
    return matchesDate && matchesType;
  });

  // Calculate metrics for selected date range
  const totalIncome = filteredLedger
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = filteredLedger
    .filter((e) => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Khata metrics
  const totalPendingDue = customerDues.reduce((sum, c) => sum + c.totalDue, 0);
  const customersWithDueCount = customerDues.filter((c) => c.totalDue > 0).length;

  // Filter customer khata
  const filteredKhata = customerDues.filter((c) => {
    const q = khataSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      c.customerName.toLowerCase().includes(q) ||
      (c.customerPhone && c.customerPhone.includes(q))
    );
  });

  // Handlers
  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (expenseAmount <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }
    addLedgerEntry({
      type: 'expense',
      category: expenseCategory,
      amount: Number(expenseAmount),
      description: expenseDesc.trim() || `${expenseCategory} expense`,
      paymentMethod: expensePaymentMethod,
    });
    setExpenseDesc('');
    setIsExpenseModalOpen(false);
  };

  const handleAddIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (incomeAmount <= 0) {
      alert('Please enter a valid income amount.');
      return;
    }
    addLedgerEntry({
      type: 'income',
      category: incomeCategory,
      amount: Number(incomeAmount),
      description: incomeDesc.trim() || 'Manual Store Cash / Income Entry',
      paymentMethod: incomePaymentMethod,
      customerName: incomeCustomerName.trim() || undefined,
    });
    setIncomeDesc('');
    setIncomeCustomerName('');
    setIsIncomeModalOpen(false);
  };

  const handleOpenRepayment = (cust: CustomerDueRecord) => {
    setRepaymentCustomer(cust);
    setRepayAmount(cust.totalDue);
    setRepayMethod('Cash');
    setRepayNotes(`Payment towards outstanding balance by ${cust.customerName}`);
  };

  const handleSaveRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentCustomer) return;
    if (repayAmount <= 0 || repayAmount > repaymentCustomer.totalDue) {
      alert(`Please enter an amount between ₹1 and ₹${repaymentCustomer.totalDue}`);
      return;
    }

    recordDuePayment(
      repaymentCustomer.customerPhone || repaymentCustomer.customerName,
      Number(repayAmount),
      repayMethod,
      repayNotes
    );
    setRepaymentCustomer(null);
  };

  // WhatsApp Reminder message generator
  const sendWhatsAppReminder = (cust: CustomerDueRecord) => {
    const message = `Namaskar ${cust.customerName} ji,\n\nRadhe Fashion (Male Fashion), Ambedkar Chowk, Jehanabad se Rahul Kumar bol rahe hain.\n\nAapke account par ₹${cust.totalDue.toLocaleString()} ka baaki balance (Due) pending hai. Kripya shop par aakar ya UPI dwara payment clear karein.\n\n*UPI ID:* ${storeInfo.upiId}\n*Mobile:* ${storeInfo.mobile}\n\nDhanyawad! Visit again.`;

    if (cust.customerPhone) {
      // Standard whatsapp link with phone
      const phoneDigits = cust.customerPhone.replace(/\D/g, '');
      const fullPhone = phoneDigits.length === 10 ? `91${phoneDigits}` : phoneDigits;
      const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    } else {
      navigator.clipboard.writeText(message);
      alert('Reminder message copied to clipboard! (No phone number recorded)');
    }
  };

  // Export Ledger CSV
  const exportLedgerCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)', 'Payment Mode', 'Customer'];
    const rows = filteredLedger.map((e) => [
      `"${new Date(e.date).toLocaleString('en-IN')}"`,
      `"${e.type.toUpperCase()}"`,
      `"${e.category}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.paymentMethod}"`,
      `"${e.customerName || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Radhe_Fashion_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher: Daily Ledger vs Khata Book */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Daily Ledger (Income & Expense)</span>
          </button>
          <button
            onClick={() => setActiveTab('khata')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'khata'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Customer Due / Khata Book</span>
            {totalPendingDue > 0 && (
              <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full">
                ₹{totalPendingDue.toLocaleString()}
              </span>
            )}
          </button>
        </div>

        {activeTab === 'ledger' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsIncomeModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Record Income</span>
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition-colors cursor-pointer border border-rose-200"
            >
              <Plus className="w-3.5 h-3.5 text-rose-600" />
              <span>+ Record Expense</span>
            </button>
          </div>
        )}
      </div>

      {activeTab === 'ledger' ? (
        /* DAILY LEDGER VIEW */
        <div className="space-y-4">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Income (Sales & Cash)
                </span>
                <p className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
                  +₹{totalIncome.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">
                  {filteredLedger.filter((e) => e.type === 'income').length} income records
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Shop Expenses
                </span>
                <p className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
                  -₹{totalExpense.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">
                  {filteredLedger.filter((e) => e.type === 'expense').length} expense records
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Net Balance / Cash Flow
                </span>
                <p
                  className={`text-xl font-bold font-mono mt-1 tabular-nums ${
                    netBalance >= 0 ? 'text-slate-900' : 'text-rose-600'
                  }`}
                >
                  ₹{netBalance.toLocaleString()}
                </p>
                <span className="text-[10px] text-slate-400">
                  Income minus expenses for selected period
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Ledger Filter Bar */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Date Range Selector */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-500 text-[11px]">Period:</span>
              {[
                { id: 'today', label: 'Today' },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'week', label: 'Last 7 Days' },
                { id: 'month', label: 'This Month' },
                { id: 'all', label: 'All Time' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setDateFilter(item.id as any)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    dateFilter === item.id
                      ? 'bg-slate-900 text-white font-semibold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Type Filter & Export */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-slate-500 text-[11px]">Type:</span>
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    typeFilter === 'all'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    typeFilter === 'income'
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  Income
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                    typeFilter === 'expense'
                      ? 'bg-rose-600 text-white font-semibold'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  Expense
                </button>
              </div>

              <button
                onClick={exportLedgerCSV}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title="Export Ledger"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Description / Reference</th>
                    <th className="py-3 px-4 text-center">Mode</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLedger.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No ledger entries for this period</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          New sales invoices automatically register here. You can also record expenses manually.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredLedger.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {new Date(entry.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          · {new Date(entry.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 font-semibold text-[11px] px-2 py-0.5 rounded ${
                              entry.type === 'income'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {entry.type === 'income' ? '+ Income' : '- Expense'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800 whitespace-nowrap">
                          {entry.category}
                        </td>
                        <td className="py-3 px-4 text-slate-700">
                          <div>{entry.description}</div>
                          {entry.customerName && (
                            <span className="text-[10px] text-slate-500">
                              Customer: {entry.customerName}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 font-medium">
                            {entry.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          <span
                            className={
                              entry.type === 'income' ? 'text-emerald-700' : 'text-rose-600'
                            }
                          >
                            {entry.type === 'income' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteLedgerEntry(entry.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* CUSTOMER DUE / KHATA BOOK VIEW */
        <div className="space-y-4">
          {/* Khata Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Total Outstanding Dues
              </span>
              <p className="text-xl font-bold font-mono text-rose-600 mt-1 tabular-nums">
                ₹{totalPendingDue.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400">Total customer credit in market</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Active Khata Accounts
              </span>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {customersWithDueCount} <span className="text-xs font-normal text-slate-500">pending</span>
              </p>
              <span className="text-[10px] text-slate-400">Customers with positive balance</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Store UPI for Recovery
              </span>
              <p className="text-sm font-bold font-mono text-amber-700 mt-1">{storeInfo.upiId}</p>
              <span className="text-[10px] text-slate-400">Direct recovery to Rahul Kumar's UPI</span>
            </div>
          </div>

          {/* Search Bar for Khata */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search khata by customer name or phone..."
                value={khataSearch}
                onChange={(e) => setKhataSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {filteredKhata.length} customer records
            </p>
          </div>

          {/* Customer Khata Cards / Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Mobile Number</th>
                    <th className="py-3 px-4">Last Activity</th>
                    <th className="py-3 px-4">Bills Associated</th>
                    <th className="py-3 px-4 text-right">Total Due Balance</th>
                    <th className="py-3 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKhata.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400">
                        <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-700">No customer credit dues recorded</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          When you create a bill with payment mode 'Due/Credit', it automatically appears here.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredKhata.map((cust, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {cust.customerName}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {cust.customerPhone ? `+91 ${cust.customerPhone}` : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(cust.lastUpdated).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {cust.invoiceIds.map((invId) => (
                              <span
                                key={invId}
                                className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded"
                              >
                                {invId}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                          {cust.totalDue > 0 ? (
                            <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold">
                              ₹{cust.totalDue.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold">Cleared (₹0)</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {cust.totalDue > 0 && (
                              <>
                                <button
                                  onClick={() => handleOpenRepayment(cust)}
                                  className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-[11px] transition-colors shadow-2xs cursor-pointer"
                                  title="Receive Payment"
                                >
                                  Pay Due
                                </button>
                                <button
                                  onClick={() => sendWhatsAppReminder(cust)}
                                  className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                                  title="Send WhatsApp Reminder"
                                >
                                  <MessageSquare className="w-3 h-3" />
                                  <span>WhatsApp</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD EXPENSE MODAL */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Store Expense</h3>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="p-5 space-y-4 text-xs">
              <div>
                <label htmlFor="expense-category-select" className="block font-semibold text-slate-700 mb-1">
                  Expense Category *
                </label>
                <select
                  id="expense-category-select"
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Tea & Refreshment">Tea & Refreshment (Staff/Customer)</option>
                  <option value="Shop Rent">Shop Rent</option>
                  <option value="Electricity Bill">Electricity Bill</option>
                  <option value="Staff Salary">Staff Salary</option>
                  <option value="Transport & Freight">Transport & Freight (Goods Inward)</option>
                  <option value="Supplier / Wholesale Purchase">
                    Supplier / Wholesale Stock Purchase
                  </option>
                  <option value="Shop Maintenance">Shop Maintenance & Fixtures</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>

              <div>
                <label htmlFor="expense-amount-input" className="block font-semibold text-slate-700 mb-1">
                  Amount Spent (₹) *
                </label>
                <input
                  id="expense-amount-input"
                  type="number"
                  min="1"
                  required
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-rose-700 text-sm"
                />
              </div>

              <div>
                <label htmlFor="expense-desc-input" className="block font-semibold text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  id="expense-desc-input"
                  type="text"
                  placeholder="e.g. Monthly rent to landlord, or Chai & samosa for afternoon"
                  value={expenseDesc}
                  onChange={(e) => setExpenseDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <span className="block font-semibold text-slate-700 mb-1">Payment Mode</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="expenseMode"
                      checked={expensePaymentMethod === 'Cash'}
                      onChange={() => setExpensePaymentMethod('Cash')}
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="expenseMode"
                      checked={expensePaymentMethod === 'UPI'}
                      onChange={() => setExpensePaymentMethod('UPI')}
                    />
                    <span>UPI / Online</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD INCOME MODAL */}
      {isIncomeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">Record Manual Cash / Other Income</h3>
              <button
                onClick={() => setIsIncomeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddIncome} className="p-5 space-y-4 text-xs">
              <div>
                <label htmlFor="income-category-select" className="block font-semibold text-slate-700 mb-1">
                  Income Category *
                </label>
                <select
                  id="income-category-select"
                  value={incomeCategory}
                  onChange={(e) => setIncomeCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="Sales">Direct Counter Sales</option>
                  <option value="Tailoring / Alteration">Tailoring / Alteration Charges</option>
                  <option value="Customer Due Repayment">Customer Due Repayment</option>
                  <option value="Miscellaneous">Other Income / Cashback</option>
                </select>
              </div>

              <div>
                <label htmlFor="income-amount-input" className="block font-semibold text-slate-700 mb-1">
                  Amount Received (₹) *
                </label>
                <input
                  id="income-amount-input"
                  type="number"
                  min="1"
                  required
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-emerald-700 text-sm"
                />
              </div>

              <div>
                <label htmlFor="income-desc-input" className="block font-semibold text-slate-700 mb-1">
                  Description / Note
                </label>
                <input
                  id="income-desc-input"
                  type="text"
                  placeholder="e.g. Alteration fee for 2 trousers"
                  value={incomeDesc}
                  onChange={(e) => setIncomeDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label htmlFor="income-customer-name" className="block font-semibold text-slate-700 mb-1">
                  Customer / Source Name (optional)
                </label>
                <input
                  id="income-customer-name"
                  type="text"
                  placeholder="e.g. Ramesh Singh"
                  value={incomeCustomerName}
                  onChange={(e) => setIncomeCustomerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <span className="block font-semibold text-slate-700 mb-1">Payment Mode</span>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="incomeMode"
                      checked={incomePaymentMethod === 'Cash'}
                      onChange={() => setIncomePaymentMethod('Cash')}
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="incomeMode"
                      checked={incomePaymentMethod === 'UPI'}
                      onChange={() => setIncomePaymentMethod('UPI')}
                    />
                    <span>UPI / Online</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIncomeModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Save Income
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECORD REPAYMENT MODAL */}
      {repaymentCustomer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                Receive Due Repayment from {repaymentCustomer.customerName}
              </h3>
              <button
                onClick={() => setRepaymentCustomer(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveRepayment} className="p-5 space-y-4 text-xs">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex justify-between items-center">
                <div>
                  <span className="text-[11px] text-amber-800 font-medium">Current Balance Due:</span>
                  <p className="font-mono text-lg font-bold text-amber-950">
                    ₹{repaymentCustomer.totalDue.toLocaleString()}
                  </p>
                </div>
                {repaymentCustomer.customerPhone && (
                  <span className="text-xs font-mono text-amber-900 bg-amber-100 px-2 py-1 rounded">
                    +91 {repaymentCustomer.customerPhone}
                  </span>
                )}
              </div>

              <div>
                <label htmlFor="repayment-amount-input" className="block font-semibold text-slate-700 mb-1">
                  Repayment Amount Received (₹) *
                </label>
                <input
                  id="repayment-amount-input"
                  type="number"
                  min="1"
                  max={repaymentCustomer.totalDue}
                  required
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-emerald-800 text-base"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Remaining balance after payment: ₹
                  {Math.max(0, repaymentCustomer.totalDue - repayAmount).toLocaleString()}
                </span>
              </div>

              <div>
                <span className="block font-semibold text-slate-700 mb-1">Payment Method</span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="repayMethod"
                      checked={repayMethod === 'Cash'}
                      onChange={() => setRepayMethod('Cash')}
                    />
                    <span>Cash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="repayMethod"
                      checked={repayMethod === 'UPI'}
                      onChange={() => setRepayMethod('UPI')}
                    />
                    <span>UPI (GPay/PhonePe)</span>
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="repay-notes-input" className="block font-semibold text-slate-700 mb-1">Notes</label>
                <input
                  id="repay-notes-input"
                  type="text"
                  value={repayNotes}
                  onChange={(e) => setRepayNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRepaymentCustomer(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Record Payment & Clear Due
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
