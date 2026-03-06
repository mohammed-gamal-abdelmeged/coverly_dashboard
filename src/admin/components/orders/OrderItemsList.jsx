import React, { useState } from "react";

export default function OrderItemsList({ items = [] }) {
  const [openImage, setOpenImage] = useState(null);

  return (
    <>
      <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">المنتجات</h2>
          <span className="text-xs text-white/50">{items.length} عنصر</span>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
            لا توجد عناصر داخل الطلب.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={`${it.product_id}-${idx}`}
                className="flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <div
                  className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-black/20 flex-shrink-0 cursor-pointer"
                  onClick={() => setOpenImage(it.image_url)}
                >
                  <img
                    src={it.image_url}
                    alt={it.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{it.title}</div>
                  <div className="text-xs text-white/60 mt-1">
                    الكمية: <span className="text-white">{it.qty}</span>
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    السعر: <span className="text-white">{it.price} جنيه</span>
                  </div>

                  {it.notes ? (
                    <div className="mt-1 text-xs text-white/60">
                      <span className="text-white/40">ملاحظة:</span> {it.notes}
                    </div>
                  ) : null}
                </div>

                <div className="text-right">
                  <div className="text-xs text-white/50">الإجمالي</div>
                  <div className="text-sm font-bold text-[#9B6DFF]">
                    {it.price * it.qty} جنيه
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {openImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <button
            onClick={() => setOpenImage(null)}
            className="absolute top-4 right-4 text-white text-2xl font-bold"
          >
            ×
          </button>

          <img
            src={openImage}
            alt="preview"
            className="max-h-[90vh] max-w-full rounded-2xl object-contain"
          />
        </div>
      )}
    </>
  );
}