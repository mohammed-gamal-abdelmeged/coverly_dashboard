import React, { useEffect, useMemo, useState } from "react";
import { Search, Trash2, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import OrderCard from "../components/orders/OrderCard.jsx";
import { ordersApi } from "../services/api.js";

const STATUS_TABS = [
  { key: "all", label: "الكل" },
  { key: "pending", label: "بانتظار التأكيد" },
  { key: "confirmed", label: "مؤكد" },
  { key: "preparing", label: "جاري التجهيز" },
  { key: "delivered", label: "تم التسليم" },
  { key: "canceled", label: "ملغي" },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeStatus, setActiveStatus] = useState("all");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);

  const loadOrders = async (opts) => {
    setLoading(true);
    try {
      const res = await ordersApi.listOrders(opts);
      setOrders(res);
    } finally {
      setLoading(false);
    }
  };

  // تحميل أولي + تغيير تبويب
  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await ordersApi.listOrders({ status: activeStatus, q: "" });
        if (!ignore) setOrders(res);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [activeStatus]);

  // ✅ Sync سريع من الكاش عند الرجوع للصفحة (Focus / Visibility)
  useEffect(() => {
    let alive = true;

    const syncFromCache = async () => {
      try {
        const res = await ordersApi.listOrders({ status: activeStatus, q });
        if (alive) setOrders(res);
      } catch {
        // ignore
      }
    };

    const onFocus = () => syncFromCache();
    const onVis = () => {
      if (document.visibilityState === "visible") syncFromCache();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      alive = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [activeStatus, q]);

  const onSearch = async (e) => {
    e.preventDefault();
    await loadOrders({ status: activeStatus, q });
  };

  const onRefresh = async () => {
    setQ("");
    await loadOrders({ status: activeStatus, q: "" });
  };

  const onDeleteAll = async () => {
    const ok = confirm("تحذير: هيتحذف كل الطلبات نهائيًا من الداتا بيز. متأكد؟");
    if (!ok) return;

    setLoading(true);
    try {
      await ordersApi.deleteAllOrders();
      setOrders([]);
      setQ("");
      setActiveStatus("all");
      alert("تم حذف كل الطلبات بنجاح.");
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء حذف الطلبات");
    } finally {
      setLoading(false);
    }
  };

  const emptyTitle = useMemo(() => {
    if (activeStatus === "all") return "مفيش طلبات لسه";
    const tab = STATUS_TABS.find((t) => t.key === activeStatus);
    return `مفيش طلبات في حالة: ${tab?.label || ""}`;
  }, [activeStatus]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl font-bold">الطلبات</h1>

        <div className="flex items-center gap-2">
          <span className="text-white/50 text-sm">
            {loading ? "..." : `${orders.length} طلب`}
          </span>

          <button
            onClick={onRefresh}
            disabled={loading}
            className={`flex items-center gap-2 px-3 py-2 rounded-2xl border transition text-sm font-semibold
              ${
                loading
                  ? "opacity-50 cursor-not-allowed bg-white/5 border-white/10 text-white/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10 text-white/80"
              }`}
            title="تحديث الطلبات"
          >
            <RefreshCw size={16} />
            ريفريش
          </button>

          <button
            onClick={onDeleteAll}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition text-red-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            title="حذف كل الطلبات"
          >
            <Trash2 size={16} />
            حذف الكل
          </button>
        </div>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
          <Search size={18} className="text-white/50" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث برقم الطلب أو رقم الموبايل أو الاسم"
            className="w-full bg-transparent outline-none text-sm placeholder:text-white/40"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-2xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          بحث
        </button>
      </form>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_TABS.map((t) => {
          const active = t.key === activeStatus;
          return (
            <button
              key={t.key}
              onClick={() => setActiveStatus(t.key)}
              className={`whitespace-nowrap px-3 py-2 rounded-2xl text-sm border transition ${
                active
                  ? "bg-[#6B3AA8]/25 border-[#9B6DFF]/40 text-[#D9C7FF]"
                  : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            جاري تحميل الطلبات...
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            {emptyTitle}
          </div>
        ) : (
          orders.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              onOpen={() =>
                navigate(`/admin/orders/${o.id}`, {
                  state: { orderSummary: o },
                })
              }
            />
          ))
        )}
      </div>
    </div>
  );
}