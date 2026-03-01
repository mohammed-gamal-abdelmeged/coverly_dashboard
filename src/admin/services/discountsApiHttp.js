import { apiClient } from "./apiClient";

const norm = (c) => String(c || "").trim().toUpperCase();

export const discountsApiHttp = {
  async list() {
    return await apiClient.get(`/promo_codes`);
  },

  async create({ code, discount_percent, expires_at, usage_limit, is_active }) {
    return await apiClient.post(`/promo_codes`, {
      code: norm(code),
      discount_percent: Number(discount_percent) || 0,
      expires_at: expires_at || null,
      usage_limit: usage_limit ?? null,
      is_active: is_active ?? true,
    });
  },

  async setActive(id, is_active) {
    // ✅ endpoint الحقيقي في الباك
    return await apiClient.patch(`/promo_codes/${id}/active`, {
      is_active: Boolean(is_active),
    });
  },

  async validate(code) {
    const c = norm(code);
    if (!c) return { ok: false, reason: "EMPTY" };
    return await apiClient.get(`/promo_codes/validate?code=${encodeURIComponent(c)}`);
  },

  async remove(id) {
  return await apiClient.del(`/promo_codes/${id}`);
  },

  async incrementUsedCount() {
    // ❌ الباك مفيهوش increment endpoint
    throw new Error("Backend missing: POST /promo_codes/:id/increment");
  },
};