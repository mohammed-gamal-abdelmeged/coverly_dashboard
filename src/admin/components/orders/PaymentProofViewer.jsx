import React, { useState } from "react";
import { Image as ImageIcon, X } from "lucide-react";

export default function PaymentProofViewer({ url }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">صورة التحويل</h2>
          <span className="text-xs text-white/50">اضغط للعرض</span>
        </div>

        {!url ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
            لا توجد صورة تحويل مرفوعة.
          </div>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition text-right"
            type="button"
          >
            <div className="flex items-center gap-2 px-3 py-2 text-sm text-white/70">
              <ImageIcon size={16} />
              <span>عرض صورة التحويل</span>
            </div>
            <img src={url} alt="Payment proof" className="w-full h-64 object-cover" loading="lazy" />
          </button>
        )}
      </div>

      {open && url ? (
        <div className="fixed inset-0 z-[999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setOpen(false)}
              className="absolute -top-12 left-0 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
              type="button"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#0B0814]">
              <img src={url} alt="Payment proof full" className="w-full h-auto object-contain" />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
