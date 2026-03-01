import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { ordersApi } from "../services/api.js";

const STATUS_LABELS = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  preparing: "جاري التجهيز",
  delivered: "تم التسليم",
  canceled: "ملغي",
};

export default function DashboardHome() {
  const navigate = useNavigate();

  const [counts, setCounts] = useState({ total: 0, pending: 0 });
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [total, pending, last] = await Promise.all([
        ordersApi.countAll(),
        ordersApi.countPending(),
        ordersApi.latest(5), // ✅ summary خفيف
      ]);

      setCounts({ total, pending });
      setLatest(last || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      try {
        const [total, pending, last] = await Promise.all([
          ordersApi.countAll(),
          ordersApi.countPending(),
          ordersApi.latest(5),
        ]);

        if (!ignore) {
          setCounts({ total, pending });
          setLatest(last || []);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الرئيسية</h1>

        <button
          onClick={() => navigate("/admin/orders")}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition text-sm font-semibold"
        >
          <ShoppingCart size={16} />
          الطلبات
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 p-4">
          <div className="text-xs text-white/50">إجمالي الطلبات</div>
          <div className="text-2xl font-bold text-[#9B6DFF] mt-2">
            {loading ? "..." : counts.total}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 p-4">
          <div className="text-xs text-white/50">بانتظار التأكيد</div>
          <div className="text-2xl font-bold text-[#9B6DFF] mt-2">
            {loading ? "..." : counts.pending}
          </div>
        </div>
      </div>

      {/* Latest Orders */}
      <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">آخر الطلبات</h2>

          <button
            onClick={load}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
          >
            تحديث
          </button>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
            جاري التحميل...
          </div>
        ) : latest.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
            لا توجد طلبات.
          </div>
        ) : (
          <div className="space-y-2">
            {latest.map((o) => (
              <button
                key={o.id}
                onClick={() =>
                  navigate(`/admin/orders/${o.id}`, {
                    state: { orderSummary: o }, // ✅ ابعت summary للديتيلز
                  })
                }
                className="w-full text-right rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm text-white/70">#{o.id}</div>
                  <div className="text-xs px-2 py-1 rounded-xl border border-white/10 bg-black/20 text-white/70">
                    {STATUS_LABELS[o.status] || o.status}
                  </div>
                </div>

                <div className="mt-2 font-semibold">{o.customer_name}</div>
                <div className="mt-1 text-xs text-white/50">{o.governorate}</div>

                <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-2">
                  <div className="text-sm text-[#9B6DFF] font-bold">{o.total} جنيه</div>
                  <span className="inline-flex items-center gap-1 text-xs text-white/60">
                    فتح <ArrowLeft size={14} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60 text-sm">
        الآن: الهوم بيجيب Counts + Latest Summary بس، والـ Details تحمل التقيل عند الدخول.
      </div>
    </div>
  );
}