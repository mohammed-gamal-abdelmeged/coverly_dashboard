const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "");

async function request(path, { method = "GET", body, headers } = {}) {
  if (!BASE) throw new Error("VITE_API_BASE is missing. Check .env and restart dev server.");

  const url = `${BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(headers || {}),
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : "") ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const apiClient = {
  get: (path) => request(path),
  post: (path, body, opts) => request(path, { method: "POST", body, ...(opts || {}) }),
  patch: (path, body, opts) => request(path, { method: "PATCH", body, ...(opts || {}) }),
  put: (path, body, opts) => request(path, { method: "PUT", body, ...(opts || {}) }),
  del: (path) => request(path, { method: "DELETE" }),
};

// (اختياري) للتأكد فقط أثناء التطوير
console.log("VITE_API_BASE =", import.meta.env.VITE_API_BASE);