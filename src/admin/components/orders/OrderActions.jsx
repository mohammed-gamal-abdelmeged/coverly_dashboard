import React from "react";
import { CheckCircle2, XCircle, Truck, PackageCheck } from "lucide-react";

export default function OrderActions({ status, onChangeStatus }) {
  const Button = ({ icon: Icon, label, onClick, variant = "primary" }) => {
    const base =
      "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold transition";
    const styles = {
      primary: "bg-[#6B3AA8] border-[#9B6DFF]/30 hover:bg-[#7c4dff]",
      danger: "bg-red-500/15 border-red-500/30 hover:bg-red-500/25 text-red-200",
      success:
        "bg-green-500/15 border-green-500/30 hover:bg-green-500/25 text-green-200",
    };

    return (
      <button className={`${base} ${styles[variant]}`} onClick={onClick} type="button">
        <Icon size={18} />
        {label}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
      <h2 className="text-base font-semibold">إجراءات الطلب</h2>

      {status === "pending" ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            icon={CheckCircle2}
            label="تأكيد"
            variant="success"
            onClick={() => onChangeStatus("confirmed")}
          />
          <Button
            icon={XCircle}
            label="إلغاء"
            variant="danger"
            onClick={() => onChangeStatus("canceled")}
          />
        </div>
      ) : null}

      {status === "confirmed" ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            icon={Truck}
            label="جاري التجهيز"
            variant="primary"
            onClick={() => onChangeStatus("preparing")}
          />
          <Button
            icon={XCircle}
            label="إلغاء"
            variant="danger"
            onClick={() => onChangeStatus("canceled")}
          />
        </div>
      ) : null}

      {status === "preparing" ? (
        <div className="grid grid-cols-1 gap-3">
          <Button
            icon={PackageCheck}
            label="تم التسليم"
            variant="success"
            onClick={() => onChangeStatus("delivered")}
          />
        </div>
      ) : null}

      {status === "delivered" ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-3 text-sm text-green-200">
          تم تسليم الطلب ✅
        </div>
      ) : null}

      {status === "canceled" ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">
          تم إلغاء الطلب ❌
        </div>
      ) : null}
    </div>
  );
}
