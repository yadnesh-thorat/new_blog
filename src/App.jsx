import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/components/ThemeContext";
import { LanguageProvider } from "@/components/LanguageContext";
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

function expandHex(hex) {
  let clean = String(hex).replace(/^#/, '');
  if (clean.length === 3) {
    clean = clean.split('').map(char => char + char).join('');
  }
  return clean;
}

function hexToHslChannels(hex) {
  const clean = expandHex(hex);
  let r = parseInt(clean.substring(0, 2), 16) / 255;
  let g = parseInt(clean.substring(2, 4), 16) / 255;
  let b = parseInt(clean.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

function mixHexColors(color1, color2, weight) {
  const c1 = expandHex(color1);
  const c2 = expandHex(color2);

  const r1 = parseInt(c1.substring(0, 2), 16);
  const g1 = parseInt(c1.substring(2, 4), 16);
  const b1 = parseInt(c1.substring(4, 6), 16);

  const r2 = parseInt(c2.substring(0, 2), 16);
  const g2 = parseInt(c2.substring(2, 4), 16);
  const b2 = parseInt(c2.substring(4, 6), 16);

  const r = Math.round(r1 * weight + r2 * (1 - weight));
  const g = Math.round(g1 * weight + g2 * (1 - weight));
  const b = Math.round(b1 * weight + b2 * (1 - weight));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

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

  // Use admin-configured colors with high-contrast fallback for light mode
  const rawPrimaryLight = themeConfig?.primaryColorLight;
  const primaryLight = (!rawPrimaryLight || rawPrimaryLight.toLowerCase() === "#e8c086" || rawPrimaryLight.toLowerCase() === "#4f46e5") 
    ? "#b45309" 
    : rawPrimaryLight;
  const primaryDark = themeConfig?.primaryColorDark || "#e8c086";
  const footerLight = themeConfig?.footerBgColorLight || "#f8f9fa";
  const footerDark = themeConfig?.footerBgColorDark || "#0e0e0e";

  const bgLight = themeConfig?.bgLight || '#ffffff';
  const fgLight = themeConfig?.fgLight || '#0f0f0f';
  const cardLight = themeConfig?.cardLight || '#f9f9f9';
  const borderLight = themeConfig?.borderLight || '#e4e4e7';

  const bgDark = themeConfig?.bgDark || '#131313';
  const fgDark = themeConfig?.fgDark || '#e5e2e1';
  const cardDark = themeConfig?.cardDark || '#1a1a1a';
  const borderDark = themeConfig?.borderDark || '#4e453a';

  const mutedLight = mixHexColors(fgLight, bgLight, 0.05);
  const mutedFgLight = mixHexColors(fgLight, bgLight, 0.88);
  const accentLight = mixHexColors(fgLight, bgLight, 0.03);

  const mutedDark = mixHexColors(fgDark, bgDark, 0.08);
  const mutedFgDark = mixHexColors(fgDark, bgDark, 0.82);
  const accentDark = mixHexColors(fgDark, bgDark, 0.04);

  const FONT_FAMILIES = {
    "Noto Serif Devanagari": "'Noto Serif Devanagari', 'Noto Serif', serif",
    "IBM Plex Sans Devanagari": "'IBM Plex Sans Devanagari', 'IBM Plex Sans', sans-serif",
    "Hanken Grotesk": "'Hanken Grotesk', sans-serif",
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

  const headingFontVal = FONT_FAMILIES[themeConfig?.headingFont] || "'Noto Serif Devanagari', 'Noto Serif', serif";
  const bodyFontVal = FONT_FAMILIES[themeConfig?.bodyFont] || "'IBM Plex Sans Devanagari', 'IBM Plex Sans', sans-serif";

  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            {/* Preconnect to Google Fonts */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            {/* Load Devanagari / Marathi Google Fonts */}
            <link 
              href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Yatra+One&family=Rozha+One&family=Mukta:wght@400;500;600;700&family=Martel:wght@400;700&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Rajdhani:wght@500;600;700&family=Khand:wght@500;600;700&family=Teko:wght@500;600;700&family=Baloo+2:wght@500;600;700&family=Rasa:wght@400;700&family=Anek+Devanagari:wght@400;600;700&family=Noto+Serif:wght@400;600;700&family=IBM+Plex+Sans:wght@300;400;600&family=Hanken+Grotesk:wght@600;800&family=Noto+Serif+Devanagari:wght@400;600;700&family=IBM+Plex+Sans+Devanagari:wght@300;400;600&display=swap" 
              rel="stylesheet" 
            />
            <style>{`
              :root {
                --primary-color: ${primaryLight};
                --footer-bg: ${footerLight};
                --font-marathi-heading: ${headingFontVal};
                --font-marathi-body: ${bodyFontVal};
                --font-marathi-label-caps: 'Hanken Grotesk', sans-serif;

                /* Base HSL channel variable overrides for light mode */
                --background: ${hexToHslChannels(bgLight)};
                --foreground: ${hexToHslChannels(fgLight)};
                --card: ${hexToHslChannels(cardLight)};
                --card-foreground: ${hexToHslChannels(fgLight)};
                --popover: ${hexToHslChannels(cardLight)};
                --popover-foreground: ${hexToHslChannels(fgLight)};
                --primary: ${hexToHslChannels(primaryLight)};
                --primary-foreground: ${hexToHslChannels(bgLight)};
                --secondary: ${hexToHslChannels(cardLight)};
                --secondary-foreground: ${hexToHslChannels(fgLight)};
                --muted: ${hexToHslChannels(mutedLight)};
                --muted-foreground: ${hexToHslChannels(mutedFgLight)};
                --accent: ${hexToHslChannels(accentLight)};
                --accent-foreground: ${hexToHslChannels(fgLight)};
                --border: ${hexToHslChannels(borderLight)};
                --input: ${hexToHslChannels(borderLight)};
                --ring: ${hexToHslChannels(primaryLight)};

                /* Tailwind v4 theme variables overrides for light mode */
                --color-background: ${bgLight} !important;
                --color-foreground: ${fgLight} !important;
                --color-on-surface: ${fgLight} !important;
                --color-on-surface-variant: ${mutedFgLight} !important;
                --color-muted-foreground: ${mutedFgLight} !important;
                --color-card: ${cardLight} !important;
                --color-border: ${borderLight} !important;
                --color-outline-variant: ${borderLight} !important;
                --color-primary: ${primaryLight} !important;
              }
              .dark {
                --primary-color: ${primaryDark};
                --footer-bg: ${footerDark};

                /* Base HSL channel variable overrides for dark mode */
                --background: ${hexToHslChannels(bgDark)};
                --foreground: ${hexToHslChannels(fgDark)};
                --card: ${hexToHslChannels(cardDark)};
                --card-foreground: ${hexToHslChannels(fgDark)};
                --popover: ${hexToHslChannels(cardDark)};
                --popover-foreground: ${hexToHslChannels(fgDark)};
                --primary: ${hexToHslChannels(primaryDark)};
                --primary-foreground: ${hexToHslChannels(bgDark)};
                --secondary: ${hexToHslChannels(cardDark)};
                --secondary-foreground: ${hexToHslChannels(fgDark)};
                --muted: ${hexToHslChannels(mutedDark)};
                --muted-foreground: ${hexToHslChannels(mutedFgDark)};
                --accent: ${hexToHslChannels(accentDark)};
                --accent-foreground: ${hexToHslChannels(fgDark)};
                --border: ${hexToHslChannels(borderDark)};
                --input: ${hexToHslChannels(borderDark)};
                --ring: ${hexToHslChannels(primaryDark)};

                /* Tailwind v4 theme variables overrides for dark mode */
                --color-background: ${bgDark} !important;
                --color-foreground: ${fgDark} !important;
                --color-on-surface: ${fgDark} !important;
                --color-on-surface-variant: ${mutedFgDark} !important;
                --color-muted-foreground: ${mutedFgDark} !important;
                --color-card: ${cardDark} !important;
                --color-border: ${borderDark} !important;
                --color-outline-variant: ${borderDark} !important;
                --color-primary: ${primaryDark} !important;
              }
              body {
                background-color: var(--color-background) !important;
                color: var(--color-foreground) !important;
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
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
