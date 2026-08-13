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
                  className={`${language === "mr" ? "font-devanagari text-base sm:text-lg" : "font-grotesk text-base sm:text-lg md:text-[18px]"} font-bold tracking-tight transition-colors duration-200 py-1 relative select-none ${
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

          {/* ══ RIGHT ACTIONS — compact on mobile, always visible ══ */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 z-10">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:gap-1.5 sm:px-3 sm:py-1.5 rounded-full border border-border/40 bg-card text-on-surface hover:text-primary hover:border-primary/40 transition-all shadow-sm cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
              <span className="hidden sm:inline text-xs font-bold font-outfit">Search</span>
            </button>

            {/* Language Dropdown (sm+) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 text-xs font-grotesk font-bold px-3 py-1.5 rounded-full border border-border/40 hover:border-primary/40 bg-card text-on-surface hover:text-primary transition-all cursor-pointer shadow-sm"
              >
                <Globe className="h-3.5 w-3.5 text-primary" />
                <span className="uppercase tracking-wider">{language}</span>
                <ChevronDown className={`h-3 w-3 transition-transform ${langDropdownOpen ? "rotate-180" : ""}`} />
              </button>
              {langDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setLangDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border/50 bg-card p-1 shadow-xl z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { changeLanguage(lang.code); setLangDropdownOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-grotesk font-semibold rounded-lg transition-colors cursor-pointer ${
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
              className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-border/40 bg-card hover:bg-primary/10 text-primary hover:scale-105 transition-all shadow-sm cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            </button>

            {/* Dashboard CTA (logged in) */}
            {user && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-outfit font-black text-white hover:bg-primary/90 transition-all shadow-sm"
              >
                {t("nav_dashboard")} <ArrowRight className="h-3.5 w-3.5" />
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
                      language === "mr" ? "font-devanagari font-bold" : "font-grotesk font-bold"
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

      {/* ─── SEARCH MODAL ────────────────────────────────────────────────── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-md p-4 pt-16 sm:pt-24 animate-fade-in"
          onClick={() => setSearchOpen(false)}
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-border/40">
              <Search className="h-5 w-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search articles, categories, tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-sm"
              />
              <div className="flex items-center gap-2 shrink-0">
                <kbd className="hidden sm:inline-flex text-[9px] font-bold text-muted-foreground/50 bg-muted px-1.5 py-0.5 rounded border border-border/50">
                  ESC
                </kbd>
                <button
                  onClick={() => setSearchOpen(false)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[380px] overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="px-4 py-4 space-y-4">
                  {/* Categories quick access */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                      Browse Categories
                    </p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {categories.slice(0, 4).map((cat) => (
                        <Link
                          key={cat.id}
                          to={`/categories?filter=${cat.slug}`}
                          className="flex items-center gap-2.5 p-3 rounded-xl border border-border/30 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                          <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Layers className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {cat.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Tags */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1 mb-2">
                      Popular Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {["NextJS", "React", "TypeScript", "TailwindCSS", "Firebase", "UI/UX"].map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary border border-border/40 hover:border-primary/30 transition-all"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="px-3 py-3 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-2 mb-2">
                    {searchResults.length} result{searchResults.length !== 1 ? "s" : ""}
                  </p>
                  {searchResults.map((blog) => (
                    <Link
                      key={blog.id}
                      to={`/blogs/${blog.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 border border-transparent hover:border-border/30 transition-all group"
                    >
                      {blog.coverImage && (
                        <div className="w-12 h-10 rounded-lg overflow-hidden shrink-0 border border-border/30 bg-muted">
                          <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-sm font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {blog.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase text-[9px]">
                            {blog.category}
                          </span>
                          <span>•</span>
                          <span>{blog.readingTime} min read</span>
                        </div>
                      </div>
                      <BookOpen className="h-4 w-4 text-muted-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <Search className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">No results for &ldquo;{searchQuery}&rdquo;</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Try different keywords or browse categories</p>
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-3 border-t border-border/30 flex items-center justify-between">
              <p className="text-[10px] text-muted-foreground/50">
                Press <kbd className="font-bold bg-muted px-1 py-0.5 rounded border border-border/40 text-[9px]">↵</kbd> to open first result
              </p>
              <p className="text-[10px] text-muted-foreground/50">
                <kbd className="font-bold bg-muted px-1 py-0.5 rounded border border-border/40 text-[9px]">ESC</kbd> to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
