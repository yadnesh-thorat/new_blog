"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2 } from "lucide-react";
import { dbService } from "@/lib/db";
import { event } from "@/lib/analytics";
import confetti from "canvas-confetti";

import { useLanguage } from "./LanguageContext";

export const VisitorFooter = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await dbService.getSettings();
      const cats = await dbService.getCategories();
      setSettings(data);
      setCategories(cats);
    }
    loadData();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim() || loading) return;
    setLoading(true);
    try {
      const res = await dbService.subscribeNewsletter(email);
      if (res.success) {
        setSubscribed(true);
        setEmail("");
        event({ action: "newsletter_signup", category: "conversion", label: email });
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <footer className="w-full border-t border-border/40 py-8 text-center text-xs text-muted-foreground" style={{ backgroundColor: "var(--footer-bg)" }}>
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
          <span>Loading footer...</span>
        </div>
      </footer>
    );
  }

  const siteName = settings?.websiteName || "सत्यवेध";

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/10 text-on-surface-variant font-marathi-body">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          
          {/* Brand Info */}
          <div className="md:col-span-4 space-y-4">
            <div className="font-headline-sm text-headline-sm text-primary font-bold">{siteName}</div>
            <p className="text-on-surface-variant font-body-md max-w-sm leading-relaxed text-sm">
              {t("footer_tagline")}
            </p>
            {/* Social links */}
            <div className="flex gap-4 pt-2">
              {settings?.contactInfo?.socialLinks?.twitter && (
                <a
                  href={settings.contactInfo.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all hover:scale-105"
                  aria-label="Twitter / X"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {settings?.contactInfo?.socialLinks?.github && (
                <a
                  href={settings.contactInfo.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all hover:scale-105"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
              )}
              {settings?.contactInfo?.socialLinks?.linkedin && (
                <a
                  href={settings.contactInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 flex items-center justify-center border border-outline-variant/30 rounded-full text-on-surface-variant hover:text-primary hover:border-primary transition-all hover:scale-105"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4 uppercase tracking-wider text-xs">{t("links")}</h5>
            <nav className="flex flex-col gap-2.5">
              <Link to="/" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("nav_home")}</Link>
              <Link to="/categories" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("nav_categories")}</Link>
              <Link to="/about" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("nav_about")}</Link>
              <Link to="/contact" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("nav_contact")}</Link>
            </nav>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 space-y-4">
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4 uppercase tracking-wider text-xs">{t("information")}</h5>
            <nav className="flex flex-col gap-2.5">
              <Link to="/admin/login" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("nav_dashboard")}</Link>
              <a href="#" className="text-on-surface-variant hover:text-primary transition-colors text-sm">{t("editorial_policy")}</a>
            </nav>
          </div>

          {/* Newsletter Subscribe */}
          <div className="md:col-span-4 space-y-4">
            <h5 className="font-label-caps text-label-caps text-on-surface mb-4 uppercase tracking-wider text-xs">{t("subscription")}</h5>
            <p className="text-on-surface-variant text-sm">{t("subscription_text")}</p>
            
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 text-sm font-semibold py-2 animate-entrance">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {t("subscription_success")}
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex border-b border-outline-variant/60 focus-within:border-primary transition-colors mt-2">
                <input
                  type="email"
                  placeholder={t("email_placeholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-on-surface w-full py-2 px-3 outline-none text-sm placeholder:text-zinc-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-on-primary px-6 py-2 font-bold hover:bg-primary/90 transition-all rounded-sm flex items-center justify-center shrink-0 cursor-pointer text-xs uppercase tracking-wider"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                  ) : (
                    t("subscribe_button")
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="border-t border-outline-variant/10 mt-12 pt-8 text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-on-surface-variant/70">
            {settings?.footerText || `© 2026 ${siteName}. ${t("all_rights_reserved")}`}
          </p>
        </div>
      </div>
    </footer>
  );
};
