import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  AlertTriangle,
  CheckCircle,
  X,
  TrendingUp,
  Tag,
  DollarSign,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import { Product, Category, Size } from '../types';
import { useStore } from '../context/StoreContext';

export const InventoryView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, adjustStock, storeInfo } = useStore();

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSize, setSelectedSize] = useState<string>('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'Low' | 'Out'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'category' | 'stock' | 'price'>('category');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Form states for Add/Edit
  const [formCategory, setFormCategory] = useState<Category>('Jeans');
  const [formSize, setFormSize] = useState<Size>('30');
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(650);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(1199);
  const [formStockQuantity, setFormStockQuantity] = useState<number>(10);
  const [formMinStockAlert, setFormMinStockAlert] = useState<number>(5);

  // Category prefix helper for auto ID
  const getCategoryPrefix = (cat: Category) => {
    switch (cat) {
      case 'Jeans':
        return 'RF-JN';
      case 'T-shirt':
        return 'RF-TS';
      case 'Shirt':
        return 'RF-SH';
      case 'Trouser':
        return 'RF-TR';
    }
  };

  const openAddModal = () => {
    const prefix = getCategoryPrefix('Jeans');
    const randomNum = Math.floor(Math.random() * 90 + 10);
    setFormCategory('Jeans');
    setFormSize('30');
    setFormId(`${prefix}-30-${randomNum}`);
    setFormTitle('');
    setFormPurchasePrice(650);
    setFormSellingPrice(1199);
    setFormStockQuantity(12);
    setFormMinStockAlert(5);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormCategory(product.category);
    setFormSize(product.size);
    setFormId(product.id);
    setFormTitle(product.title);
    setFormPurchasePrice(product.purchasePrice);
    setFormSellingPrice(product.sellingPrice);
    setFormStockQuantity(product.stockQuantity);
    setFormMinStockAlert(product.minStockAlert);
  };

  const handleCategoryChange = (cat: Category) => {
    setFormCategory(cat);
    if (!editingProduct) {
      const prefix = getCategoryPrefix(cat);
      const randomNum = Math.floor(Math.random() * 90 + 10);
      setFormId(`${prefix}-${formSize}-${randomNum}`);
    }
  };

  const handleSizeChange = (sz: Size) => {
    setFormSize(sz);
    if (!editingProduct) {
      const prefix = getCategoryPrefix(formCategory);
      const randomNum = Math.floor(Math.random() * 90 + 10);
      setFormId(`${prefix}-${sz}-${randomNum}`);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formId.trim() || !formTitle.trim()) {
      alert('Please enter both Product ID and Item Title.');
      return;
    }

    if (editingProduct) {
      // Update
      updateProduct(editingProduct.id, {
        category: formCategory,
        size: formSize,
        title: formTitle.trim(),
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        stockQuantity: Number(formStockQuantity) || 0,
        minStockAlert: Number(formMinStockAlert) || 5,
      });
      setEditingProduct(null);
    } else {
      // Add
      if (products.some((p) => p.id === formId.trim())) {
        alert('A product with this Product ID already exists. Please choose a unique ID.');
        return;
      }

      addProduct({
        id: formId.trim().toUpperCase(),
        category: formCategory,
        size: formSize,
        title: formTitle.trim(),
        purchasePrice: Number(formPurchasePrice) || 0,
        sellingPrice: Number(formSellingPrice) || 0,
        stockQuantity: Number(formStockQuantity) || 0,
        minStockAlert: Number(formMinStockAlert) || 5,
      });
      setIsAddModalOpen(false);
    }
  };

  // Filtered & Sorted Products
  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSize = selectedSize === 'All' || p.size === selectedSize;

    let matchesStock = true;
    if (stockStatusFilter === 'Low') {
      matchesStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert;
    } else if (stockStatusFilter === 'Out') {
      matchesStock = p.stockQuantity === 0;
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      q === '' ||
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);

    return matchesCat && matchesSize && matchesStock && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === 'stock') {
      comparison = a.stockQuantity - b.stockQuantity;
    } else if (sortBy === 'price') {
      comparison = a.sellingPrice - b.sellingPrice;
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Product ID',
      'Category',
      'Title',
      'Size (inches)',
      'Stock Quantity',
      'Purchase Price (INR)',
      'Selling Price (INR)',
      'Margin (INR)',
      'Margin (%)',
      'Status',
    ];

    const rows = sortedProducts.map((p) => {
      const margin = p.sellingPrice - p.purchasePrice;
      const marginPct = p.purchasePrice > 0 ? ((margin / p.purchasePrice) * 100).toFixed(1) : '0';
      const status =
        p.stockQuantity === 0
          ? 'Out of Stock'
          : p.stockQuantity <= p.minStockAlert
          ? 'Low Stock'
          : 'In Stock';

      return [
        `"${p.id}"`,
        `"${p.category}"`,
        `"${p.title.replace(/"/g, '""')}"`,
        `"${p.size}"`,
        p.stockQuantity,
        p.purchasePrice,
        p.sellingPrice,
        margin,
        `${marginPct}%`,
        `"${status}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Radhe_Fashion_Inventory_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Metrics summary
  const totalStockCount = products.reduce((sum, p) => sum + p.stockQuantity, 0);
  const totalInventoryCost = products.reduce((sum, p) => sum + p.purchasePrice * p.stockQuantity, 0);
  const totalRetailValue = products.reduce((sum, p) => sum + p.sellingPrice * p.stockQuantity, 0);
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity === 0).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Inventory Units
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {totalStockCount.toLocaleString()} <span className="text-xs font-normal text-slate-500">pcs</span>
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Asset Cost
          </span>
          <p className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            ₹{totalInventoryCost.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Estimated Retail Value
          </span>
          <p className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            ₹{totalRetailValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Stock Alerts
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold font-mono text-amber-600 tabular-nums">
              {lowStockCount} <span className="text-xs font-normal">Low</span>
            </span>
            {outOfStockCount > 0 && (
              <span className="text-xs font-bold font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                {outOfStockCount} Out
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls Bar: Search, Filters, Add Item */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID or title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          {/* Action Buttons: Add Item & Export */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              title="Download Inventory Spreadsheet"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Add Item</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 text-xs">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            <span className="font-semibold text-slate-500 text-[11px] mr-1">Category:</span>
            {['All', 'Jeans', 'T-shirt', 'Shirt', 'Trouser'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sizes & Stock status */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Size Filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-500 text-[11px]">Size:</span>
              {['All', '28', '30', '32'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`px-2 py-0.5 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                    selectedSize === sz
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sz === 'All' ? 'All' : `${sz}"`}
                </button>
              ))}
            </div>

            {/* Stock Alert Filter */}
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-500 text-[11px]">Status:</span>
              <button
                onClick={() => setStockStatusFilter('All')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  stockStatusFilter === 'All'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setStockStatusFilter('Low')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  stockStatusFilter === 'Low'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                Low Stock
              </button>
              <button
                onClick={() => setStockStatusFilter('Out')}
                className={`px-2 py-0.5 rounded text-xs transition-colors cursor-pointer ${
                  stockStatusFilter === 'Out'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stock Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th
                  onClick={() => {
                    if (sortBy === 'id') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('id');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Product ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'category') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('category');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4 text-center">Size</th>
                <th
                  onClick={() => {
                    if (sortBy === 'stock') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('stock');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 text-center cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock Qty</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Purchase Price</th>
                <th
                  onClick={() => {
                    if (sortBy === 'price') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                    else {
                      setSortBy('price');
                      setSortOrder('asc');
                    }
                  }}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-900"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Selling Price</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right">Margin / Profit</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold text-slate-700">No inventory products found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adjust your filters or click 'Add Item' to insert new stock
                    </p>
                  </td>
                </tr>
              ) : (
                sortedProducts.map((p) => {
                  const margin = p.sellingPrice - p.purchasePrice;
                  const marginPct =
                    p.purchasePrice > 0 ? ((margin / p.purchasePrice) * 100).toFixed(0) : '0';
                  const isOutOfStock = p.stockQuantity <= 0;
                  const isLowStock = p.stockQuantity > 0 && p.stockQuantity <= p.minStockAlert;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Product ID */}
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {p.id}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-slate-800">{p.category}</span>
                      </td>

                      {/* Title */}
                      <td className="py-3 px-4 font-medium text-slate-900 min-w-48">
                        <div>{p.title}</div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Min alert: {p.minStockAlert} pcs
                        </span>
                      </td>

                      {/* Size */}
                      <td className="py-3 px-4 text-center font-mono font-bold text-slate-900 bg-slate-50/50">
                        {p.size}"
                      </td>

                      {/* Stock Quantity with Quick adjust */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => adjustStock(p.id, -1)}
                            disabled={p.stockQuantity <= 0}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Decrease stock by 1"
                          >
                            <MinusCircle className="w-4 h-4" />
                          </button>
                          <span
                            className={`font-mono font-bold px-2 py-0.5 rounded text-xs tabular-nums ${
                              isOutOfStock
                                ? 'bg-rose-100 text-rose-800'
                                : isLowStock
                                ? 'bg-amber-100 text-amber-900'
                                : 'text-slate-900'
                            }`}
                          >
                            {p.stockQuantity}
                          </span>
                          <button
                            onClick={() => adjustStock(p.id, 1)}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                            title="Increase stock by 1"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      {/* Purchase Price */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600">
                        ₹{p.purchasePrice.toLocaleString()}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                        ₹{p.sellingPrice.toLocaleString()}
                      </td>

                      {/* Margin */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-700 font-medium">
                        +₹{margin.toLocaleString()}{' '}
                        <span className="text-[10px] text-emerald-600">({marginPct}%)</span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                            In Stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingProduct ? `Edit Item (${editingProduct.id})` : 'Add New Apparel Stock Item'}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingProduct(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Category Selection */}
                <div>
                  <label htmlFor="form-category-select" className="block font-semibold text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    id="form-category-select"
                    value={formCategory}
                    onChange={(e) => handleCategoryChange(e.target.value as Category)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                  >
                    <option value="Jeans">Jeans</option>
                    <option value="T-shirt">T-shirt</option>
                    <option value="Shirt">Shirt</option>
                    <option value="Trouser">Trouser</option>
                  </select>
                </div>

                {/* Available Sizes Selection (28, 30, 32) */}
                <div>
                  <label htmlFor="form-size-select" className="block font-semibold text-slate-700 mb-1">
                    Size (inches) *
                  </label>
                  <select
                    id="form-size-select"
                    value={formSize}
                    onChange={(e) => handleSizeChange(e.target.value as Size)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium font-mono"
                  >
                    <option value="28">28 inches</option>
                    <option value="30">30 inches</option>
                    <option value="32">32 inches</option>
                  </select>
                </div>
              </div>

              {/* Product ID */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="form-product-id" className="font-semibold text-slate-700">Product ID *</label>
                  <span className="text-[10px] text-slate-400">Unique store SKU</span>
                </div>
                <input
                  id="form-product-id"
                  type="text"
                  required
                  disabled={!!editingProduct}
                  value={formId}
                  onChange={(e) => setFormId(e.target.value.toUpperCase())}
                  placeholder="e.g. RF-JN-30-05"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 font-mono disabled:opacity-70 text-slate-900 font-bold"
                />
              </div>

              {/* Item Title / Description */}
              <div>
                <label htmlFor="form-item-title" className="block font-semibold text-slate-700 mb-1">
                  Item Title / Fit Description *
                </label>
                <input
                  id="form-item-title"
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g., Dark Indigo Slim Stretch Denim or Cotton Polo Maroon"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900"
                />
              </div>

              {/* Prices: Purchase Price & Selling Price */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <label htmlFor="form-purchase-price" className="block font-semibold text-slate-700 mb-1">
                    Purchase Price (₹) *
                  </label>
                  <input
                    id="form-purchase-price"
                    type="number"
                    min="0"
                    required
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Wholesale cost</span>
                </div>

                <div>
                  <label htmlFor="form-selling-price" className="block font-semibold text-slate-700 mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    id="form-selling-price"
                    type="number"
                    min="0"
                    required
                    value={formSellingPrice}
                    onChange={(e) => setFormSellingPrice(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900"
                  />
                  <span className="text-[10px] text-slate-400">Store retail price</span>
                </div>
              </div>

              {/* Stock Quantity & Low Stock Alert */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="form-stock-qty" className="block font-semibold text-slate-700 mb-1">
                    Current Stock Quantity *
                  </label>
                  <input
                    id="form-stock-qty"
                    type="number"
                    min="0"
                    required
                    value={formStockQuantity}
                    onChange={(e) => setFormStockQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>

                <div>
                  <label htmlFor="form-min-alert" className="block font-semibold text-slate-700 mb-1">
                    Low Stock Alert Below
                  </label>
                  <input
                    id="form-min-alert"
                    type="number"
                    min="1"
                    required
                    value={formMinStockAlert}
                    onChange={(e) => setFormMinStockAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingProduct(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-xs transition-colors"
                >
                  {editingProduct ? 'Update Product' : 'Add Item to Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingProductId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full border border-slate-200 p-5 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              <span>Confirm Delete Product</span>
            </div>
            <p className="text-slate-600">
              Are you sure you want to remove item{' '}
              <span className="font-mono font-bold text-slate-900">{deletingProductId}</span> from the
              inventory? This action cannot be undone.
            </p>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setDeletingProductId(null)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteProduct(deletingProductId);
                  setDeletingProductId(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors"
              >
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
