"use client";

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sun, Moon, Search, Menu, X, ArrowRight, Layers, BookOpen } from "lucide-react";
import { useTheme } from "./ThemeContext";
import { dbService } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export const VisitorNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [settings, setSettings] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
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
        if (data) setSettings(data);
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
    { name: "तपास", href: "/" },
    { name: "विषय सूची", href: "/categories" },
    { name: "आमच्याबद्दल", href: "/about" },
    { name: "संपर्क", href: "/contact" },
  ];

  const siteName = settings?.websiteName || "सत्यवेध";

  return (
    <>
      {/* ─── HEADER ──────────────────────────────────────────────────────── */}
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-border/20 ${
          scrolled ? "py-2.5 shadow-lg border-border/30" : "py-4"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 gap-6">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            {settings?.logoImage ? (
              <img
                src={settings.logoImage}
                alt={siteName}
                className="h-8 w-auto object-contain"
              />
            ) : (
              <span className="font-geist-sans text-xl font-bold tracking-tight text-primary select-none font-headline-md">
                {siteName}
              </span>
            )}
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`pb-1 font-semibold text-xs tracking-wider uppercase transition-all duration-200 font-marathi-body ${
                    isActive
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* ── Action Buttons ── */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="text-primary hover:scale-95 transition-transform flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/10"
              aria-label="Search"
            >
              <Search className="h-4.5 w-4.5" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="text-primary hover:scale-95 transition-transform flex items-center justify-center w-8 h-8 rounded-full hover:bg-primary/10"
              aria-label="Toggle theme"
            >
              {theme === "light"
                ? <Moon className="h-4.5 w-4.5" />
                : <Sun className="h-4.5 w-4.5" />}
            </button>

            {/* Dashboard CTA */}
            {user && (
              <Link
                to="/admin/dashboard"
                className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-sm bg-primary px-4 py-2 text-xs font-bold text-on-primary hover:bg-primary/90 transition-all font-marathi-body"
              >
                डॅशबोर्ड <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-primary hover:scale-95 transition-transform flex items-center justify-center w-8 h-8 rounded-full"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE DRAWER ───────────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 right-0 bottom-0 z-50 w-72 md:hidden bg-background border-l border-border/50 shadow-2xl flex flex-col animate-slide-up">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <span className="font-geist-sans text-base font-black text-foreground flex items-center gap-1.5">
                <span className="text-primary">✦</span> {siteName.toUpperCase()}
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all border border-border/40"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center justify-between py-3 px-4 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? "text-primary bg-primary/10 border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {link.name}
                    {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </Link>
                );
              })}
            </nav>

            {user && (
              <div className="px-4 pb-5 border-t border-border/40 pt-4">
                <Link
                  to="/admin/dashboard"
                  className="btn-shimmer flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-[0_4px_14px_rgba(99,102,241,0.25)] hover:opacity-90 transition-all"
                >
                  Dashboard <ArrowRight className="h-4 w-4" />
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
