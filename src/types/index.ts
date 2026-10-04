export type Category = 'Jeans' | 'T-shirt' | 'Shirt' | 'Trouser';

export type Size = '28' | '30' | '32';

export interface StoreInfo {
  storeName: string;
  subTitle: string;
  ownerName: string;
  mobile: string;
  email: string;
  address: string;
  upiId: string;
}

export interface Product {
  id: string; // e.g., 'RF-JN-28-01'
  category: Category;
  title: string;
  size: Size;
  stockQuantity: number;
  purchasePrice: number; // Cost price in INR
  sellingPrice: number; // Selling/Retail price in INR
  minStockAlert: number; // Threshold for low stock warning
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceItem {
  productId: string;
  title: string;
  category: Category;
  size: Size;
  quantity: number;
  purchasePrice: number;
  unitPrice: number;
  total: number;
}

export type PaymentMethod = 'Cash' | 'UPI' | 'Card' | 'Due/Credit';

export interface Invoice {
  id: string; // e.g., 'RF-INV-1001'
  date: string; // ISO date string
  customerName: string;
  customerPhone: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  amountPaid: number;
  dueAmount: number;
  paymentMethod: PaymentMethod;
  notes?: string;
}

export type LedgerType = 'income' | 'expense';

export type ExpenseCategory =
  | 'Shop Rent'
  | 'Electricity Bill'
  | 'Staff Salary'
  | 'Tea & Refreshment'
  | 'Transport & Freight'
  | 'Supplier / Wholesale Purchase'
  | 'Shop Maintenance'
  | 'Miscellaneous';

export interface LedgerEntry {
  id: string;
  date: string; // ISO string
  type: LedgerType;
  category: string;
  amount: number;
  description: string;
  paymentMethod: 'Cash' | 'UPI' | 'Bank' | 'Card';
  referenceInvoiceId?: string;
  customerName?: string;
}

export interface CustomerDueRecord {
  customerName: string;
  customerPhone: string;
  totalDue: number;
  lastUpdated: string;
  invoiceIds: string[];
  repayments: {
    id: string;
    date: string;
    amount: number;
    paymentMethod: 'Cash' | 'UPI';
    notes?: string;
  }[];
}
