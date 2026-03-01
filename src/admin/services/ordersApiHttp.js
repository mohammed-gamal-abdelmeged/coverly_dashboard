import { apiClient } from "./apiClient";

// pending | confirmed | preparing | delivered | canceled
const normalizeStatus = (s) => (s ? s : "pending");

// ✅ Summary mapper (خفيف - بدون items)
const mapOrderSummaryRow = (row) => {
  return {
    id: String(row.id),
    customer_name: row.customer_name || "",
    phone: row.customer_phone || "",
    governorate: row.governorate || "",
    total: Number(row.total_amount || 0),
    status: normalizeStatus(row.status),
    created_at: row.created_at,
  };
};

// ✅ Details mapper (كامل - items + notes لكل منتج)
const mapOrderDetailsRow = (row) => {
  // ⚠️ مهم جدًا: لو products جاي String من Postgres
  let products = [];

  if (Array.isArray(row.products)) {
    products = row.products;
  } else if (typeof row.products === "string") {
    try {
      products = JSON.parse(row.products);
    } catch {
      products = [];
    }
  }

  return {
    id: String(row.id),
    customer_name: row.customer_name || "",
    phone: row.customer_phone || "",
    governorate: row.governorate || "",
    city: "",
    address_details: row.customer_address || "",

    // ✅ ملاحظة الطلب العامة
    notes: row.notes || "",

    total: Number(row.total_amount || 0),
    status: normalizeStatus(row.status),
    payment_screenshot_url: row.payment_image || "",
    created_at: row.created_at,

    // ✅ ملاحظات كل منتج
    items: (products || []).map((p, idx) => ({
      product_id: String(p.product_id || p.id || idx),
      title: p.title || p.name || "منتج",
      price: Number(p.price || 0),
      qty: Number(p.qty || p.quantity || 1),
      image_url: p.image_url || p.image || "",
      notes: p.notes || "", // 👈 دي المهمة
    })),
  };
};

// =======================
// ✅ CACHES (منفصلين)
// =======================

let _cacheSummary = { at: 0, data: null };
const _cacheDetails = new Map(); // id -> { at, data }

const CACHE_MS = 3000; // 3 ثواني (لو عايزه 8: خليه 8000)

// =======================
// ✅ Helpers
// =======================

const filterAndSearch = (arr, { status = "all", q = "" } = {}) => {
  let out = Array.isArray(arr) ? arr : [];

  // فلترة محلية
  if (status !== "all") {
    out = out.filter((o) => o.status === status);
  }

  // بحث محلي
  if (q?.trim()) {
    const s = q.trim().toLowerCase();
    out = out.filter((o) => {
      const idMatch = String(o.id).includes(s);
      const nameMatch = (o.customer_name || "").toLowerCase().includes(s);
      const phoneMatch = (o.phone || "").toLowerCase().includes(s);
      return idMatch || nameMatch || phoneMatch;
    });
  }

  return out;
};

