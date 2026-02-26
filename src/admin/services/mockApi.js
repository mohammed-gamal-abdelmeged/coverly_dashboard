const STORAGE_KEY = "coverly_admin_orders";

const seedOrders = () => {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return;

  const now = new Date();
  const iso = (minsAgo) => new Date(now.getTime() - minsAgo * 60000).toISOString();

  const demo = [
    {
      id: "1002",
      customer_name: "سارة علي",
      phone: "01198765432",
      governorate: "الجيزة",
      city: "الدقي",
      address_details: "شارع التحرير",
      total: 300,
      status: "confirmed",
      payment_method: "transfer",
      payment_screenshot_url: "/proof.png",
      created_at: iso(25),
      items: [
        { product_id: "p3", title: "كفر جلد OPPO", price: 300, qty: 1, image_url: "/case3.png" },
      ],
    },
    {
      id: "1001",
      customer_name: "أحمد محمد",
      phone: "01012345678",
      governorate: "القاهرة",
      city: "مدينة نصر",
      address_details: "شارع عباس العقاد",
      total: 450,
      status: "pending",
      payment_method: "transfer",
      payment_screenshot_url: "/proof.png",
      created_at: iso(5),
      items: [
        { product_id: "p1", title: "كفر شفاف iPhone 14", price: 250, qty: 1, image_url: "/case1.png" },
        { product_id: "p2", title: "كفر سيليكون Samsung", price: 200, qty: 1, image_url: "/case2.png" },
      ],
    },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
};

const getAll = () => {
  seedOrders();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const saveAll = (orders) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
};

export const mockOrdersApi = {
  async listOrders({ status = "all", q = "" }) {
    let orders = getAll();

    if (status !== "all") orders = orders.filter((o) => o.status === status);

    if (q.trim()) {
      const query = q.trim();
      orders = orders.filter(
        (o) => o.id.includes(query) || o.phone.includes(query) || o.customer_name.includes(query)
      );
    }

    return orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  },

  async getOrder(id) {
    const orders = getAll();
    return orders.find((o) => o.id === id);
  },

  async updateOrderStatus(id, status) {
    const orders = getAll();
    const updated = orders.map((o) => (o.id === id ? { ...o, status } : o));
    saveAll(updated);
    return true;
  },

  async createOrder(payload) {
    const orders = getAll();
    const newOrder = {
      ...payload,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    saveAll([newOrder, ...orders]);
    return newOrder;
  },
};
