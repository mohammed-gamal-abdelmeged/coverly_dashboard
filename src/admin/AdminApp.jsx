import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout.jsx";

// Pages
import DashboardHome from "./pages/DashboardHome.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import CategoriesPage from "./pages/CategoriesPage.jsx";
import DiscountsPage from "./pages/DiscountsPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import OrderDetailsPage from "./pages/OrderDetailsPage.jsx";

export default function AdminApp() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="home" replace />} />

        <Route path="home" element={<DashboardHome />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="discounts" element={<DiscountsPage />} />

        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />

        <Route path="*" element={<Navigate to="home" replace />} />
      </Route>
    </Routes>
  );
}
