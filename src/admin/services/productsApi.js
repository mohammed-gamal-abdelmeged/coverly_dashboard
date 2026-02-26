import { supabase } from "./supabaseClient";

/**
 * ملاحظات:
 * - جدول products لازم فيه على الأقل: image_url (text), category_slug (text)
 * - Bucket اسمه: products (Public)
 */

const PRODUCTS_BUCKET = "products";

const extFromFile = (file) => {
  const name = file?.name || "";
  const m = name.match(/\.([a-zA-Z0-9]+)$/);
  return (m?.[1] || "png").toLowerCase();
};

const safeFileName = (str) =>
  String(str || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "");

const getPublicUrl = (path) => {
  const { data } = supabase.storage.from(PRODUCTS_BUCKET).getPublicUrl(path);
  return data?.publicUrl || "";
};

export const productsApi = {
  // ✅ جلب منتجات قسم معيّن (ده اللي انتِ محتاجاه)
  async listByCategorySlug(categorySlug) {
    const { data, error } = await supabase
      .from("products")
      .select("id,created_at,image_url,category_slug")
      .eq("category_slug", categorySlug)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ✅ جلب كل المنتجات (للاستخدام داخل الداش فقط)
  async listAll() {
    const { data, error } = await supabase
      .from("products")
      .select("id,created_at,image_url,category_slug")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // ✅ إضافة منتج: (صورة + قسم)
  async create({ file, category_slug }) {
    if (!file) throw new Error("لازم ترفعي صورة المنتج.");
    if (!category_slug?.trim()) throw new Error("لازم تختاري/تكتبي القسم.");

    const ext = extFromFile(file);
    const stamp = Date.now();
    const path = `covers/${safeFileName(category_slug)}/${stamp}.${ext}`;

    // 1) Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(PRODUCTS_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });

    if (uploadError) throw uploadError;

    // 2) Get public url
    const publicUrl = getPublicUrl(path);
    if (!publicUrl) throw new Error("فشل إنشاء رابط الصورة.");

    // 3) Insert DB row
    const { data, error: insertError } = await supabase
      .from("products")
      .insert({
        image_url: publicUrl,
        category_slug: category_slug.trim(),
      })
      .select("id,created_at,image_url,category_slug")
      .single();

    if (insertError) throw insertError;
    return data;
  },

  // ✅ حذف منتج (يحذف Row فقط — ومش هيحذف الصورة من Storage لتجنب أي مخاطرة)
  async remove(productId) {
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;
    return true;
  },
};