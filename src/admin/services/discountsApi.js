import { supabase } from "./supabaseClient";

const normCode = (code) => String(code || "").trim().toUpperCase();

export const discountsApi = {
  // عرض كل الأكواد
  async list() {
    const { data, error } = await supabase
      .from("promo_codes")
      .select("id,created_at,code,discount_percent,is_active,expires_at,usage_limit,used_count")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // إنشاء كود جديد
  async create({ code, discount_percent, expires_at = null, usage_limit = null, is_active = true }) {
    const c = normCode(code);
    const p = Number(discount_percent);

    if (!c) throw new Error("اكتبي الكود.");
    if (!Number.isFinite(p) || p <= 0 || p > 100) throw new Error("نسبة الخصم لازم تكون من 1 لـ 100.");

    const row = {
      code: c,
      discount_percent: Math.floor(p),
      expires_at,
      usage_limit,
      is_active,
    };

    const { data, error } = await supabase
      .from("promo_codes")
      .insert(row)
      .select("id,created_at,code,discount_percent,is_active,expires_at,usage_limit,used_count")
      .single();

    if (error) throw error;
    return data;
  },

  // تفعيل/إيقاف
  async setActive(id, is_active) {
    const { data, error } = await supabase
      .from("promo_codes")
      .update({ is_active })
      .eq("id", id)
      .select("id,created_at,code,discount_percent,is_active,expires_at,usage_limit,used_count")
      .single();

    if (error) throw error;
    return data;
  },

  // حذف
  async remove(id) {
    const { error } = await supabase.from("promo_codes").delete().eq("id", id);
    if (error) throw error;
    return true;
  },

  // ✅ للتحقق من الكود من السلة (هنستخدمها في الويبسايت)
  async validate(code) {
    const c = normCode(code);
    if (!c) return { ok: false, reason: "EMPTY" };

    const { data, error } = await supabase
      .from("promo_codes")
      .select("id,code,discount_percent,is_active,expires_at,usage_limit,used_count")
      .eq("code", c)
      .maybeSingle();

    if (error) throw error;
    if (!data) return { ok: false, reason: "NOT_FOUND" };
    if (!data.is_active) return { ok: false, reason: "INACTIVE" };

    if (data.expires_at) {
      const exp = new Date(data.expires_at).getTime();
      if (Date.now() > exp) return { ok: false, reason: "EXPIRED" };
    }

    if (data.usage_limit != null && (data.used_count || 0) >= data.usage_limit) {
      return { ok: false, reason: "LIMIT_REACHED" };
    }

    return { ok: true, data };
  },

  // ✅ زيادة العداد بعد إنشاء الأوردر (هنستخدمها بعدين)
  async incrementUsedCount(id) {
    // atomic update
    const { error } = await supabase.rpc("increment_promo_used_count", { promo_id: id });
    if (error) throw error;
    return true;
  },
};