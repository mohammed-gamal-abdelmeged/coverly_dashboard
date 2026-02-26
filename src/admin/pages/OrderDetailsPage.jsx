import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Phone, MessageCircle, ArrowRight } from "lucide-react";
import { ordersApi } from "../services/api.js";
import PaymentProofViewer from "../components/orders/PaymentProofViewer.jsx";
import OrderItemsList from "../components/orders/OrderItemsList.jsx";
import OrderActions from "../components/orders/OrderActions.jsx";

const STATUS_LABELS = {
  pending: "بانتظار التأكيد",
  confirmed: "مؤكد",
  preparing: "جاري التجهيز",
  delivered: "تم التسليم",
  canceled: "ملغي",
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const o = await ordersApi.getOrder(id);
      setOrder(o || null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      const o = await ordersApi.getOrder(id);
      if (!ignore) {
        setOrder(o || null);
        setLoading(false);
      }
    })();
    return () => { ignore = true; };
  }, [id]);

  const whatsappLink = useMemo(() => {
    if (!order?.phone) return "#";
    const phone = order.phone.replace(/\D/g, "");
    const msg = encodeURIComponent(`مرحبًا ${order.customer_name}، بخصوص طلب رقم #${order.id}`);
    return `https://wa.me/2${phone}?text=${msg}`;
  }, [order]);

  const callLink = useMemo(() => (order?.phone ? `tel:${order.phone}` : "#"), [order]);

  const onChangeStatus = async (newStatus) => {
    if (!order) return;
    await ordersApi.updateOrderStatus(order.id, newStatus);
    await fetchOrder();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
        جاري تحميل الطلب...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => navigate("/admin/orders")}
          className="inline-flex items-center gap-2 text-white/70 hover:text-white"
        >
          <ArrowRight size={18} />
          رجوع للطلبات
        </button>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
          الطلب غير موجود.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button
        onClick={() => navigate("/admin/orders")}
        className="inline-flex items-center gap-2 text-white/70 hover:text-white"
      >
        <ArrowRight size={18} />
        رجوع للطلبات
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold">طلب رقم #{order.id}</h1>
            <p className="text-white/60 text-sm mt-1">
              الحالة: <span className="text-white">{STATUS_LABELS[order.status]}</span>
            </p>
          </div>

          <div className="text-right">
            <div className="text-white/60 text-xs">الإجمالي</div>
            <div className="text-2xl font-extrabold text-[#9B6DFF]">{order.total} جنيه</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-white/60 text-xs">العميل</div>
            <div className="text-base font-semibold">{order.customer_name}</div>
            <div className="text-sm text-white/60 mt-1">{order.phone}</div>
          </div>

          <div className="flex gap-2">
            <a
              href={callLink}
              className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
              title="اتصال"
            >
              <Phone size={18} />
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-2xl bg-[#6B3AA8]/30 border border-[#9B6DFF]/30 hover:bg-[#6B3AA8]/45 transition"
              title="واتساب"
            >
              <MessageCircle size={18} />
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-3 text-sm text-white/70 space-y-1">
          <div><span className="text-white/50">المحافظة:</span> {order.governorate}</div>
          <div><span className="text-white/50">المدينة:</span> {order.city}</div>
          <div><span className="text-white/50">العنوان:</span> {order.address_details}</div>
          {order.notes ? (
            <div><span className="text-white/50">ملاحظات:</span> {order.notes}</div>
          ) : null}
        </div>
      </div>

      <PaymentProofViewer url={order.payment_screenshot_url} />
      <OrderItemsList items={order.items || []} />
      <OrderActions status={order.status} onChangeStatus={onChangeStatus} />
    </div>
  );
}
