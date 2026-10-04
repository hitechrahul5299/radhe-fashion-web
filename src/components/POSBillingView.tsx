import React, { useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  Phone,
  CreditCard,
  Banknote,
  QrCode,
  AlertCircle,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  History,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { Product, Category, Size, PaymentMethod, Invoice, CartItem } from '../types';
import { useStore } from '../context/StoreContext';
import { PrintableInvoiceModal } from './PrintableInvoiceModal';

export const POSBillingView: React.FC = () => {
  const { products, createInvoice, invoices, storeInfo } = useStore();

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeSize, setActiveSize] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [customPaidAmount, setCustomPaidAmount] = useState<string>('');
  const [notes, setNotes] = useState('');

  // Modal for viewing printable invoice
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'create' | 'history'>('create');

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === 'All' || p.category === activeCategory;
    const matchesSize = activeSize === 'All' || p.size === activeSize;
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      q === '' ||
      p.title.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCat && matchesSize && matchesQuery;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          alert(`Cannot add more than available stock (${product.stockQuantity} in stock)`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice: product.sellingPrice }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stockQuantity) {
              alert(`Maximum available stock is ${item.product.stockQuantity}`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setCustomPaidAmount('');
    setNotes('');
  };

  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const grandTotal = Math.max(0, subtotal - (Number(discount) || 0));

  // Determine amount paid and due
  const parsedPaid =
    customPaidAmount === '' ? grandTotal : Math.max(0, Number(customPaidAmount) || 0);
  const amountPaid = paymentMethod === 'Due/Credit' && customPaidAmount === '' ? 0 : parsedPaid;
  const dueAmount = Math.max(0, grandTotal - amountPaid);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Please add at least one product to the bill.');
      return;
    }

    if (dueAmount > 0 && !customerName.trim()) {
      alert('Customer Name is required when generating a bill with pending Due / Credit balance.');
      return;
    }

    const invoiceItems = cart.map((item) => ({
      productId: item.product.id,
      title: item.product.title,
      category: item.product.category,
      size: item.product.size,
      quantity: item.quantity,
      purchasePrice: item.product.purchasePrice,
      unitPrice: item.unitPrice,
      total: item.unitPrice * item.quantity,
    }));

    const newInvoice = createInvoice({
      customerName: customerName.trim() || 'Walk-in Customer',
      customerPhone: customerPhone.trim(),
      items: invoiceItems,
      subtotal,
      discount: Number(discount) || 0,
      grandTotal,
      amountPaid,
      dueAmount,
      paymentMethod,
      notes: notes.trim(),
    });

    // Reset form & cart
    clearCart();
    setCustomerName('');
    setCustomerPhone('');

    // Open print preview
    setSelectedInvoice(newInvoice);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs: Create Bill vs Bill History */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('create')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'create'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
          <button
            onClick={() => setActiveSubTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeSubTab === 'history'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Past Invoices ({invoices.length})</span>
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Store: <span className="font-semibold text-slate-800">{storeInfo.storeName}</span>
        </div>
      </div>

      {activeSubTab === 'history' ? (
        /* PAST INVOICES VIEW */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Recent Store Invoices</h3>
            <span className="text-xs text-slate-500">{invoices.length} invoices generated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4 text-center">Items</th>
                  <th className="py-3 px-4 text-right">Total Amount</th>
                  <th className="py-3 px-4 text-right">Paid</th>
                  <th className="py-3 px-4 text-right">Due</th>
                  <th className="py-3 px-4 text-center">Payment</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{inv.id}</td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {new Date(inv.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}{' '}
                      · {new Date(inv.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      {inv.customerPhone && (
                        <div className="text-[10px] text-slate-500 font-mono">+91 {inv.customerPhone}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-mono">
                      {inv.items.reduce((s, i) => s + i.quantity, 0)} pcs
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ₹{inv.grandTotal.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold tabular-nums">
                      ₹{inv.amountPaid.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      {inv.dueAmount > 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">
                          ₹{inv.dueAmount.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-slate-400">₹0</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 transition-colors inline-flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
                        title="Print / View Invoice"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CREATE BILL SPLIT SCREEN */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Product Catalog & Filter (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search menswear by title or ID (e.g., Denim, RF-JN, Cotton)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 text-slate-900 transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-slate-500 mr-1">Category:</span>
                  {['All', 'Jeans', 'T-shirt', 'Shirt', 'Trouser'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                        activeCategory === cat
                          ? 'bg-slate-900 text-amber-300 font-semibold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Size Filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Size:</span>
                  {['All', '28', '30', '32'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setActiveSize(sz)}
                      className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                        activeSize === sz
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {sz === 'All' ? 'All' : `${sz}"`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {filteredProducts.length === 0 ? (
                <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-slate-500">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No matching apparel found</p>
                  <p className="text-xs text-slate-400 mt-1">Try changing category or size filters</p>
                </div>
              ) : (
                filteredProducts.map((prod) => {
                  const inCartItem = cart.find((i) => i.product.id === prod.id);
                  const isOutOfStock = prod.stockQuantity <= 0;
                  const isLowStock = prod.stockQuantity > 0 && prod.stockQuantity <= prod.minStockAlert;

                  return (
                    <div
                      key={prod.id}
                      className={`bg-white rounded-xl border p-3.5 flex flex-col justify-between transition-all hover:border-amber-400 hover:shadow-sm ${
                        inCartItem ? 'border-amber-500 ring-1 ring-amber-500/30' : 'border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-[10px] font-mono text-slate-500">{prod.id}</span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono">
                            Size {prod.size}"
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-1">
                          {prod.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                          <span>{prod.category}</span>
                          <span>·</span>
                          <span
                            className={`font-medium ${
                              isOutOfStock
                                ? 'text-rose-600 font-semibold'
                                : isLowStock
                                ? 'text-amber-600 font-semibold'
                                : 'text-slate-600'
                            }`}
                          >
                            {isOutOfStock
                              ? 'Out of Stock'
                              : `${prod.stockQuantity} in stock ${isLowStock ? '(Low)' : ''}`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400">Sale Price:</span>
                          <p className="text-sm font-bold text-slate-900 font-mono tabular-nums">
                            ₹{prod.sellingPrice.toLocaleString()}
                          </p>
                        </div>

                        {inCartItem ? (
                          <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg p-0.5">
                            <button
                              onClick={() => updateQuantity(prod.id, -1)}
                              className="w-6 h-6 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-slate-900">
                              {inCartItem.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(prod.id, 1)}
                              disabled={inCartItem.quantity >= prod.stockQuantity}
                              className="w-6 h-6 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center font-bold text-xs shadow-2xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(prod)}
                            disabled={isOutOfStock}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-semibold transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Bill Cart & Checkout (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            {/* Cart Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-amber-400" />
                  <span>Current Bill / Invoice</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {cart.reduce((s, i) => s + i.quantity, 0)} items selected
                </p>
              </div>

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Clear Cart"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            {/* Customer Details Form */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2">
              <div className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Customer Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
                  />
                </div>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="Mobile (10 digits)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    maxLength={10}
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500/40 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-3.5 flex-1 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-slate-400 space-y-1.5">
                  <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No items added to bill yet</p>
                  <p className="text-[11px] text-slate-400">Click '+ Add' on any garment from the left catalog</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs text-slate-900 truncate">
                        {item.product.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-mono bg-slate-100 px-1 rounded text-slate-700 font-bold">
                          {item.product.size}"
                        </span>
                        <span>·</span>
                        <span>₹{item.unitPrice} each</span>
                      </div>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-5 h-5 rounded bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-mono font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        disabled={item.quantity >= item.product.stockQuantity}
                        className="w-5 h-5 rounded bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 flex items-center justify-center font-bold text-xs cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right w-16">
                      <p className="text-xs font-mono font-bold text-slate-900 tabular-nums">
                        ₹{(item.unitPrice * item.quantity).toLocaleString()}
                      </p>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Bill Summary & Payment Section */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
              {/* Subtotal & Discount */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums font-semibold text-slate-900">
                    ₹{subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor="discount-input" className="text-slate-600">Special Discount (₹):</label>
                  <input
                    id="discount-input"
                    type="number"
                    min="0"
                    placeholder="0"
                    value={discount || ''}
                    onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
                    className="w-24 px-2 py-1 text-right text-xs rounded border border-slate-300 bg-white font-mono"
                  />
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-sm text-slate-950">
                  <span>Grand Total:</span>
                  <span className="font-mono tabular-nums text-base text-amber-700">
                    ₹{grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="space-y-1.5 pt-1">
                <span className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                  Payment Mode
                </span>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Cash', 'UPI', 'Card', 'Due/Credit'] as PaymentMethod[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setPaymentMethod(mode);
                        if (mode === 'Due/Credit') {
                          setCustomPaidAmount('0');
                        } else if (customPaidAmount === '0') {
                          setCustomPaidAmount('');
                        }
                      }}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all text-center cursor-pointer ${
                        paymentMethod === mode
                          ? 'bg-slate-900 text-amber-300 ring-2 ring-slate-900 shadow-xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              {/* Partial / Paid Amount & Due Calculation */}
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <label htmlFor="amount-paid-input" className="text-slate-700 font-medium">Amount Received (₹):</label>
                  <input
                    id="amount-paid-input"
                    type="number"
                    min="0"
                    placeholder={grandTotal.toString()}
                    value={customPaidAmount}
                    onChange={(e) => setCustomPaidAmount(e.target.value)}
                    className="w-28 px-2 py-1 text-right text-xs rounded border border-slate-300 font-mono font-bold text-emerald-800"
                  />
                </div>

                {dueAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-700 bg-rose-50 px-2 py-1.5 rounded font-bold text-xs">
                    <span className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Pending Due (Khata):</span>
                    </span>
                    <span className="font-mono tabular-nums">₹{dueAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Note / Remarks */}
              <input
                type="text"
                placeholder="Bill remarks / note (optional)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <Receipt className="w-4 h-4" />
                <span>Complete Bill & Print Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
