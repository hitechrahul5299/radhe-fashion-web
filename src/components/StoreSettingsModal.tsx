import React, { useState } from 'react';
import {
  X,
  Store,
  Phone,
  Mail,
  MapPin,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  ShieldAlert,
  Save,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    storeInfo,
    updateStoreInfo,
    exportDataJson,
    importDataJson,
    resetToDefaults,
  } = useStore();

  const [storeName, setStoreName] = useState(storeInfo.storeName);
  const [subTitle, setSubTitle] = useState(storeInfo.subTitle);
  const [ownerName, setOwnerName] = useState(storeInfo.ownerName);
  const [mobile, setMobile] = useState(storeInfo.mobile);
  const [email, setEmail] = useState(storeInfo.email);
  const [address, setAddress] = useState(storeInfo.address);
  const [upiId, setUpiId] = useState(storeInfo.upiId);

  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreInfo({
      storeName: storeName.trim(),
      subTitle: subTitle.trim(),
      ownerName: ownerName.trim(),
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      upiId: upiId.trim(),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDataJson(content);
      if (success) {
        setImportSuccess(true);
        setImportError(null);
        setTimeout(() => {
          setImportSuccess(false);
          onClose();
        }, 1500);
      } else {
        setImportError('Invalid backup JSON format. Please verify the file.');
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset all data to default demo data? All custom products and bills will be restored to the initial state.'
      )
    ) {
      resetToDefaults();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Store className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm">Store Settings & Data Management</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh] text-xs">
          {savedSuccess && (
            <div className="bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">Store details updated successfully!</span>
            </div>
          )}

          {/* Store Info Form */}
          <form onSubmit={handleSaveInfo} className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-1.5">
              Business & Invoice Header Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Store Name *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tagline / Subtitle</label>
                <input
                  type="text"
                  value={subTitle}
                  onChange={(e) => setSubTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Store Owner Name *
                </label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email ID</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Store UPI ID (For Scan & Pay)
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Store Full Address (Appears on Bills & Invoices) *
              </label>
              <textarea
                rows={2}
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold transition-colors cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-amber-400" />
                <span>Save Business Details</span>
              </button>
            </div>
          </form>

          {/* Backup & Restore Data */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">Data Backup & Restore</h4>
            <p className="text-slate-500 text-xs">
              All inventory, bills, ledger entries, and customer credit dues are stored securely on this device. You can download a backup copy or restore an existing one at any time.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={exportDataJson}
                className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Backup (.JSON)</span>
              </button>

              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 font-semibold text-slate-800 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-slate-600" />
                <span>Import Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importSuccess && (
              <p className="text-emerald-700 font-semibold">Backup data restored successfully!</p>
            )}
            {importError && <p className="text-rose-600 font-semibold">{importError}</p>}
          </div>

          {/* Reset to Seed Data */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-rose-700">Restore Sample Data</p>
              <p className="text-slate-500 text-[11px]">
                Reset inventory & sales to default Radhe Fashion catalog
              </p>
            </div>
            <button
              onClick={handleConfirmReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
