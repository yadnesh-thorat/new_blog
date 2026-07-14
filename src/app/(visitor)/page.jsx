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

const toMarathiNumerals = (num) => {
  const marathiDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return String(num)
    .split("")
    .map((char) => marathiDigits[parseInt(char)] || char)
    .join("");
};


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

  const mainArticle = currentPage === 1 && paginatedBlogs.length > 0 ? paginatedBlogs[0] : null;
  const leftColumnBlogs = mainArticle ? paginatedBlogs.slice(1) : paginatedBlogs;

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <VisitorNavbar />

      {/* Documentary Spotlight Hero */}
      {mainArticle ? (
        <section className="relative h-[80vh] md:h-[85vh] w-full flex items-end overflow-hidden mt-20">
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center" 
              style={{ backgroundImage: `url(${mainArticle.coverImage})` }}
            />
            <div className="absolute inset-0 cinematic-overlay" />
          </div>
          <div className="relative z-10 px-4 sm:px-6 lg:px-8 pb-16 md:pb-24 w-full max-w-5xl mx-auto">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="w-12 h-[2px] bg-primary"></span>
              <span className="font-label-caps text-xs tracking-widest text-primary uppercase font-semibold">
                {settings.homepage?.spotlightTag || "विशेष तपास"}
              </span>
            </div>
            <h1 className="font-display-lg text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white mb-6 leading-[1.1] font-bold">
              {mainArticle.title}
            </h1>
            <p className="font-body-lg text-sm sm:text-base md:text-lg text-zinc-300 mb-6 max-w-2xl leading-relaxed opacity-90">
              {mainArticle.excerpt}
            </p>
            <Link 
              to={`/blogs/${mainArticle.slug}`}
              className="bg-primary text-on-primary font-bold px-8 py-3.5 inline-flex items-center gap-2 hover:bg-primary/90 transition-all rounded-sm group text-xs uppercase tracking-wider font-marathi-body"
            >
              <span>संपूर्ण कथा वाचा</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      ) : (
        <div className="h-20" />
      )}

      {/* Main Content: Asymmetric 70/30 Layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-[120px] grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        {/* Latest Articles (70%) */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                {settings.homepage?.latestBlogsTitle || "नवीन तपास आणि शोधकथा"}
              </h2>
              <p className="text-body-md text-on-surface-variant mt-1">
                {settings.homepage?.latestBlogsSubtitle || "सत्यशोध आणि पुराव्यांवर आधारित चालू तपासणी"}
              </p>
            </div>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="text-xs font-semibold text-primary hover:underline transition-all"
              >
                सर्व दाखवा
              </button>
            )}
          </div>

          {filteredBlogs.length > 0 ? (
            <div className="space-y-10">
              {leftColumnBlogs.map((blog, idx) => (
                <article key={blog.id} className="cursor-pointer border-b border-outline-variant/10 pb-8 last:border-b-0">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    {blog.coverImage && (
                      <div className="md:col-span-5 aspect-[16/10] w-full overflow-hidden rounded-lg relative border border-outline-variant/10">
                        <img 
                          src={blog.coverImage} 
                          alt={blog.title} 
                          className="w-full h-full object-cover transition-transform duration-700" 
                        />
                        <span className="absolute top-3 left-3 bg-primary text-on-primary px-3 py-1 text-[9px] font-bold tracking-widest rounded-full uppercase">
                          {categories.find((c) => c.slug === blog.category)?.name || blog.category}
                        </span>
                      </div>
                    )}
                    <div className="md:col-span-7 flex flex-col justify-between space-y-3">
                      <Link to={`/blogs/${blog.slug}`} className="block transition-colors">
                        <h3 className="font-headline-sm text-lg md:text-xl font-bold leading-snug text-on-surface">
                          {blog.title}
                        </h3>
                      </Link>
                      <p className="font-body-md text-sm text-on-surface-variant/80 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-on-surface-variant/50 pt-2 font-marathi-body">
                        <div className="flex items-center gap-3">
                          <span>{new Date(blog.createdAt).toLocaleDateString("mr-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant/60"></span>
                          <span>{blog.readingTime} मिनिटे वाचन</span>
                        </div>
                        <Link to={`/blogs/${blog.slug}`} className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
                          वाचा <ArrowRight className="h-3.5 w-3.5 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2 pt-6">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 rounded-sm border border-outline-variant/30 text-on-surface hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Previous"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                    <button
                      key={pageNumber}
                      onClick={() => setCurrentPage(pageNumber)}
                      className={`h-10 w-10 rounded-sm border text-sm font-bold transition-all ${
                        currentPage === pageNumber
                          ? "bg-primary text-on-primary border-primary"
                          : "border-outline-variant/30 text-on-surface hover:bg-primary/10"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 rounded-sm border border-outline-variant/30 text-on-surface hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    title="Next"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-on-surface-variant">कोणतेही लेख आढळले नाहीत.</p>
            </div>
          )}
        </div>

        {/* Sticky Sidebar / Numbered Timeline (30%) */}
        <aside className="lg:col-span-4 lg:border-l lg:border-outline-variant/20 lg:pl-8 space-y-8">
          <div className="sticky top-28 space-y-8">
            <div>
              <h3 className="font-label-caps text-label-caps text-primary border-b border-primary/20 pb-2 mb-6 uppercase">
                {settings.homepage?.sidebarTitle || "मागील तपासणी"}
              </h3>
              <div className="flex flex-col gap-8">
                {blogs.slice(0, 4).map((blog, idx) => (
                  <div key={`side-${blog.id}`} className="cursor-pointer flex gap-4 items-start">
                    <span className="font-display-lg text-headline-md text-primary/35 shrink-0 whitespace-nowrap">
                      {toMarathiNumerals(String(idx + 1).padStart(2, "0"))}
                    </span>
                    <div className="space-y-1 min-w-0">
                      <Link to={`/blogs/${blog.slug}`}>
                        <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                          {blog.title}
                        </h4>
                      </Link>
                      <p className="text-on-surface-variant/70 font-body-md text-xs line-clamp-2 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </section>

      {/* Bento Grid Category Directory */}
      <section className="bg-surface-container-lowest py-[120px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h2 className="font-display-lg text-display-lg text-primary mb-4">
              {settings.homepage?.categoriesTitle || "विषय सूची"}
            </h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant/80">
              {settings.homepage?.categoriesSubtitle || "सत्यवेधच्या व्यासपीठावर आम्ही विविध पैलूंनी इतिहासाचा आणि वर्तमानाचा वेध घेतो."}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 (Tall) */}
            {categories[0] && (
              <div 
                onClick={() => setSelectedCategory(categories[0].slug)}
                className="relative group aspect-[4/5] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-headline-md text-xl text-white mb-1 group-hover:text-primary transition-colors">{categories[0].name}</h3>
                  <p className="font-label-caps text-xs text-primary">शोधकथा वाचा</p>
                </div>
              </div>
            )}

            {/* Card 2 Column (Two shorter cards) */}
            <div className="flex flex-col gap-6">
              {categories[1] && (
                <div 
                  onClick={() => setSelectedCategory(categories[1].slug)}
                  className="relative group flex-1 min-h-[160px] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="font-headline-sm text-lg text-white mb-1 group-hover:text-primary transition-colors">{categories[1].name}</h3>
                    <p className="font-label-caps text-xs text-primary">विश्लेषणे</p>
                  </div>
                </div>
              )}
              {categories[2] && (
                <div 
                  onClick={() => setSelectedCategory(categories[2].slug)}
                  className="relative group flex-1 min-h-[160px] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                    style={{ backgroundImage: `url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                  <div className="absolute bottom-6 left-6">
                    <h3 className="font-headline-sm text-lg text-white mb-1 group-hover:text-primary transition-colors">{categories[2].name}</h3>
                    <p className="font-label-caps text-xs text-primary">लेख व संशोधन</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card 3 (Tall) */}
            {categories[3] && (
              <div 
                onClick={() => setSelectedCategory(categories[3].slug)}
                className="relative group aspect-[4/5] overflow-hidden rounded-xl cursor-pointer border border-outline-variant/20 hover:border-primary/40 transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                  style={{ backgroundImage: `url('https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <h3 className="font-headline-md text-xl text-white mb-1 group-hover:text-primary transition-colors">{categories[3].name}</h3>
                  <p className="font-label-caps text-xs text-primary">माहितीपट आणि इतिहास</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quote Block Section */}
      <section className="py-24 flex justify-center items-center relative overflow-hidden bg-background border-t border-b border-outline-variant/10">
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="font-display-lg text-primary text-6xl block mb-6 select-none opacity-80">“</span>
          <blockquote className="font-display-lg text-2xl md:text-3xl text-on-surface leading-snug mb-6 italic font-semibold">
            &ldquo;{settings.homepage?.quoteText || "इतिहास कधीच मरत नाही... तो फक्त पुन्हा वाचला जातो."}&rdquo;
          </blockquote>
          <cite className="font-label-caps text-xs text-primary uppercase tracking-widest block font-bold">
            — {settings.homepage?.quoteAuthor || "सत्यवेध संपादकीय"}
          </cite>
        </div>
      </section>

      {/* Horizontal Scroll Documentary Row */}
      <section className="py-[120px] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">
              {settings.homepage?.featuredVideosTitle || "लोकप्रिय माहितीपट"}
            </h2>
            <p className="text-on-surface-variant/70 font-body-md text-sm mt-1">
              {settings.homepage?.featuredVideosSubtitle || "सखोल संशोधनावर आधारित लेख आणि वृत्त"}
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                const el = document.getElementById("movie-row");
                if (el) el.scrollBy({ left: -300, behavior: 'smooth' });
              }}
              className="p-2 border border-outline-variant/30 hover:bg-primary/10 hover:border-primary/40 transition-colors rounded-full text-on-surface flex items-center justify-center cursor-pointer"
              title="मागे"
            >
              <ChevronLeft className="h-4 w-4 text-primary" />
            </button>
            <button 
              onClick={() => {
                const el = document.getElementById("movie-row");
                if (el) el.scrollBy({ left: 300, behavior: 'smooth' });
              }}
              className="p-2 border border-outline-variant/30 hover:bg-primary/10 hover:border-primary/40 transition-colors rounded-full text-on-surface flex items-center justify-center cursor-pointer"
              title="पुढे"
            >
              <ChevronRight className="h-4 w-4 text-primary" />
            </button>
          </div>
        </div>
        
        <div id="movie-row" className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar no-scrollbar scroll-smooth">
          {blogs.map((blog) => (
            <div key={`doc-${blog.id}`} className="flex-none w-72 md:w-96 group cursor-pointer">
              <div className="aspect-[16/9] rounded-lg overflow-hidden relative mb-3 border border-outline-variant/20 group-hover:border-primary/40 transition-all duration-300">
                <img 
                  src={blog.coverImage} 
                  alt={blog.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-primary text-on-primary rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-500 shadow-lg">
                    <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] text-on-surface font-label-caps">
                  {blog.readingTime}:०० मिनिटे
                </div>
              </div>
              <Link to={`/blogs/${blog.slug}`}>
                <h3 className="font-headline-sm text-base font-bold text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-1">
                  {blog.title}
                </h3>
              </Link>
              <p className="text-on-surface-variant/70 font-body-md text-xs mt-1 line-clamp-2 leading-relaxed">
                {blog.excerpt}
              </p>
            </div>
          ))}
        </div>
      </section>



      <VisitorFooter />

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
