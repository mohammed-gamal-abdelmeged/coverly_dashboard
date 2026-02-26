import React from "react";
import { NavLink } from "react-router-dom";
import { Home, Package, Grid, Tag, ShoppingCart } from "lucide-react";

const navItems = [
  { name: "الرئيسية", path: "/admin/home", icon: Home },
  { name: "المنتجات", path: "/admin/products", icon: Package },
  { name: "التصنيفات", path: "/admin/categories", icon: Grid },
  { name: "الخصومات", path: "/admin/discounts", icon: Tag },
  { name: "الطلبات", path: "/admin/orders", icon: ShoppingCart },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 right-0 left-0 h-20 bg-[#0B0814]/90 backdrop-blur-md border-t border-white/10 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center text-xs transition ${
                isActive ? "text-[#9B6DFF]" : "text-white/50 hover:text-white"
              }`
            }
          >
            <Icon size={20} />
            <span className="mt-1">{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
