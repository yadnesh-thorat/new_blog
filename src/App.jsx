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
import AdminAdminsPage from "./app/(admin)/admin/admins/page.jsx";
import AdminProfilePage from "./app/(admin)/admin/profile/page.jsx";

import { useState, useEffect } from "react";
import { dbService } from "@/lib/db";

export default function App() {
  const [themeConfig, setThemeConfig] = useState(null);

  useEffect(() => {
    async function loadTheme() {
      try {
        const data = await dbService.getSettings();
        if (data && data.theme) {
          setThemeConfig(data.theme);
        }
      } catch (err) {
        console.error("Failed to load custom theme settings:", err);
      }
    }
    loadTheme();
  }, []);

  const primaryLight = themeConfig?.primaryColorLight || "#4f46e5";
  const primaryDark = themeConfig?.primaryColorDark || "#818cf8";
  const footerLight = themeConfig?.footerBgColorLight || "#f4f4f5";
  const footerDark = themeConfig?.footerBgColorDark || "#101014";

  const FONT_FAMILIES = {
    "Noto Sans Devanagari": "'Noto Sans Devanagari', sans-serif",
    "Poppins": "'Poppins', sans-serif",
    "Mukta": "'Mukta', sans-serif",
    "Yatra One": "'Yatra One', sans-serif",
    "Rozha One": "'Rozha One', sans-serif",
    "Martel": "'Martel', serif",
    "Rajdhani": "'Rajdhani', sans-serif",
    "Khand": "'Khand', sans-serif",
    "Teko": "'Teko', sans-serif",
    "Baloo 2": "'Baloo 2', sans-serif",
    "Rasa": "'Rasa', serif",
    "Anek Devanagari": "'Anek Devanagari', sans-serif",
  };

  const headingFontVal = FONT_FAMILIES[themeConfig?.headingFont] || "'Noto Sans Devanagari', sans-serif";
  const bodyFontVal = FONT_FAMILIES[themeConfig?.bodyFont] || "'Noto Sans Devanagari', sans-serif";

  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {/* Preconnect to Google Fonts */}
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          {/* Load Devanagari / Marathi Google Fonts */}
          <link 
            href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Yatra+One&family=Rozha+One&family=Mukta:wght@400;500;600;700&family=Martel:wght@400;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Khand:wght@500;600;700&family=Teko:wght@500;600;700&family=Baloo+2:wght@500;600;700&family=Rasa:wght@400;700&family=Anek+Devanagari:wght@400;600;700&display=swap" 
            rel="stylesheet" 
          />
          <style>{`
            :root {
              --primary-color: ${primaryLight};
              --footer-bg: ${footerLight};
              --font-marathi-heading: ${headingFontVal};
              --font-marathi-body: ${bodyFontVal};
            }
            .dark {
              --primary-color: ${primaryDark};
              --footer-bg: ${footerDark};
            }
          `}</style>
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
                <Route path="admins" element={<AdminAdminsPage />} />
                <Route path="profile" element={<AdminProfilePage />} />
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
