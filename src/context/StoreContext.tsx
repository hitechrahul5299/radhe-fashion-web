import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Invoice,
  LedgerEntry,
  CustomerDueRecord,
  StoreInfo,
  Category,
  Size,
} from '../types';
import {
  INITIAL_STORE_INFO,
  INITIAL_PRODUCTS,
  INITIAL_INVOICES,
  INITIAL_LEDGER,
  INITIAL_CUSTOMER_DUES,
} from '../data/seedData';

interface StoreContextType {
  storeInfo: StoreInfo;
  updateStoreInfo: (info: Partial<StoreInfo>) => void;
  products: Product[];
  addProduct: (product: Omit<Product, 'updatedAt'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'date'>) => Invoice;
  deleteInvoice: (id: string) => void;
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, 'id' | 'date'>) => void;
  deleteLedgerEntry: (id: string) => void;
  customerDues: CustomerDueRecord[];
  recordDuePayment: (customerPhone: string, amount: number, paymentMethod: 'Cash' | 'UPI', notes?: string) => void;
  resetToDefaults: () => void;
  exportDataJson: () => void;
  importDataJson: (jsonString: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo>(() => {
    const saved = localStorage.getItem('rf_store_info');
    return saved ? JSON.parse(saved) : INITIAL_STORE_INFO;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('rf_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    const saved = localStorage.getItem('rf_invoices');
    return saved ? JSON.parse(saved) : INITIAL_INVOICES;
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    const saved = localStorage.getItem('rf_ledger');
    return saved ? JSON.parse(saved) : INITIAL_LEDGER;
  });

  const [customerDues, setCustomerDues] = useState<CustomerDueRecord[]>(() => {
    const saved = localStorage.getItem('rf_customer_dues');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMER_DUES;
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('rf_store_info', JSON.stringify(storeInfo));
  }, [storeInfo]);

  useEffect(() => {
    localStorage.setItem('rf_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('rf_invoices', JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem('rf_ledger', JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    localStorage.setItem('rf_customer_dues', JSON.stringify(customerDues));
  }, [customerDues]);

  const updateStoreInfo = (info: Partial<StoreInfo>) => {
    setStoreInfo((prev) => ({ ...prev, ...info }));
  };

  // Product actions
  const addProduct = (newProd: Omit<Product, 'updatedAt'>) => {
    const fullProd: Product = {
      ...newProd,
      updatedAt: new Date().toISOString(),
    };
    setProducts((prev) => [fullProd, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, ...updatedFields, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const newQty = Math.max(0, p.stockQuantity + delta);
          return { ...p, stockQuantity: newQty, updatedAt: new Date().toISOString() };
        }
        return p;
      })
    );
  };

  // Billing and POS actions
  const createInvoice = (invoiceData: Omit<Invoice, 'id' | 'date'>): Invoice => {
    const now = new Date();
    const invCount = invoices.length + 1026;
    const invId = `RF-INV-${invCount}`;

    const newInvoice: Invoice = {
      ...invoiceData,
      id: invId,
      date: now.toISOString(),
    };

    // 1. Deduct product stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const itemInBill = invoiceData.items.find((i) => i.productId === prod.id);
        if (itemInBill) {
          return {
            ...prod,
            stockQuantity: Math.max(0, prod.stockQuantity - itemInBill.quantity),
            updatedAt: now.toISOString(),
          };
        }
        return prod;
      })
    );

    // 2. Add Invoice
    setInvoices((prev) => [newInvoice, ...prev]);

    // 3. Add to Ledger if money was collected
    if (invoiceData.amountPaid > 0) {
      const newLedgerItem: LedgerEntry = {
        id: `LDG-${Date.now()}`,
        date: now.toISOString(),
        type: 'income',
        category: 'Sales',
        amount: invoiceData.amountPaid,
        description: `Bill #${invId} (${invoiceData.customerName || 'Walk-in Customer'})`,
        paymentMethod: invoiceData.paymentMethod === 'Due/Credit' ? 'Cash' : (invoiceData.paymentMethod as any),
        referenceInvoiceId: invId,
        customerName: invoiceData.customerName || 'Walk-in Customer',
      };
      setLedger((prev) => [newLedgerItem, ...prev]);
    }

    // 4. If dueAmount > 0, track in customer dues
    if (invoiceData.dueAmount > 0 && invoiceData.customerName) {
      setCustomerDues((prev) => {
        const existingIndex = prev.findIndex(
          (c) =>
            (c.customerPhone && c.customerPhone === invoiceData.customerPhone) ||
            c.customerName.toLowerCase() === invoiceData.customerName.toLowerCase()
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          const curr = updated[existingIndex];
          updated[existingIndex] = {
            ...curr,
            totalDue: curr.totalDue + invoiceData.dueAmount,
            lastUpdated: now.toISOString(),
            invoiceIds: Array.from(new Set([...curr.invoiceIds, invId])),
          };
          return updated;
        } else {
          const newDueRecord: CustomerDueRecord = {
            customerName: invoiceData.customerName,
            customerPhone: invoiceData.customerPhone || '',
            totalDue: invoiceData.dueAmount,
            lastUpdated: now.toISOString(),
            invoiceIds: [invId],
            repayments: [],
          };
          return [newDueRecord, ...prev];
        }
      });
    }

    return newInvoice;
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Ledger actions
  const addLedgerEntry = (entry: Omit<LedgerEntry, 'id' | 'date'>) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: `LDG-${Date.now()}`,
      date: new Date().toISOString(),
    };
    setLedger((prev) => [newEntry, ...prev]);
  };

  const deleteLedgerEntry = (id: string) => {
    setLedger((prev) => prev.filter((l) => l.id !== id));
  };

  // Record Due Payment
  const recordDuePayment = (
    customerPhone: string,
    amount: number,
    paymentMethod: 'Cash' | 'UPI',
    notes?: string
  ) => {
    if (amount <= 0) return;
    const now = new Date().toISOString();

    let customerName = 'Customer';
    setCustomerDues((prev) =>
      prev.map((c) => {
        if (c.customerPhone === customerPhone || c.customerName === customerPhone) {
          customerName = c.customerName;
          const newDue = Math.max(0, c.totalDue - amount);
          return {
            ...c,
            totalDue: newDue,
            lastUpdated: now,
            repayments: [
              ...c.repayments,
              {
                id: `REP-${Date.now()}`,
                date: now,
                amount,
                paymentMethod,
                notes: notes || 'Due cleared at shop counter',
              },
            ],
          };
        }
        return c;
      })
    );

    // Add repayment as income in ledger
    setLedger((prev) => [
      {
        id: `LDG-${Date.now()}`,
        date: now,
        type: 'income',
        category: 'Customer Due Repayment',
        amount,
        description: `Khata / Due Repayment from ${customerName}`,
        paymentMethod,
        customerName,
      },
      ...prev,
    ]);
  };

  const resetToDefaults = () => {
    setStoreInfo(INITIAL_STORE_INFO);
    setProducts(INITIAL_PRODUCTS);
    setInvoices(INITIAL_INVOICES);
    setLedger(INITIAL_LEDGER);
    setCustomerDues(INITIAL_CUSTOMER_DUES);
    localStorage.clear();
  };

  const exportDataJson = () => {
    const data = {
      storeInfo,
      products,
      invoices,
      ledger,
      customerDues,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Radhe_Fashion_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importDataJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.products && Array.isArray(data.products)) {
        if (data.storeInfo) setStoreInfo(data.storeInfo);
        if (data.products) setProducts(data.products);
        if (data.invoices) setInvoices(data.invoices);
        if (data.ledger) setLedger(data.ledger);
        if (data.customerDues) setCustomerDues(data.customerDues);
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        storeInfo,
        updateStoreInfo,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        invoices,
        createInvoice,
        deleteInvoice,
        ledger,
        addLedgerEntry,
        deleteLedgerEntry,
        customerDues,
        recordDuePayment,
        resetToDefaults,
        exportDataJson,
        importDataJson,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
