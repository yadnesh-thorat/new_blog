"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Search, Menu, X, ArrowRight, Layers, BookOpen, Globe, ChevronDown } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { useLanguage } from "./LanguageContext";
import { dbService } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const VisitorNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t, languages } = useLanguage();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("aether_settings_v2");
      return cached ? JSON.parse(cached) : null;
    } catch { return null; }
  });
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth < 1024;
    }
    return true;
  });

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      } else if (e.key === "Escape") {
        setSearchOpen(false);
        setMobileMenuOpen(false);
        setLangDropdownOpen(false);
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await dbService.getSettings();
        if (data) {
          setSettings(data);
          // Cache for instant navbar render on next page load
          try { localStorage.setItem("aether_settings_v2", JSON.stringify(data)); } catch {}
        }
      } catch (err) {
        console.error("Failed to load navbar settings:", err);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    async function loadData() {
      const allBlogs = await dbService.getBlogs(false);
      const allCats = await dbService.getCategories();
      setBlogs(allBlogs);
      setCategories(allCats);
    }
    if (searchOpen) loadData();
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const q = searchQuery.toLowerCase();
    setSearchResults(
      blogs.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
      )
    );
  }, [searchQuery, blogs]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = (mobileMenuOpen || searchOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, searchOpen]);

  const navLinks = [
    { name: t("nav_home"), href: "/" },
    { name: t("nav_categories"), href: "/categories" },
    { name: t("nav_about"), href: "/about" },
    { name: t("nav_contact"), href: "/contact" },
  ];

  const siteName = settings?.websiteName || "सत्यवेध";

  // Dynamic Favicon Syncing with Navbar Logo
  useEffect(() => {
    if (typeof document !== "undefined" && settings?.logoImage) {
      let favicon = document.querySelector("link[rel='icon']");
      if (!favicon) {
        favicon = document.createElement("link");
        favicon.rel = "icon";
        document.head.appendChild(favicon);
      }
      favicon.href = settings.logoImage;
    }
  }, [settings?.logoImage]);

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      {/* ─── HEADER ─────────────────────────────────────────────────── */}
      {/*
        Layout: position:relative wrapper. Logo on left (shrinks). 
        Right buttons use ml-auto and shrink-0 so they NEVER get pushed off.
      */}
      <header
        className={`fixed top-0 left-0 right-0 w-full z-50 transition-shadow duration-300 bg-background/95 backdrop-blur-xl border-b border-border/50 py-1 sm:py-1.5 ${
          scrolled ? "shadow-md shadow-black/5" : ""
        }`}
      >
        {/* Header container with clean flexbox spacing */}
        <div className="mx-auto max-w-7xl w-full flex items-center justify-between gap-1.5 sm:gap-3 px-2.5 sm:px-6 lg:px-8" style={{ minHeight: '60px' }}>

          {/* ── Logo ── */}
          <Link
            to="/"
            className="group flex items-center gap-3 shrink-0 min-w-0 max-w-[180px] sm:max-w-[300px] md:max-w-[420px] lg:max-w-[550px] h-13 sm:h-16 lg:h-20 relative overflow-hidden"
          >
            {settings?.logoImage && (
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={settings.logoImage}
                  alt={siteName}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
          </Link>

          {/* ── Desktop Nav (centered) ── */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`${(language === "mr" || language === "hi") ? "font-devanagari text-base sm:text-lg" : "font-grotesk text-base sm:text-lg md:text-[18px] tracking-tight"} font-bold transition-colors duration-200 py-1 relative select-none ${
                    isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-0 w-full h-[3px] bg-primary rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* ══ RIGHT ACTIONS ══ */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0, zIndex: 10 }}>
            {/* Search — expands inline from the icon */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              {searchOpen ? (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    height: '36px', padding: '0 10px 0 14px', borderRadius: '999px',
                    border: '1.5px solid var(--primary)', background: 'var(--card)',
                    boxShadow: '0 0 0 3px rgba(180,83,9,0.08)',
                    width: '240px', transition: 'width 0.2s ease',
                  }}
                >
                  <Search style={{ width: '15px', height: '15px', display: 'block', lineHeight: 0, color: 'var(--primary)', flexShrink: 0 }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchResults[0]) {
                        window.location.href = `/blogs/${searchResults[0].slug}`;
                        setSearchOpen(false); setSearchQuery('');
                      }
                    }}
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      fontSize: '13px', fontWeight: 500, color: 'var(--foreground)',
                      minWidth: 0,
                    }}
                  />
                  <button
                    onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: 'var(--muted-foreground)', flexShrink: 0 }}
                  >
                    <X style={{ width: '14px', height: '14px', display: 'block' }} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  aria-label="Search"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '36px', width: '36px', borderRadius: '999px',
                    border: '1px solid rgba(0,0,0,0.12)', background: 'var(--card)',
                    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', flexShrink: 0,
                  }}
                >
                  <Search style={{ width: '16px', height: '16px', display: 'block', lineHeight: 0, color: 'var(--primary)' }} />
                </button>
              )}
            </div>

            {/* Language Dropdown (sm+) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                aria-label="Change language"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  height: '36px', padding: '0 12px', borderRadius: '999px',
                  border: '1px solid rgba(0,0,0,0.12)', background: 'var(--card)',
                  color: 'var(--foreground)',
                  cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', flexShrink: 0,
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1, whiteSpace: 'nowrap', color: 'inherit' }}>Change Language</span>
                <ChevronDown style={{ width: '12px', height: '12px', display: 'block', lineHeight: 0, flexShrink: 0, transition: 'transform 0.2s', transform: langDropdownOpen ? 'rotate(180deg)' : 'none', color: 'inherit' }} />
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-44 rounded-xl border border-border/50 bg-card p-1 shadow-xl z-50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 pt-2 pb-1">Select Language</p>
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setLangDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-grotesk font-semibold rounded-lg transition-colors cursor-pointer ${
                          language === lang.code ? "bg-primary/10 text-primary font-bold" : "text-on-surface hover:bg-muted"
                        }`}
                      >
                        <span>{lang.name}</span>
                        {language === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '36px', width: '36px', borderRadius: '999px',
                border: '1px solid rgba(0,0,0,0.12)', background: 'var(--card)',
                cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.06)', flexShrink: 0,
                color: 'var(--primary)',
              }}
            >
              {theme === "light"
                ? <Moon style={{ width: '17px', height: '17px', flexShrink: 0, display: 'block', lineHeight: 0 }} />
                : <Sun style={{ width: '17px', height: '17px', flexShrink: 0, display: 'block', lineHeight: 0 }} />}
            </button>

            {/* Dashboard CTA (logged in) */}
            {user && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:flex"
                style={{
                  alignItems: 'center', justifyContent: 'center',
                  height: '36px', padding: '0 16px', borderRadius: '999px',
                  backgroundColor: '#b45309', color: '#ffffff',
                  fontSize: '13px', fontWeight: 700, gap: '6px',
                  boxShadow: '0 2px 8px rgba(180,83,9,0.35)', cursor: 'pointer',
                  textDecoration: 'none', fontFamily: 'var(--font-outfit, sans-serif)',
                }}
              >
                <span style={{ lineHeight: 1, color: '#ffffff', fontWeight: 700 }}>{t("nav_dashboard") || "Dashboard"}</span>
                <ArrowRight style={{ width: '14px', height: '14px', flexShrink: 0, display: 'block', lineHeight: 0, color: '#ffffff' }} />
              </Link>
            )}

            {/* ── Hamburger / Close — only on mobile/tablet ── */}
            {isMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen((prev) => !prev);
                }}
                aria-label="Toggle menu"
                className="flex items-center justify-center gap-1.5 px-3 h-8 sm:h-9 rounded-xl text-xs font-bold uppercase tracking-wider text-white cursor-pointer shrink-0 z-[65]"
                style={{
                  backgroundColor: '#b45309',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(180,83,9,0.4)',
                  letterSpacing: '0.04em',
                  minWidth: '64px',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                {mobileMenuOpen ? (
                  <>
                    <X className="h-4 w-4 shrink-0" style={{ strokeWidth: 2.5 }} />
                    <span className="font-outfit font-extrabold">Close</span>
                  </>
                ) : (
                  <>
                    <Menu className="h-4 w-4 shrink-0" style={{ strokeWidth: 2.5 }} />
                    <span className="font-outfit font-extrabold">Menu</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ─── NAVIGATION DRAWER ─────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm animate-fade-in"
            style={{ touchAction: 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              setMobileMenuOpen(false);
            }}
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-[60] w-72 sm:w-80 bg-background border-l border-border/50 shadow-2xl flex flex-col animate-slide-up"
            style={{ height: '100dvh', maxH: '100dvh' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              {settings?.logoImage ? (
                <div className="h-8 w-8 rounded-full overflow-hidden bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <img
                    src={settings.logoImage}
                    alt={settings?.websiteName || "सत्यवेध"}
                    className="h-full w-full object-contain"
                  />
                </div>
              ) : null}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMobileMenuOpen(false);
                }}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all border border-border/40 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-5 space-y-2 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-base transition-all ${
                      (language === "mr" || language === "hi") ? "font-devanagari font-bold" : "font-grotesk font-bold"
                    } ${
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-foreground/80 hover:text-primary hover:bg-muted/50"
                    }`}
                  >
                    <span>{link.name}</span>
                    {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </nav>

            {/* Language Selection in Drawer */}
            <div className="px-4 py-3 border-t border-border/40 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">भाषा / Language</span>
              <div className="flex gap-1.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                      language === lang.code
                        ? "bg-primary text-on-primary border-primary shadow-sm"
                        : "border-border/40 text-on-surface hover:bg-muted"
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {user && (
              <div className="px-4 pb-5 border-t border-border/40 pt-4">
                <Link
                  to="/admin/dashboard"
                  className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-on-primary shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:opacity-90 transition-all"
                >
                  {t("nav_dashboard")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── INLINE SEARCH RESULTS DROPDOWN ────────────────────────────────── */}
      {searchOpen && searchQuery.trim() && (
        <div
          style={{
            position: 'fixed', top: '68px', left: '50%', transform: 'translateX(-50%)',
            width: '520px', maxWidth: 'calc(100vw - 32px)',
            background: 'var(--background)', borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            zIndex: 60, maxHeight: '360px', overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {searchResults.length > 0 ? (
            <div style={{ padding: '8px' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted-foreground)', padding: '6px 8px 4px' }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </p>
              {searchResults.map((blog) => (
                <Link
                  key={blog.id}
                  to={`/blogs/${blog.slug}`}
                  onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 border border-transparent hover:border-border/30 transition-all group"
                >
                  {blog.coverImage && (
                    <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-border/30 bg-muted">
                      <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{blog.title}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      {blog.category && (
                        <>
                          <span className="bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase text-[9px]">{blog.category}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{blog.readingTime} min read</span>
                    </div>
                  </div>
                  <BookOpen className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px' }}>
              <Search className="h-7 w-7 text-muted-foreground/20 mx-auto mb-2" />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--foreground)' }}>No results for &ldquo;{searchQuery}&rdquo;</p>
              <p style={{ fontSize: '11px', color: 'var(--muted-foreground)', marginTop: '4px' }}>Try different keywords</p>
            </div>
          )}
        </div>
      )}
    </>
  );
};
