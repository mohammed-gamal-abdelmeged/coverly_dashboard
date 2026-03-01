const BASE = import.meta.env.VITE_API_BASE;

async function jsonFetch(url, options) {
  const r = await fetch(url, options);
  const data = await r.json().catch(() => null);
  if (!r.ok) throw new Error(data?.error || "Request failed");
  return data;
}

export const feedbacksApi = {
  async list() {
    return jsonFetch(`${BASE}/feedbacks`);
  },

  async upload(file) {
    const fd = new FormData();
    fd.append("file", file);
    return jsonFetch(`${BASE}/upload/feedback`, { method: "POST", body: fd });
  },

  async createByUrl(image_url) {
    return jsonFetch(`${BASE}/feedbacks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url }),
    });
  },

  async createFromFile(file) {
    const up = await this.upload(file); // { url }
    return this.createByUrl(up.url);
  },

  // ✅ جديد: يضيف كذا صورة مرة واحدة (واحدة واحدة عشان Cloudinary)
  async createManyFromFiles(files, onProgress) {
    const arr = Array.from(files || []);
    const results = [];

    for (let i = 0; i < arr.length; i++) {
      const f = arr[i];
      onProgress?.({ current: i + 1, total: arr.length, file: f });
      const created = await this.createFromFile(f);
      results.push(created);
    }

    return results;
  },

  async remove(id) {
    return jsonFetch(`${BASE}/feedbacks/${id}`, { method: "DELETE" });
  },
};