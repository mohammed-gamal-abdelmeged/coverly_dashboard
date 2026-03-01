import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./layout/AdminLayout.jsx";

// Pages
import DashboardHome from "./pages/DashboardHome.jsx";
import ProductsPage from "./pages/ProductsPage.jsx";
import FeedbacksPage from "./pages/FeedbacksPage.jsx"; // ✅ NEW
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

        {/* ✅ بدل التصنيفات */}
        <Route path="feedbacks" element={<FeedbacksPage />} />

        <Route path="discounts" element={<DiscountsPage />} />

        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:id" element={<OrderDetailsPage />} />

        <Route path="*" element={<Navigate to="home" replace />} />
      </Route>
    </Routes>
  );
}