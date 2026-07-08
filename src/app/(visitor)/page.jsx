"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  Clock,
  Search,
  ChevronRight,
  ChevronLeft,
  Layers,
  TrendingUp,
  Mail,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { dbService } from "@/lib/db";
import { event } from "@/lib/analytics";
import confetti from "canvas-confetti";

export default function HomePage() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(null);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const allBlogs = await dbService.getBlogs(false);
        const allCats = await dbService.getCategories();
        const globalSettings = await dbService.getSettings();
        setBlogs(allBlogs);
        setCategories(allCats);
        setSettings(globalSettings);
      } catch (err) {
        console.error("❌ [Aether] Error loading data:", err);
      }
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
        event({ action: "newsletter_signup_hero", category: "conversion", label: email });
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!settings) {
    return (
      <>
        <div className="scroll-progress" />
        <VisitorNavbar />
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12">
          {/* Header skeleton */}
          <div className="border-b border-border/40 pb-5 mb-8">
            <div className="skeleton h-7 w-52 mb-2" />
            <div className="skeleton h-4 w-80" />
          </div>
          {/* Category pills skeleton */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {[80, 100, 70, 90, 110, 75].map((w, i) => (
              <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${w}px` }} />
            ))}
          </div>
          {/* News layout skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-8 w-1/2" />
              <div className="skeleton w-full aspect-video rounded-[2rem]" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="skeleton h-4 w-24" />
              <div className="border-t border-border/20 pt-6 flex gap-6">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-5 w-4/5" />
                  <div className="skeleton h-3 w-16" />
                </div>
                <div className="skeleton w-48 h-28 rounded-2xl" />
              </div>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-4">
              <div className="skeleton h-4 w-36" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border/30 p-4 space-y-2">
                  <div className="skeleton h-3 w-20 rounded-full" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="flex justify-between mt-1">
                    <div className="skeleton h-3 w-12" />
                    <div className="skeleton h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <VisitorFooter />
      </>
    );
  }

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filteredBlogs.length / postsPerPage);
  const paginatedBlogs = filteredBlogs.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const hasNewsLayout = currentPage === 1 && paginatedBlogs.length > 1;
  const mainArticle = hasNewsLayout ? paginatedBlogs[0] : null;
  const subArticle = hasNewsLayout && paginatedBlogs.length > 2 ? paginatedBlogs[1] : null;
  const sidebarArticles = hasNewsLayout
    ? (paginatedBlogs.length === 2 ? [paginatedBlogs[1]] : paginatedBlogs.slice(2))
    : [];

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <VisitorNavbar />

      {/* Latest Blogs Listing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="border-b border-border/40 pb-5 mb-8 flex justify-between items-end">
          <div>
            <h3 className="font-geist-sans text-2xl font-bold">Latest Publications</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Browse our most recent deep-dives and engineering guides.
            </p>
          </div>
          {selectedCategory !== "all" && (
            <button
              onClick={() => setSelectedCategory("all")}
              className="text-xs font-semibold text-primary hover:underline transition-all"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredBlogs.length > 0 ? (
          <div className="space-y-12">
            {hasNewsLayout ? (
              /* News Portal Grid Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-8 border-b border-border/30">
                {/* Left Section (Main + Sub Horizontal) */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Main Article (Left Top) */}
                  {mainArticle && (
                    <article className="space-y-4 group">
                      <Link to={`/blogs/${mainArticle.slug}`} className="block hover:text-primary transition-colors">
                        <h2 className="text-2xl sm:text-3.5xl font-black text-foreground font-geist-sans leading-tight tracking-tight">
                          {mainArticle.title}
                        </h2>
                      </Link>

                      {mainArticle.coverImage && (
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-[2rem] border border-border/30 shadow-md">
                          <img
                            src={mainArticle.coverImage}
                            alt={mainArticle.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                          />
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {mainArticle.excerpt}
                      </p>
                      
                      <div>
                        <Link to={`/blogs/${mainArticle.slug}`} className="text-primary hover:underline inline-flex items-center gap-1 font-bold text-sm">
                          Read More <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </article>
                  )}

                  {/* Sub Article (Left Bottom) */}
                  {subArticle && (
                    <article className="border-t border-border/20 pt-8 flex flex-col sm:flex-row gap-6 items-start group">
                      <div className="flex-1 space-y-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
                          {categories.find((c) => c.slug === subArticle.category)?.name || subArticle.category}
                        </span>
                        <Link to={`/blogs/${subArticle.slug}`} className="block hover:text-primary transition-colors">
                          <h3 className="text-lg sm:text-xl font-bold text-foreground font-geist-sans leading-snug">
                            {subArticle.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {subArticle.excerpt}
                        </p>
                        <div className="pt-1">
                          <Link to={`/blogs/${subArticle.slug}`} className="text-primary hover:underline inline-flex items-center gap-1 font-bold text-xs">
                            Read More <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>
                      {subArticle.coverImage && (
                        <div className="w-full sm:w-48 h-28 shrink-0 overflow-hidden rounded-2xl border border-border/30 relative">
                          <img
                            src={subArticle.coverImage}
                            alt={subArticle.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                      )}
                    </article>
                  )}
                </div>

                {/* Right Section (Sidebar Stack) */}
                <div className="lg:col-span-4 lg:border-l lg:border-border/30 lg:pl-8 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5 text-primary animate-pulse" /> Trending Topics
                  </h3>
                  <div className="space-y-4">
                    {sidebarArticles.map((blog) => (
                      <article
                        key={blog.id}
                        className="group relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-4.5 shadow-sm hover:shadow-md hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm"
                      >
                        <div className="space-y-2.5">
                          <span className="inline-block rounded-lg bg-primary/10 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-primary border border-primary/15">
                            {categories.find((c) => c.slug === blog.category)?.name || blog.category}
                          </span>
                          <Link to={`/blogs/${blog.slug}`} className="block hover:text-primary transition-colors duration-200">
                            <h4 className="text-sm sm:text-base font-bold text-foreground font-geist-sans leading-snug line-clamp-2">
                              {blog.title}
                            </h4>
                          </Link>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                            <span>
                              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                            <Link to={`/blogs/${blog.slug}`} className="text-primary hover:underline flex items-center gap-0.5 font-bold transition-all text-[10px]">
                              Read More <ArrowRight className="h-3 w-3" />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Single Article fallback or Standard Grid when only 1 is present */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedBlogs.map((blog, idx) => (
                  <article
                    key={blog.id}
                    className="flex flex-col overflow-hidden rounded-[2rem] border border-border/30 bg-card/50 backdrop-blur-sm hover-lift hover-glow gradient-border transition-all duration-300 group animate-entrance"
                    style={{ animationDelay: `${idx * 0.04}s` }}
                  >
                    {/* Image */}
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={blog.coverImage}
                        alt={blog.title}
                        className="h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.07]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 rounded-xl bg-background/85 backdrop-blur-md px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-foreground border border-white/10 shadow-sm">
                        {categories.find((c) => c.slug === blog.category)?.name || blog.category}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-6 space-y-3 justify-between">
                      <div className="space-y-2">
                        <Link
                          to={`/blogs/${blog.slug}`}
                          className="block hover:text-primary transition-colors duration-200"
                        >
                          <h4 className="text-lg font-bold leading-snug line-clamp-2 text-foreground font-geist-sans">
                            {blog.title}
                          </h4>
                        </Link>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                          {blog.excerpt}
                        </p>
                        <div className="pt-1">
                          <Link to={`/blogs/${blog.slug}`} className="text-primary hover:underline inline-flex items-center gap-1 text-xs font-bold transition-all">
                            Read More <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {blog.author?.avatar ? (
                            <img
                              src={blog.author.avatar}
                              alt={blog.author.name}
                              className="h-7 w-7 rounded-full object-cover border border-border/50 shadow-sm"
                            />
                          ) : (
                            <div className="h-7 w-7 rounded-full border border-border/50 shadow-sm bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                              {blog.author?.name?.charAt(0)?.toUpperCase() || "?"}
                            </div>
                          )}
                          <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                            {blog.author?.name || "Aether Writer"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                          <span>
                            {new Date(blog.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <span>•</span>
                          <span>{blog.readingTime} min</span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2.5 rounded-xl border border-border bg-card/60 text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`h-10 w-10 rounded-xl border text-sm font-bold transition-all duration-200 ${
                      currentPage === pageNumber
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "border-border bg-card/60 text-foreground hover:bg-muted/80"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2.5 rounded-xl border border-border bg-card/60 text-foreground hover:bg-muted/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : null}
      </section>

      <VisitorFooter />

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-border/40 bg-background/90 backdrop-blur-md text-foreground shadow-lg hover:bg-primary hover:text-primary-foreground hover:scale-110 hover:border-primary active:scale-95 transition-all duration-300 group animate-scale-in"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}
    </>
  );
}
