import { apiClient } from "./apiClient";

export const productsApiHttp = {
  async listAll() {
    return await apiClient.get(`/products`);
  },

  async listByCategorySlug(categorySlug) {
    const qs = categorySlug ? `?category_slug=${encodeURIComponent(categorySlug)}` : "";
    return await apiClient.get(`/products${qs}`);
  },

  async create({ file, category_slug }) {
    // 1) upload image -> /upload/product
    const fd = new FormData();
    fd.append("file", file);

    const up = await apiClient.post(`/upload/product`, fd, { headers: {} });
    const image_url = up?.url;

    if (!image_url) throw new Error("Upload failed: missing url");

    // 2) create product record -> /products
    return await apiClient.post(`/products`, { image_url, category_slug });
  },

  async remove(productId) {
    return await apiClient.del(`/products/${productId}`);
  },
};