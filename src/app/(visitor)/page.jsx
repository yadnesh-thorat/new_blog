"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Calendar,
} from "lucide-react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { useLanguage } from "@/components/LanguageContext";
import { dbService } from "@/lib/db";
import { event } from "@/lib/analytics";
import confetti from "canvas-confetti";

const toMarathiNumerals = (num) => {
  const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num)
    .split("")
    .map((char) => marathiDigits[parseInt(char)] || char)
    .join("");
};


export default function HomePage() {
  const { language, t, translateText } = useLanguage();
  const getTitle = (blog) => language === "en" && blog?.titleEn ? blog.titleEn : (blog?.title || "");
  const getExcerpt = (blog) => language === "en" && blog?.excerptEn ? blog.excerptEn : (blog?.excerpt || "");
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return "";
      return d.toLocaleDateString(language === "mr" ? "mr-IN" : language === "hi" ? "hi-IN" : "en-US", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return "";
    }
  };
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem("aether_settings_v2");
      return cached ? JSON.parse(cached) : { websiteName: "सत्यवेध" };
    } catch {
      return { websiteName: "सत्यवेध" };
    }
  });
  const [pageLoading, setPageLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const [sidebarPage, setSidebarPage] = useState(1);
  const sidebarPostsPerPage = 4;
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const lastScrollTime = useRef(0);
  const heroCardRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
    setHeroSlideIndex(0);
  }, [selectedCategory, searchQuery]);

  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    let lastState = false;
    const handleScroll = () => {
      const isPast = window.scrollY > 400;
      if (isPast !== lastState) {
        lastState = isPast;
        setShowBackToTop(isPast);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const [blogsRes, catsRes, settingsRes] = await Promise.allSettled([
          dbService.getBlogs(false),
          dbService.getCategories(),
          dbService.getSettings(),
        ]);

        if (blogsRes.status === "fulfilled" && blogsRes.value) {
          setBlogs(blogsRes.value);
        }
        if (catsRes.status === "fulfilled" && catsRes.value) {
          setCategories(catsRes.value);
        }
        if (settingsRes.status === "fulfilled" && settingsRes.value) {
          setSettings(settingsRes.value);
          try { localStorage.setItem("aether_settings_v2", JSON.stringify(settingsRes.value)); } catch {}
        }
      } catch (err) {
        console.error("❌ [Aether] Error loading data:", err);
      } finally {
        setPageLoading(false);
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

  // Computed values (always run, not inside JSX)
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
  
  // Hero Carousel Articles (Top 5)
  const featuredArticles = filteredBlogs.length > 0 ? filteredBlogs.slice(0, 5) : [];
  const safeHeroIndex = heroSlideIndex < featuredArticles.length ? heroSlideIndex : 0;
  const activeHeroArticle = featuredArticles[safeHeroIndex] || featuredArticles[0];



  // Non-passive wheel event listener attached directly to Hero Card DOM element
  useEffect(() => {
    const el = heroCardRef.current;
    if (!el || featuredArticles.length <= 1) return;

    const handleNativeWheel = (e) => {
      // ALWAYS prevent window/page scrolling while mouse is inside the card container
      e.preventDefault();

      const now = Date.now();
      if (now - lastScrollTime.current < 320) return;

      if (e.deltaY > 10) {
        lastScrollTime.current = now;
        setHeroSlideIndex((prev) => (prev + 1) % featuredArticles.length);
      } else if (e.deltaY < -10) {
        lastScrollTime.current = now;
        setHeroSlideIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
      }
    };

    el.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleNativeWheel);
    };
  }, [featuredArticles.length]);

  // Touch swipe handling for mobile devices
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 40) {
      if (distance > 0) {
        // Swiped left -> next slide
        setHeroSlideIndex((prev) => (prev + 1) % featuredArticles.length);
      } else {
        // Swiped right -> prev slide
        setHeroSlideIndex((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const leftColumnBlogs = activeHeroArticle ? paginatedBlogs.filter((b) => b.id !== activeHeroArticle.id) : paginatedBlogs;
  const totalSidebarPages = Math.ceil(blogs.length / sidebarPostsPerPage);
  const paginatedSidebarBlogs = blogs.slice((sidebarPage - 1) * sidebarPostsPerPage, sidebarPage * sidebarPostsPerPage);

  const isLoading = pageLoading && blogs.length === 0;

  return (
    <>
      {/* Navbar always mounted — never unmounts on data load */}
      <VisitorNavbar />

      {/* Loading Skeleton */}
      {isLoading ? (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-12">
          <div className="border-b border-border/40 pb-5 mb-8">
            <div className="skeleton h-7 w-52 mb-2" />
            <div className="skeleton h-4 w-80" />
          </div>
          <div className="flex gap-2 mb-8 flex-wrap">
            {[80, 100, 70, 90, 110, 75].map((w, i) => (
              <div key={i} className="skeleton h-8 rounded-full" style={{ width: `${w}px` }} />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="skeleton h-8 w-3/4" />
              <div className="skeleton h-8 w-1/2" />
              <div className="skeleton w-full aspect-video rounded-[2rem]" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-5/6" />
              <div className="border-t border-border/20 pt-6 flex gap-6">
                <div className="flex-1 space-y-3">
                  <div className="skeleton h-4 w-20" />
                  <div className="skeleton h-5 w-full" />
                  <div className="skeleton h-5 w-4/5" />
                </div>
                <div className="skeleton w-48 h-28 rounded-2xl" />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="skeleton h-4 w-36" />
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-2xl border border-border/30 p-4 space-y-2">
                  <div className="skeleton h-3 w-20 rounded-full" />
                  <div className="skeleton h-4 w-full" />
                  <div className="skeleton h-4 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <>
          {/* Editorial Featured Carousel Spotlight */}
          {activeHeroArticle ? (
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 sm:pt-32 pb-3 sm:pb-8">
              <div
                ref={heroCardRef}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                className="relative overflow-hidden rounded-2xl sm:rounded-[2rem] border border-border/60 bg-gradient-to-br from-card via-card/95 to-primary/5 p-4 sm:p-10 lg:p-14 shadow-xl sm:shadow-2xl hover:border-primary/40 transition-all duration-500 group select-none touch-pan-y"
              >
                
                {/* Subtle Ambient Glows */}
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/12 rounded-full blur-3xl pointer-events-none" />

                {/* Responsive Animated Dots Indicators */}
                {featuredArticles.length > 1 && (
                  <div className="absolute top-3.5 right-3.5 sm:top-1/2 sm:right-5 sm:-translate-y-1/2 flex flex-row sm:flex-col items-center gap-1.5 sm:gap-2 z-30 bg-background/85 backdrop-blur-md p-1.5 sm:p-2 rounded-full border border-border/50 shadow-md">
                    {featuredArticles.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setHeroSlideIndex(idx)}
                        className={`rounded-full transition-all duration-300 cursor-pointer ${
                          heroSlideIndex === idx
                            ? "w-6 h-1.5 sm:w-2 sm:h-7 bg-primary shadow-xs animate-pulse"
                            : "w-1.5 h-1.5 sm:w-2 sm:h-2 bg-muted-foreground/30 hover:bg-primary/60"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                <div key={activeHeroArticle.id} className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-12 items-center relative z-10 animate-slide-horizontal pr-0 sm:pr-8">
                  <div className="lg:col-span-7 space-y-3 sm:space-y-6">
                    
                    {/* Date Row */}
                    {formatDate(activeHeroArticle.createdAt) && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-[11px] sm:text-xs font-semibold text-muted-foreground/80 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary/70" />
                          {formatDate(activeHeroArticle.createdAt)}
                        </span>
                      </div>
                    )}

                    {/* Headline Title */}
                    <Link to={`/blogs/${activeHeroArticle.slug}`} className="block group/title">
                      <h1 className="font-outfit text-lg sm:text-4xl lg:text-[40px] font-black tracking-tight text-foreground group-hover/title:text-primary transition-colors leading-[1.25] sm:leading-[1.2] line-clamp-2 sm:line-clamp-none">
                        {getTitle(activeHeroArticle)}
                      </h1>
                    </Link>

                    {/* Excerpt */}
                    <p className="text-xs sm:text-base lg:text-lg text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-3 font-normal">
                      {getExcerpt(activeHeroArticle)}
                    </p>

                    {/* Action Bar */}
                    <div className="pt-1 sm:pt-2 flex items-center gap-2.5 sm:gap-3 flex-wrap">
                      <Link
                        to={`/blogs/${activeHeroArticle.slug}`}
                        className="inline-flex items-center justify-center gap-2 sm:gap-2.5 rounded-full bg-primary px-4.5 py-2.5 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-extrabold text-on-primary shadow-md sm:shadow-lg shadow-primary/25 hover:bg-primary/90 hover:scale-[1.03] transition-all font-outfit cursor-pointer"
                      >
                        <span>{t("read_full_story")}</span>
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Link>

                      {activeHeroArticle.readingTime && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-full text-[11px] sm:text-xs text-muted-foreground font-semibold bg-muted/50 border border-border/50">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary" />
                          {activeHeroArticle.readingTime} {t("min_read")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: Featured Cover Image */}
                  {activeHeroArticle.coverImage && (
                    <Link
                      to={`/blogs/${activeHeroArticle.slug}`}
                      className="lg:col-span-5 block overflow-hidden rounded-xl sm:rounded-3xl border border-border/60 shadow-lg sm:shadow-2xl aspect-[21/9] sm:aspect-[16/10] lg:aspect-[4/3] relative group/img cursor-pointer"
                    >
                      <img
                        src={activeHeroArticle.coverImage}
                        alt={activeHeroArticle.title}
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/img:scale-108"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-80 group-hover/img:opacity-90 transition-opacity" />

                      {/* Floating category badge on image */}
                      <span className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 bg-background/90 backdrop-blur-md text-foreground px-2.5 py-1 sm:px-3.5 sm:py-1.5 text-[10px] sm:text-[11px] font-black tracking-wider rounded-full uppercase border border-border/60 shadow-md">
                        {translateText(categories.find((c) => c.slug === activeHeroArticle.category)?.name || activeHeroArticle.category)}
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </section>
          ) : (
            <div className="h-20" />
          )}

          {/* Main Content: Asymmetric 70/30 Layout */}
          <div className="w-full bg-muted/30 py-10 sm:py-14 my-6 border-y border-border/40">
            <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Latest Articles (70%) */}
            <div className="lg:col-span-8 space-y-12">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/40">
                <div>
                  <h2 className="font-outfit text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">{t("latest_blogs_title")}</h2>
                  <p className="text-sm sm:text-base text-muted-foreground mt-1 font-medium">{t("latest_blogs_subtitle")}</p>
                </div>
                {selectedCategory !== "all" && (
                  <button onClick={() => setSelectedCategory("all")} className="text-xs sm:text-sm font-bold text-primary hover:underline transition-all">
                    {t("show_all")}
                  </button>
                )}
              </div>

              {filteredBlogs.length > 0 ? (
                <div className="space-y-10">
                  {leftColumnBlogs.map((blog) => (
                    <article key={blog.id} className="border-b border-border/30 pb-8 last:border-b-0">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {blog.coverImage && (
                          <Link to={`/blogs/${blog.slug}`} className="block md:col-span-5 aspect-[16/10] w-full overflow-hidden rounded-xl relative border border-border/30 shadow-sm group">
                            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                            <span className="absolute top-3 left-3 bg-primary text-on-primary px-3 py-1 text-[10px] font-extrabold tracking-wider rounded-full uppercase shadow-sm">
                              {translateText(categories.find((c) => c.slug === blog.category)?.name || blog.category)}
                            </span>
                          </Link>
                        )}
                        <div className="md:col-span-7 flex flex-col justify-between space-y-3.5">
                          <Link to={`/blogs/${blog.slug}`} className="block transition-colors group">
                            <h3 className="font-outfit text-xl sm:text-2xl font-black leading-snug text-foreground group-hover:text-primary transition-colors">
                              {getTitle(blog)}
                            </h3>
                          </Link>
                          <p className="text-sm sm:text-base text-foreground/80 line-clamp-3 leading-relaxed font-normal">{getExcerpt(blog)}</p>
                          <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground font-semibold pt-2">
                            <div className="flex items-center gap-3">
                              {formatDate(blog.createdAt) && <span>{formatDate(blog.createdAt)}</span>}
                              <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
                              <span>{blog.readingTime} {t("minutes_read")}</span>
                            </div>
                            <Link to={`/blogs/${blog.slug}`} className="text-primary font-extrabold hover:underline inline-flex items-center gap-1.5 text-sm sm:text-base transition-all">
                              <span>{t("read_more")}</span>
                              <ArrowRight className="h-4 w-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                  {totalPages > 1 && (
                    <div className="mt-12 flex justify-center items-center gap-2 pt-6">
                      <button onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="p-2.5 rounded-lg border border-border/40 text-foreground hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="Previous">
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                        <button key={pageNumber} onClick={() => setCurrentPage(pageNumber)} className={`h-10 w-10 rounded-lg border text-sm font-bold transition-all ${currentPage === pageNumber ? "bg-primary text-on-primary border-primary shadow-xs" : "border-border/40 text-foreground hover:bg-primary/10"}`}>
                          {pageNumber}
                        </button>
                      ))}
                      <button onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="p-2.5 rounded-lg border border-border/40 text-foreground hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all" title="Next">
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground font-semibold">{t("no_blogs_found")}</p>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:col-span-4 lg:border-l lg:border-border/30 lg:pl-8 space-y-8">
              <div className="sticky top-28 space-y-6">
                <div className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-xs p-5 shadow-lg space-y-5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-3.5 gap-2">
                    <h3 className="font-outfit text-sm font-extrabold tracking-wider text-primary uppercase flex items-center gap-2">
                      {t("previous_investigations")}
                    </h3>
                    {totalSidebarPages > 1 && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button onClick={() => setSidebarPage((prev) => Math.max(prev - 1, 1))} disabled={sidebarPage === 1} className="p-1.5 rounded-lg border border-border/40 text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer" title="Previous Page">
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-extrabold text-primary px-2 py-0.5 rounded-md bg-primary/10 select-none">{sidebarPage} / {totalSidebarPages}</span>
                        <button onClick={() => setSidebarPage((prev) => Math.min(prev + 1, totalSidebarPages))} disabled={sidebarPage === totalSidebarPages} className="p-1.5 rounded-lg border border-border/40 text-foreground hover:bg-primary/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer" title="Next Page">
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                    {paginatedSidebarBlogs.map((blog, idx) => {
                      const globalIdx = (sidebarPage - 1) * sidebarPostsPerPage + idx + 1;
                      const itemNum = String(globalIdx).padStart(2, "0");
                      return (
                        <Link key={`side-${blog.id}`} to={`/blogs/${blog.slug}`} className="group flex gap-3.5 items-start p-3 rounded-2xl border border-border/30 hover:border-primary/40 bg-background/50 hover:bg-card hover:shadow-md transition-all duration-200">
                          <span className="inline-flex items-center justify-center min-w-[32px] h-8 px-2 rounded-xl bg-primary/10 text-primary font-outfit text-xs font-black shrink-0 tracking-tighter">
                            #{language === "mr" ? toMarathiNumerals(itemNum) : itemNum}
                          </span>
                          <div className="space-y-1 min-w-0 flex-1">
                            <h4 className="font-outfit text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">{getTitle(blog)}</h4>
                            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-normal">{getExcerpt(blog)}</p>
                          </div>
                          {blog.coverImage && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-border/30 shadow-2xs">
                              <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </aside>
          </section>
        </div>

          {/* Bento Grid Category Directory */}
          <section className="bg-surface-container-lowest py-[120px]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-14 text-center max-w-3xl mx-auto">
                <h2 className="font-display-lg text-display-lg text-primary mb-4">{t("categories_title")}</h2>
                <p className="font-body-lg text-body-lg text-on-surface-variant/80">{t("categories_subtitle")}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories[0] && (
                  <Link to={`/categories?filter=${categories[0].slug}`} className="relative group aspect-[4/5] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 block">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${categories[0].image || 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80'})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="font-headline-md text-xl text-white mb-1 group-hover:text-amber-300 transition-colors font-bold drop-shadow-md">{translateText(categories[0].name)}</h3>
                      <p className="font-label-caps text-xs text-amber-400 font-extrabold tracking-wider line-clamp-1">{translateText(categories[0].description) || t("read_investigation")}</p>
                    </div>
                  </Link>
                )}
                <div className="flex flex-col gap-6">
                  {categories[1] && (
                    <Link to={`/categories?filter=${categories[1].slug}`} className="relative group flex-1 min-h-[160px] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 block">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${categories[1].image || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80'})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="font-headline-sm text-lg text-white mb-1 group-hover:text-amber-300 transition-colors font-bold drop-shadow-md">{translateText(categories[1].name)}</h3>
                        <p className="font-label-caps text-xs text-amber-400 font-extrabold tracking-wider line-clamp-1">{translateText(categories[1].description) || t("analyses")}</p>
                      </div>
                    </Link>
                  )}
                  {categories[2] && (
                    <Link to={`/categories?filter=${categories[2].slug}`} className="relative group flex-1 min-h-[160px] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 block">
                      <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${categories[2].image || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80'})` }} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                        <h3 className="font-headline-sm text-lg text-white mb-1 group-hover:text-amber-300 transition-colors font-bold drop-shadow-md">{translateText(categories[2].name)}</h3>
                        <p className="font-label-caps text-xs text-amber-400 font-extrabold tracking-wider line-clamp-1">{translateText(categories[2].description) || t("articles_research")}</p>
                      </div>
                    </Link>
                  )}
                </div>
                {categories[3] && (
                  <Link to={`/categories?filter=${categories[3].slug}`} className="relative group aspect-[4/5] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300 block">
                    <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: `url(${categories[3].image || 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80'})` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="font-headline-md text-xl text-white mb-1 group-hover:text-amber-300 transition-colors font-bold drop-shadow-md">{translateText(categories[3].name)}</h3>
                      <p className="font-label-caps text-xs text-amber-400 font-extrabold tracking-wider line-clamp-1">{translateText(categories[3].description) || t("documentaries_history")}</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </section>

          <VisitorFooter />
        </>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant/30 bg-background/90 backdrop-blur-md text-primary shadow-lg hover:bg-primary hover:text-on-primary hover:scale-110 hover:border-primary active:scale-95 transition-all duration-300 group animate-scale-in cursor-pointer"
          aria-label="Back to top"
        >
          <ArrowUp className="h-5 w-5 transition-transform group-hover:-translate-y-0.5" />
        </button>
      )}
    </>
  );
}
