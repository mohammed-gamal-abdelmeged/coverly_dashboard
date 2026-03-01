import React, { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, Power, RefreshCw } from "lucide-react";
import { discountsApi } from "../services/api.js";
export default function DiscountsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // form
  const [openAdd, setOpenAdd] = useState(false);
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState("");
  const [saving, setSaving] = useState(false);

  const canSave = useMemo(() => {
    const p = Number(percent);
    return code.trim().length >= 2 && Number.isFinite(p) && p > 0 && p <= 100;
  }, [code, percent]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await discountsApi.list();
      setItems(res);
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء تحميل الأكواد");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      try {
        const res = await discountsApi.list();
        if (!ignore) setItems(res);
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  const onCreate = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await discountsApi.create({
        code,
        discount_percent: Number(percent),
      });
      setCode("");
      setPercent("");
      setOpenAdd(false);
      await load();
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء الإضافة");
    } finally {
      setSaving(false);
    }
  };

  const onToggle = async (row) => {
    try {
      await discountsApi.setActive(row.id, !row.is_active);
      await load();
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء التغيير");
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`متأكد إنك عايز تحذف الكود: ${row.code} ؟`)) return;
    try {
      await discountsApi.remove(row.id);
      await load();
    } catch (e) {
      alert(e?.message || "حصل خطأ أثناء الحذف");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">الخصومات</h1>

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
            إضافة كود
          </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            جاري تحميل الأكواد...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white/60">
            لا توجد أكواد خصم.
          </div>
        ) : (
          items.map((row) => (
            <div
              key={row.id}
              className="rounded-2xl border border-white/10 bg-[#0B0814]/80 backdrop-blur-md p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#9B6DFF] tracking-wide">
                    {row.code}
                  </span>

                  <span className="text-xs px-2 py-1 rounded-xl border border-white/10 bg-white/5 text-white/70">
                    خصم {row.discount_percent}%
                  </span>

                  {row.is_active ? (
                    <span className="text-xs px-2 py-1 rounded-xl border border-green-500/20 bg-green-500/10 text-green-200">
                      فعال
                    </span>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-xl border border-red-500/20 bg-red-500/10 text-red-200">
                      متوقف
                    </span>
                  )}
                </div>

                <div className="text-xs text-white/50 mt-2">
                  #{row.id} •{" "}
                  {row.created_at ? new Date(row.created_at).toLocaleString() : ""}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onToggle(row)}
                  className="h-10 px-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm flex items-center gap-2"
                  title="تفعيل/تعطيل"
                >
                  <Power size={16} />
                  {row.is_active ? "إيقاف" : "تفعيل"}
                </button>

                <button
                  onClick={() => onDelete(row)}
                  className="h-10 px-3 rounded-xl bg-red-500/15 border border-red-500/30 hover:bg-red-500/25 transition text-red-200 text-sm flex items-center gap-2"
                  title="حذف"
                >
                  <Trash2 size={16} />
                  حذف
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {openAdd ? (
        <div className="fixed inset-0 z-[999] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-3">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0B0814] p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">إضافة كود خصم</h2>
              <button
                onClick={() => setOpenAdd(false)}
                className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm"
              >
                إغلاق
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm text-white/70 mb-2">الكود</div>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="مثال: COVERLY20"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/40"
                />
              </div>

              <div>
                <div className="text-sm text-white/70 mb-2">نسبة الخصم (%)</div>
                <input
                  value={percent}
                  onChange={(e) => setPercent(e.target.value)}
                  placeholder="مثال: 20"
                  inputMode="numeric"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm outline-none placeholder:text-white/40"
                />
              </div>

              <div className="text-xs text-white/50">
                * الكود بيتحوّل تلقائيًا لحروف كبيرة.
              </div>
            </div>

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