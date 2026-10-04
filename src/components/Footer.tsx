import React from 'react';
import { Phone, Mail, MapPin, User, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const Footer: React.FC = () => {
  const { storeInfo } = useStore();

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 py-8 px-4 mt-auto no-print">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {/* Store Identity */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-amber-500 text-slate-950 font-bold flex items-center justify-center font-display text-sm">
              RF
            </div>
            <h3 className="font-display font-bold text-white text-base tracking-wide">
              {storeInfo.storeName}
            </h3>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-800 text-amber-400">
              {storeInfo.subTitle}
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Premium menswear retail store catering to men's fashion: Jeans, T-Shirts, Formal & Casual Shirts, and Trousers with tailored sizes.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium pt-1">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Store Owner:</span>
            <span className="text-white font-semibold">{storeInfo.ownerName}</span>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Store Contact & Address
          </h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{storeInfo.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <a
                href={`tel:${storeInfo.mobile}`}
                className="text-slate-300 hover:text-amber-300 transition-colors font-mono"
              >
                +91 {storeInfo.mobile}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400 shrink-0" />
              <a
                href={`mailto:${storeInfo.email}`}
                className="text-slate-300 hover:text-amber-300 transition-colors"
              >
                {storeInfo.email}
              </a>
            </div>
          </div>
        </div>

        {/* Store Highlights & Hours */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Retail Store Information
          </h4>
          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 text-xs space-y-1.5">
            <div className="flex justify-between text-slate-300">
              <span>Operating Hours:</span>
              <span className="text-white font-medium">9:30 AM – 9:00 PM</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Primary Categories:</span>
              <span className="text-amber-400 font-medium">Jeans, T-shirt, Shirt, Trouser</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Sizes Available:</span>
              <span className="text-white font-medium">28, 30, 32 inches</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>UPI Payment ID:</span>
              <span className="text-amber-300 font-mono">{storeInfo.upiId}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-slate-800/80 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
        <p>© {new Date().getFullYear()} {storeInfo.storeName} ({storeInfo.subTitle}). All rights reserved.</p>
        <p className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Local offline-first data with backup export capability</span>
        </p>
      </div>
    </footer>
  );
};
