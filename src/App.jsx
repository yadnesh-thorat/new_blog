import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeContext";
import { AnalyticsProvider } from "@/lib/analytics";

// Visitor Pages
import HomePage from "./app/(visitor)/page.jsx";
import AboutPage from "./app/(visitor)/about/page.jsx";
import ContactPage from "./app/(visitor)/contact/page.jsx";
import CategoriesPage from "./app/(visitor)/categories/page.jsx";
import BlogDetailPage from "./app/(visitor)/blogs/[slug]/page.jsx";
import NotFoundPage from "./app/(visitor)/NotFoundPage.jsx";

// Admin Pages
import AdminLayout from "./app/(admin)/admin/layout.jsx";
import AdminLoginPage from "./app/(admin)/admin/login/page.jsx";
import AdminDashboardPage from "./app/(admin)/admin/dashboard/page.jsx";
import AdminBlogsPage from "./app/(admin)/admin/blogs/page.jsx";
import AdminCategoriesPage from "./app/(admin)/admin/categories/page.jsx";
import AdminContactsPage from "./app/(admin)/admin/contacts/page.jsx";
import AdminNewsletterPage from "./app/(admin)/admin/newsletter/page.jsx";
import AdminMediaPage from "./app/(admin)/admin/media/page.jsx";
import AdminSettingsPage from "./app/(admin)/admin/settings/page.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <AnalyticsProvider />
          <div className="flex-1 flex flex-col">
            <Routes>
              {/* Visitor Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/blogs/:slug" element={<BlogDetailPage />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLoginPage />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="blogs" element={<AdminBlogsPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="contacts" element={<AdminContactsPage />} />
                <Route path="newsletter" element={<AdminNewsletterPage />} />
                <Route path="media" element={<AdminMediaPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
