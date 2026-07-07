"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Send, CheckCircle2 } from "lucide-react";
import { dbService } from "@/lib/db";
import { event } from "@/lib/analytics";
import confetti from "canvas-confetti";

export const VisitorFooter = () => {
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
      <footer className="w-full border-t border-border/40 bg-muted/20 py-8 text-center text-xs text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/30 animate-pulse" />
          <span>Loading footer...</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full border-t border-border/40 bg-muted/15 transition-colors duration-300 relative overflow-hidden">
      {/* Top ambient gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 lg:gap-14">

          {/* Logo / Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="group inline-flex items-center gap-1.5">
              <span className="font-geist-sans text-xl font-bold tracking-tight text-foreground flex items-center gap-1.5 group-hover:opacity-80 transition-opacity">
                <span className="text-primary font-black group-hover:rotate-12 transition-transform duration-300 inline-block">✦</span>
                AETHER
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              {settings.seoDefaults.description}
            </p>
            {/* Social links in brand col */}
            <div className="flex gap-2 pt-1">
              {settings.contactInfo.socialLinks.twitter && (
                <a
                  href={settings.contactInfo.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-border/40"
                  aria-label="Twitter / X"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </a>
              )}
              {settings.contactInfo.socialLinks.github && (
                <a
                  href={settings.contactInfo.socialLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-border/40"
                  aria-label="GitHub"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                </a>
              )}
              {settings.contactInfo.socialLinks.linkedin && (
                <a
                  href={settings.contactInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all hover:scale-110 active:scale-90 border border-transparent hover:border-border/40"
                  aria-label="LinkedIn"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Home", href: "/" },
                { label: "Categories", href: "/categories" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link
                    to={href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-all hover:translate-x-1 duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 transition-all duration-200 overflow-hidden text-primary text-xs">›</span>
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 4).map((cat) => (
                <li key={cat.id}>
                  <Link
                    to={`/categories?filter=${cat.slug}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-all hover:translate-x-1 duration-200 inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-3 transition-all duration-200 overflow-hidden text-primary text-xs">›</span>
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscribe */}
          <div className="space-y-4 md:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Stay Updated</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Subscribe to get notifications of new technical articles and deep-dives.
            </p>

            {subscribed ? (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-semibold py-2 animate-entrance">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                Thanks for subscribing!
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2.5 mt-1">
                <input
                  type="email"
                  placeholder="name@domain.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground transition-all"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-shimmer w-full flex items-center justify-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-92 transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(99,102,241,0.2)] cursor-pointer"
                >
                  {loading ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Subscribe <Send className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Divider with gradient */}
        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-border/60 to-transparent" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">{settings.footerText}</p>
          <p className="text-xs text-muted-foreground/60">
            Built with ✦ by Aether Team
          </p>
        </div>
      </div>
    </footer>
  );
};
