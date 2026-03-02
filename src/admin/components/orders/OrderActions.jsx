import React from "react";
import { CheckCircle2, XCircle, Truck, PackageCheck } from "lucide-react";

export default function OrderActions({ status, onChangeStatus, loading }) {
  const Button = ({ icon: Icon, label, onClick, variant = "primary", disabled }) => {
    const base =
      "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition";
    const styles = {
      primary:
        "bg-[#6B3AA8] border-[#9B6DFF]/30 hover:bg-[#7c4dff] text-white",
      danger:
        "bg-red-500/15 border-red-500/30 hover:bg-red-500/25 text-red-200",
      success:
        "bg-green-500/15 border-green-500/30 hover:bg-green-500/25 text-green-200",
      neutral:
        "bg-white/5 border-white/10 hover:bg-white/10 text-white/80",
    };

    return (
      <button
        className={`${base} ${styles[variant]} ${
          disabled ? "opacity-50 cursor-not-allowed hover:bg-inherit" : ""
        }`}
        onClick={onClick}
        type="button"
        disabled={disabled}
      >
        <Icon size={18} />
        {label}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-white/80 font-semibold">إجراءات الطلب</div>
        <div className="text-xs text-white/40">
          {loading ? "جاري الحفظ..." : "اختر حالة جديدة"}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          icon={CheckCircle2}
          label="تأكيد الطلب"
          variant="primary"
          onClick={() => onChangeStatus("confirmed")}
          disabled={loading || status === "confirmed"}
        />

        <Button
          icon={PackageCheck}
          label="جاري التجهيز"
          variant="neutral"
          onClick={() => onChangeStatus("preparing")}
          disabled={loading || status === "preparing"}
        />

        <Button
          icon={Truck}
          label="تم التوصيل"
          variant="success"
          onClick={() => onChangeStatus("delivered")}
          disabled={loading || status === "delivered"}
        />

        <Button
          icon={XCircle}
          label="إلغاء الطلب"
          variant="danger"
          onClick={() => onChangeStatus("canceled")}
          disabled={loading || status === "canceled"}
        />
      </div>

      <div className="text-xs text-white/40">
        الحالة الحالية: <span className="text-white/70">{status}</span>
      </div>
    </div>
  );
}