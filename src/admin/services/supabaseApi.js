import { supabase } from "./supabaseClient";

// ✅ بعد توحيد الداتا: status لازم يكون واحد من:
// pending | confirmed | preparing | delivered | canceled
const normalizeStatus = (s) => (s ? s : "pending");
const toDbStatus = (s) => s;

const mapOrderRow = (row) => {
  const products = Array.isArray(row.products) ? row.products : [];

  return {
    id: String(row.id),
    customer_name: row.customer_name || "",
    phone: row.customer_phone || "",
    governorate: row.governorate || "",
    city: "", // مش موجود عندك
    address_details: row.customer_address || "",
    notes: row.notes || "", // ✅ NEW
    total: Number(row.total_amount || 0),
    status: normalizeStatus(row.status),
    payment_screenshot_url: row.payment_image || "",
    created_at: row.created_at,
    items: products.map((p, idx) => ({
      product_id: String(p.product_id || p.id || idx),
      title: p.title || p.name || "منتج",
      price: Number(p.price || 0),
      qty: Number(p.qty || p.quantity || 1),
      image_url: p.image_url || p.image || "",
    })),
  };
};

export const supabaseOrdersApi = {
  async listOrders({ status = "all", q = "" }) {
    let query = supabase
      .from("orders")
      .select(
        "id,created_at,customer_name,customer_phone,customer_address,payment_image,total_amount,status,governorate,shipping_fee,notes"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    // ✅ فلتر الحالة (مباشر لأن الداتا اتوحدت)
    if (status !== "all") {
      query = query.eq("status", status);
    }

    // بحث بالاسم أو الموبايل
    if (q?.trim()) {
      const s = q.trim();
      query = query.or(
        `customer_name.ilike.%${s}%,customer_phone.ilike.%${s}%`
      );
    }

    const { data, error } = await query;
    if (error) throw error;

    // لو البحث رقم (id) فلتره محليًا
    let rows = data || [];
    if (q?.trim() && /^\d+$/.test(q.trim())) {
      rows = rows.filter((r) => String(r.id).includes(q.trim()));
    }

    return rows.map(mapOrderRow);
  },

  async getOrder(id) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (error) return null;
    return mapOrderRow(data);
  },

  async updateOrderStatus(id, status) {
    const { error } = await supabase
      .from("orders")
      .update({ status: toDbStatus(status) })
      .eq("id", Number(id));

    if (error) throw error;
    return true;
  },

  async createOrder(payload) {
    const row = {
      customer_name: payload.customer_name,
      customer_phone: payload.phone,
      customer_address: payload.address_details,
      governorate: payload.governorate,
      total_amount: payload.total,
      status: "pending", // ✅ default
      notes: payload.notes || null,
      payment_image: payload.payment_screenshot_url || null,
      products: payload.items || [],
      shipping_fee: payload.shipping_fee ?? null,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(row)
      .select("*")
      .single();

    if (error) throw error;
    return mapOrderRow(data);
  },

  async countAll() {
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true });

    if (error) throw error;
    return count || 0;
  },

  async countPending() {
    // ✅ بعد توحيد الداتا: pending فقط = بانتظار التأكيد
    const { count, error } = await supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");

    if (error) throw error;
    return count || 0;
  },

  async latest(limit = 5) {
    const { data, error } = await supabase
      .from("orders")
      .select(
        "id,created_at,customer_name,customer_phone,total_amount,status,governorate"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((row) => ({
      id: String(row.id),
      customer_name: row.customer_name || "",
      phone: row.customer_phone || "",
      total: Number(row.total_amount || 0),
      status: normalizeStatus(row.status), // ✅ بدون تحويلات
      governorate: row.governorate || "",
      created_at: row.created_at,
    }));
  },

  async deleteAllOrders() {
  // يحذف كل الصفوف (بدون شروط)
  const { error } = await supabase.from("orders").delete().neq("id", 0);
  if (error) throw error;
  return true;
},
};