import React from "react";

const STATUS_STYLES = {
  pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  preparing: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  delivered: "bg-green-500/20 text-green-300 border-green-500/30",
  canceled: "bg-red-500/20 text-red-300 border-red-500/30",
};

const STATUS_LABELS = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  preparing: "جاري التجهيز",
  delivered: "تم التسليم",
  canceled: "ملغي",
};

export default function OrderCard({ order, onOpen }) {
  return (
    <div
      onClick={onOpen}
      className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3 cursor-pointer hover:bg-white/5 transition"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/50">#{order.id}</span>

        <span className={`px-2 py-1 text-xs rounded-xl border ${STATUS_STYLES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-base">{order.customer_name}</h3>
        <p className="text-sm text-white/60">{order.phone}</p>
      </div>

      <div className="text-sm text-white/50">
        {order.governorate} - {order.city}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/10">
        <span className="text-white/60 text-sm">إجمالي الطلب</span>
        <span className="text-lg font-bold text-[#9B6DFF]">{order.total} جنيه</span>
      </div>
    </div>
  );
}
