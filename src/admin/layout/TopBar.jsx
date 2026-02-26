import React from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const navigate = useNavigate();

  return (
    <header className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-[#0B0814]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="text-lg font-extrabold tracking-wide text-[#9B6DFF]">
        Coverly Admin
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition"
          aria-label="Search"
          title="بحث (قريباً)"
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          onClick={() => navigate("/admin/products")}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-[#6B3AA8] hover:bg-[#7c4dff] transition text-sm font-semibold"
        >
          <Plus size={16} />
          إضافة
        </button>
      </div>
    </header>
  );
}
