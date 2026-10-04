import React from 'react';
import {
  Printer,
  X,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  QrCode,
  Share2,
} from 'lucide-react';
import { Invoice } from '../types';
import { useStore } from '../context/StoreContext';

interface PrintableInvoiceModalProps {
  invoice: Invoice | null;
  onClose: () => void;
}

export const PrintableInvoiceModal: React.FC<PrintableInvoiceModalProps> = ({
  invoice,
  onClose,
}) => {
  const { storeInfo } = useStore();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `*Invoice from ${storeInfo.storeName} (${storeInfo.subTitle})*\nInvoice No: ${invoice.id}\nDate: ${new Date(invoice.date).toLocaleDateString()}\nCustomer: ${invoice.customerName || 'Customer'}\nItems: ${invoice.items.length}\nTotal Amount: ₹${invoice.grandTotal}\nPaid: ₹${invoice.amountPaid}\nDue: ₹${invoice.dueAmount}\n\nThank you for shopping at Radhe Fashion, Jehanabad!\nContact: ${storeInfo.mobile}`;

    if (navigator.share) {
      navigator.share({
        title: `Invoice ${invoice.id} - ${storeInfo.storeName}`,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert('Invoice details copied to clipboard!');
    }
  };

  const invoiceDate = new Date(invoice.date);
  const formattedDate = invoiceDate.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = invoiceDate.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div className="bg-white text-slate-900 rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[96vh]">
        {/* Modal Top Action Bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-4 py-3 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-sm">Invoice Generated Successfully</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto invoice-printable bg-white text-slate-900 space-y-6">
          {/* Shop Header & Branding */}
          <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
            <div className="flex items-center justify-center gap-2">
              <span className="w-6 h-6 rounded bg-slate-900 text-amber-400 font-display font-bold text-xs flex items-center justify-center">
                RF
              </span>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl tracking-wide text-slate-950 uppercase">
                {storeInfo.storeName}
              </h2>
            </div>
            <p className="text-xs uppercase tracking-widest font-semibold text-amber-700">
              {storeInfo.subTitle} · Premium Men's Retail Store
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Proprietor: <span className="font-semibold text-slate-900">{storeInfo.ownerName}</span>
            </p>
            <p className="text-xs text-slate-600 max-w-lg mx-auto flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500 shrink-0 inline" />
              <span>{storeInfo.address}</span>
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-700 pt-0.5 font-medium flex-wrap">
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-600" />
                <span>+91 {storeInfo.mobile}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-600" />
                <span>{storeInfo.email}</span>
              </span>
            </div>
          </div>

          {/* Invoice Meta and Customer Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="space-y-1">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                Billed To:
              </p>
              <p className="font-bold text-slate-900 text-sm">
                {invoice.customerName || 'Walk-in Customer'}
              </p>
              {invoice.customerPhone && (
                <p className="text-slate-600 font-mono">Mobile: +91 {invoice.customerPhone}</p>
              )}
              <p className="text-slate-500 text-[11px]">
                Payment Mode:{' '}
                <span className="font-semibold text-slate-800">{invoice.paymentMethod}</span>
              </p>
            </div>

            <div className="space-y-1 text-right">
              <p className="text-slate-500 uppercase tracking-wider text-[10px] font-semibold">
                Invoice Details:
              </p>
              <p className="font-mono font-bold text-slate-900 text-sm">
                {invoice.id}
              </p>
              <p className="text-slate-600">
                Date: <span className="font-medium text-slate-800">{formattedDate}</span>
              </p>
              <p className="text-slate-600">
                Time: <span className="font-medium text-slate-800">{formattedTime}</span>
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-800 text-slate-700 uppercase tracking-wider text-[10px] bg-slate-100">
                  <th className="py-2 px-2 text-center w-8">#</th>
                  <th className="py-2 px-3">Item Description</th>
                  <th className="py-2 px-2 text-center">Category</th>
                  <th className="py-2 px-2 text-center">Size</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {invoice.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-2 text-center font-mono text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div>{item.title}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{item.productId}</span>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600">{item.category}</td>
                    <td className="py-2.5 px-2 text-center font-semibold text-slate-900 bg-slate-50">
                      {item.size}"
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-semibold">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                      ₹{item.unitPrice.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-semibold tabular-nums text-slate-900">
                      ₹{item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals & Payment Summary */}
          <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row justify-between items-start gap-4">
            {/* Payment & QR Note */}
            <div className="text-xs space-y-2 max-w-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 flex items-center gap-3">
                <div className="w-12 h-12 bg-white p-1 rounded border border-slate-300 flex items-center justify-center shrink-0">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <div className="text-[11px] leading-tight">
                  <p className="font-semibold text-slate-900">Scan & Pay via UPI</p>
                  <p className="font-mono text-slate-600 text-[10px]">{storeInfo.upiId}</p>
                  <p className="text-amber-700 font-medium text-[10px]">Google Pay / PhonePe / Paytm</p>
                </div>
              </div>
              {invoice.notes && (
                <p className="text-[11px] text-slate-600 italic">
                  Note: {invoice.notes}
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums font-medium text-slate-900">
                  ₹{invoice.subtotal.toLocaleString()}
                </span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono tabular-nums">-₹{invoice.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-slate-300 pt-1.5 flex justify-between font-bold text-sm text-slate-950">
                <span>Grand Total:</span>
                <span className="font-mono tabular-nums text-base">
                  ₹{invoice.grandTotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Amount Paid:</span>
                <span className="font-mono tabular-nums font-semibold text-emerald-700">
                  ₹{invoice.amountPaid.toLocaleString()}
                </span>
              </div>
              {invoice.dueAmount > 0 ? (
                <div className="flex justify-between text-rose-700 font-bold bg-rose-50 px-2 py-1 rounded">
                  <span>Balance Due:</span>
                  <span className="font-mono tabular-nums">
                    ₹{invoice.dueAmount.toLocaleString()}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between text-emerald-800 font-medium text-[11px]">
                  <span>Status:</span>
                  <span className="font-semibold">Fully Paid ✓</span>
                </div>
              )}
            </div>
          </div>

          {/* Terms & Conditions & Signatory */}
          <div className="border-t border-slate-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-slate-500">
            <div>
              <p className="font-bold uppercase tracking-wider text-slate-700 mb-1">
                Terms & Conditions:
              </p>
              <ul className="list-disc pl-3.5 space-y-0.5 leading-relaxed">
                <li>Goods once sold can be exchanged within 7 days with original tag and bill.</li>
                <li>No cash refunds. Items on discount are final sale.</li>
                <li>Thank you for choosing Radhe Fashion! Visit again.</li>
              </ul>
            </div>
            <div className="flex flex-col justify-end items-end text-right pt-4 sm:pt-0">
              <div className="border-b border-slate-400 w-36 mb-1"></div>
              <p className="font-semibold text-slate-800">For {storeInfo.storeName}</p>
              <p className="text-slate-500">Authorized Signatory / Rahul Kumar</p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Close Button (no-print) */}
        <div className="no-print bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