export const ordersApiHttp = {
  // =======================
  // ✅ LIST (Summary only)
  // =======================
  async listOrders({ status = "all", q = "" } = {}) {
    const now = Date.now();

    // ✅ 1) رجّع من كاش الـ Summary
    if (_cacheSummary.data && now - _cacheSummary.at < CACHE_MS) {
      const mapped = filterAndSearch(_cacheSummary.data, { status, q });
      return mapped.slice(0, 50);
    }

    // ✅ 2) لو مفيش كاش: هات من الباك (بس نعمل map Summary)
    const rows = await apiClient.get("/orders");

    const summary = (rows || []).map(mapOrderSummaryRow);

    // خزّن Summary في الكاش
    _cacheSummary = { at: Date.now(), data: summary };

    const mapped = filterAndSearch(summary, { status, q });
    return mapped.slice(0, 50);
  },

  // =======================
  // ✅ GET (Details only)
  // =======================
  async getOrder(id) {
    const key = String(id);
    const now = Date.now();
    const cached = _cacheDetails.get(key);

    // ✅ كاش للديتيلز (اختياري لكنه مفيد)
    if (cached && now - cached.at < CACHE_MS) {
      return cached.data;
    }

    const row = await apiClient.get(`/orders/${Number(id)}`);
    const mapped = mapOrderDetailsRow(row);

    _cacheDetails.set(key, { at: Date.now(), data: mapped });
    return mapped;
  },

  // =======================
  // ✅ UPDATE STATUS
  // =======================
  async updateOrderStatus(id, status) {
    // ✅ الباك عندك PUT مش PATCH
    await apiClient.put(`/orders/${Number(id)}/status`, { status });

    // ✅ تحديث كاش الديتيلز لو موجود
    const key = String(id);
    const cached = _cacheDetails.get(key);
    if (cached?.data) {
      _cacheDetails.set(key, {
        at: Date.now(),
        data: { ...cached.data, status: normalizeStatus(status) },
      });
    }

    // ✅ تحديث كاش الـ summary لو موجود (عشان الهوم/الليست يطلعوا الحالة صح)
    if (_cacheSummary?.data) {
      _cacheSummary = {
        at: Date.now(),
        data: _cacheSummary.data.map((o) =>
          String(o.id) === key ? { ...o, status: normalizeStatus(status) } : o
        ),
      };
    }

    return true;
  },

  // =======================
  // ✅ CREATE ORDER
  // =======================
  async createOrder(payload) {
    // الداش بيبعت payload بالـshape ده:
    // { customer_name, phone, address_details, governorate, total, notes, payment_screenshot_url, items, shipping_fee }
    // الباك مستني مفاتيح DB:
    const row = {
      customer_name: payload.customer_name,
      customer_phone: payload.phone,
      customer_address: payload.address_details,
      governorate: payload.governorate || null,
      shipping_fee: payload.shipping_fee ?? 0,
      notes: payload.notes || null,
      payment_image: payload.payment_screenshot_url || null,
      custom_design_url: payload.custom_design_url || null,
      total_amount: payload.total,
      products: payload.items || [],
    };

    const created = await apiClient.post("/orders", row);
    const details = mapOrderDetailsRow(created);

    // ✅ حدث الكاشات عشان الهوم/الليست يبانوا فورًا
    const summary = mapOrderSummaryRow(created);

    // insert في بداية Summary cache لو موجود
    if (_cacheSummary?.data) {
      _cacheSummary = { at: Date.now(), data: [summary, ..._cacheSummary.data] };
    }

    // store details cache
    _cacheDetails.set(String(details.id), { at: Date.now(), data: details });

    return details;
  },

  // =======================
  // ✅ LATEST (Summary)
  // =======================
  async latest(limit = 5) {
    const rows = await apiClient.get(
      `/orders/latest?limit=${Math.min(Number(limit) || 5, 50)}`
    );
    return (rows || []).map(mapOrderSummaryRow);
  },

  // =======================
  // ✅ STATS
  // =======================
  async countAll() {
    // ✅ بدل /orders/count -> /orders/stats
    const s = await apiClient.get("/orders/stats");
    return Number(s?.total ?? 0);
  },

  async countPending() {
    const s = await apiClient.get("/orders/stats");
    return Number(s?.pending ?? 0);
  },

  // =======================
  // ✅ DELETE ALL
  // =======================
  async deleteAllOrders() {
    // ✅ الباك عندك DELETE /orders
    await apiClient.del("/orders");

    // ✅ صفّر الكاشات
    _cacheSummary = { at: 0, data: [] };
    _cacheDetails.clear();

    return true;
  },

  // =======================
  // ✅ OPTIONAL: clear caches manually
  // =======================
  clearCache() {
    _cacheSummary = { at: 0, data: null };
    _cacheDetails.clear();
  },
};