import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2, Image as ImageIcon, RefreshCw, Upload, X } from "lucide-react";
import { feedbacksApi } from "../services/feedbacksApi.js";

export default function FeedbacksPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add form
  const [openAdd, setOpenAdd] = useState(false);
  const [files, setFiles] = useState([]); // ✅ multiple
  const [previews, setPreviews] = useState([]); // ✅ preview urls
  const [saving, setSaving] = useState(false);

  // ✅ Progress (عدد الصور)
  const [uploadTotal, setUploadTotal] = useState(0);
  const [uploadDone, setUploadDone] = useState(0);
  const [uploadName, setUploadName] = useState("");

  const fileInputRef = useRef(null);

  const canSave = useMemo(() => files.length > 0, [files]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await feedbacksApi.list();
      setItems(Array.isArray(res) ? res : []);
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء تحميل الفيدباكس");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await feedbacksApi.list();
        if (!ignore) setItems(Array.isArray(res) ? res : []);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // ✅ إنشاء previews + تنظيفها
  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  const onPickFiles = (e) => {
    const picked = Array.from(e.target.files || []);
    if (!picked.length) return;

    // ✅ نفس منطق المنتجات (حد كبير)
    const next = [...files, ...picked].slice(0, 100);
    setFiles(next);

    // عشان تقدر تختار نفس الملف تاني
    e.target.value = "";
  };

  const removeFileAt = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const resetAddModal = () => {
    if (saving) return;
    setOpenAdd(false);
    setFiles([]);
    setUploadTotal(0);
    setUploadDone(0);
    setUploadName("");
  };

  const onCreate = async () => {
    if (!canSave) return;

    setSaving(true);

    // ✅ تهيئة الـ progress
    const total = files.length;
    setUploadTotal(total);
    setUploadDone(0);
    setUploadName("");

    try {
      // ✅ رفع واحد واحد (زي المنتجات)
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setUploadName(f?.name || `صورة ${i + 1}`);

        try {
          // ✅ يرفع الصورة ثم يسجلها في feedbacks
          await feedbacksApi.createFromFile(f);
        } finally {
          // ✅ حتى لو صورة فشلت، العداد يتحرك
          setUploadDone(i + 1);
        }
      }

      setFiles([]);
      setOpenAdd(false);
      await load();
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء حفظ الفيدباكس");
    } finally {
      setSaving(false);
      setUploadName("");
      setUploadTotal(0);
      setUploadDone(0);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("متأكد إنك عايز تحذف الـ Feedback؟")) return;
    try {
      await feedbacksApi.remove(id);
      await load();
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء الحذف");
    }
  };

  const percent = useMemo(() => {
    if (!uploadTotal) return 0;
    return Math.round((uploadDone / uploadTotal) * 100);
  }, [uploadDone, uploadTotal]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">آراء العملاء (Feedbacks)</h1>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
            title="تحديث"
          >
            <RefreshCw size={18} />
          </button>

          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition text-sm font-semibold"
          >
            <Plus size={16} />
            إضافة Feedback
          </button>
        </div>
      </div>

      {/* قائمة الفيدباكس */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            جاري تحميل الفيدباكس...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            لا يوجد Feedbacks حالياً.
          </div>
        ) : (
          items.map((f) => (
            <div
              key={f.id}
              className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-3 flex gap-3"
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/10 bg-black/20 flex-shrink-0">
                <img
                  src={f.image_url}
                  alt="feedback"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex-1">
                <div className="text-sm text-white/60">#{f.id}</div>
                <div className="font-semibold mt-1">Feedback Image</div>
                <div className="text-xs text-white/50 mt-1">
                  {f.created_at ? new Date(f.created_at).toLocaleString() : ""}
                </div>
              </div>

              <button
                onClick={() => onDelete(f.id)}
                className="h-10 px-3 rounded-xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition text-red-200 text-sm flex items-center gap-2"
              >
                <Trash2 size={16} />
                حذف
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modal Add - نفس هندلة المنتجات */}
      {openAdd ? (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0814] p-4 space-y-4">
            {/* ✅ Progress Overlay حقيقي */}
            {saving ? (
              <div className="absolute inset-0 z-10 rounded-3xl bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-[#0B0814]/95 p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">
                        جاري رفع الصور... {percent}%
                      </div>
                      <div className="text-xs text-white/60 truncate">
                        {uploadName ? `الآن: ${uploadName}` : " "}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-white/70">
                    <span>تم</span>
                    <span>
                      {uploadDone}/{uploadTotal || 0}
                    </span>
                  </div>

                  {/* ✅ بار حقيقي */}
                  <div className="h-2 w-full rounded-full bg-black/40 overflow-hidden border border-white/10">
                    <div
                      className="h-full bg-[#6B3AA8] transition-[width] duration-300"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <div className="text-[11px] text-white/50">
                    كل ما يخلص Upload لصورة، البار هيتحرك.
                  </div>
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">إضافة Feedback</h2>
              <button
                onClick={resetAddModal}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              >
                إغلاق
              </button>
            </div>

            {/* ✅ Upload UI نضيف + multiple */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <ImageIcon size={18} />
                صور الفيدباك
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={onPickFiles}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-2xl border border-dashed border-white/20 bg-black/20 hover:bg-black/30 transition px-4 py-4 flex items-center justify-center gap-2 text-sm text-white/80"
              >
                <Upload size={18} />
                اختار صور (ممكن أكتر من صورة)
              </button>

              {files.length ? (
                <div className="grid grid-cols-4 gap-2">
                  {previews.map((src, idx) => (
                    <div
                      key={src}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/30"
                    >
                      <img
                        src={src}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeFileAt(idx)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 hover:bg-black/80 border border-white/10"
                        title="إزالة"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-white/50">
                  اختار صور للفيدباك. (حد أقصى 100 صورة)
                </div>
              )}
            </div>

            {/* ✅ زر الحفظ موجود دايمًا زي المنتجات */}
            <button
              disabled={!canSave || saving}
              onClick={onCreate}
              className={`w-full rounded-2xl px-4 py-3 font-semibold transition ${
                !canSave || saving
                  ? "bg-white/10 text-white/40 cursor-not-allowed"
                  : "bg-[#6B3AA8] hover:bg-[#7c4dff]"
              }`}
            >
              {saving ? "جاري الحفظ..." : "حفظ"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}