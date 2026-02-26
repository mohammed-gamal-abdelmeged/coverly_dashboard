import React, { useEffect, useState } from "react";
import { Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import AdminApp from "./admin/AdminApp.jsx";

const ADMIN_PASS = "mody_toty_108";
const STORAGE_KEY = "coverly_admin_ok";

function SiteHome() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#07040F] text-white p-6">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-extrabold text-[#9B6DFF]">Coverly</h1>
        <p className="text-white/70">
          ده مشروع داشبورد MVP (Mobile First) شغال بـ Mock Data.
        </p>

        <Link
          to="/admin"
          className="inline-flex items-center justify-center w-full rounded-2xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition px-4 py-3 font-semibold"
        >
          افتح الداشبورد
        </Link>

        <p className="text-xs text-white/50">
          بعد ما تشتغل وتطمّن، هنبقى نبدّل الـ API إلى Supabase بدون تغيير UI.
        </p>
      </div>
    </div>
  );
}

function AdminGate({ children }) {
  const location = useLocation();
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    setOk(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (pass === ADMIN_PASS) {
      localStorage.setItem(STORAGE_KEY, "1");
      setOk(true);
      setErr("");
    } else {
      setErr("الباس غلط");
    }
  };

  // ✅ لو مش مصرح، اعرض شاشة إدخال الباس (وتمنع أي صفحة)
  if (!ok) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#07040F] text-white p-6 flex items-center">
        <div className="w-full max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-extrabold text-[#9B6DFF]">دخول الداشبورد</h1>
          <p className="text-white/60 text-sm">
            لازم تكتب الباس الأول عشان تفتح أي صفحة داخل الداشبورد.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="اكتب الباس هنا"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none text-sm placeholder:text-white/40"
              autoFocus
            />

            {err && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-red-200 text-sm">
                {err}
              </div>
            )}

            <button
              type="submit"
              className="w-full rounded-2xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition px-4 py-3 font-semibold"
            >
              دخول
            </button>

            <Link
              to="/"
              className="block text-center text-sm text-white/60 hover:text-white/80"
            >
              رجوع للصفحة الرئيسية
            </Link>

            {/* مجرد توضيح للمستخدم لو فتح لينك مباشر */}
            {location.pathname !== "/admin" && (
              <p className="text-xs text-white/40">
                انت بتحاول تفتح: <span className="text-white/60">{location.pathname}</span>
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ✅ مصرح: افتح الداشبورد الطبيعي
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SiteHome />} />

      {/* ✅ أي Route تحت /admin مش هيفتح غير بعد الباس */}
      <Route
        path="/admin/*"
        element={
          <AdminGate>
            <AdminApp />
          </AdminGate>
        }
      />

      {/* اختياري: لو حد كتب أي لينك غلط يرجع للصفحة الرئيسية */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}