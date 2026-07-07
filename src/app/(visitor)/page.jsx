"use client";

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUp,
  Clock,
  Search,
  ChevronRight,
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="mt-5 text-sm font-medium text-muted-foreground">Loading Aether Journal...</p>
      </div>
    );
  }

  const featuredBlog = blogs.find((b) => b.status === "published");
  const trendingBlogs = blogs.slice(0, 3).sort((a, b) => b.views - a.views);
  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "all" || blog.category === selectedCategory;
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      {/* Scroll Progress Indicator */}
      <div className="scroll-progress" style={{ width: `${scrollProgress}%` }} />

      <VisitorNavbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 lg:py-36 transition-colors duration-300">
        {/* Ambient background orbs */}
        <div className="absolute top-[-150px] left-[10%] w-[350px] sm:w-[550px] h-[350px] sm:h-[550px] bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow" />
        <div className="absolute top-[100px] right-[10%] w-[300px] sm:w-[480px] h-[300px] sm:h-[480px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slower" />
        <div className="absolute top-[-50px] left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[380px] bg-gradient-to-tr from-rose-500/5 to-primary/5 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="mx-auto max-w-3xl space-y-7 animate-entrance">
            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold bg-muted/70 text-muted-foreground border border-border/50 shadow-sm backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse shrink-0" />
              Aether Tech &amp; Design Journal — v2.0
            </span>

            {/* Heading */}
            <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-6xl lg:text-7xl font-geist-sans leading-[1.08] animate-slide-up">
              {settings.hero.title.split(" ").length > 3 ? (
                <>
                  <span className="text-gradient">
                    {settings.hero.title.split(" ").slice(0, 3).join(" ")}
                  </span>
                  <br />
                  <span className="text-foreground">
                    {settings.hero.title.split(" ").slice(3).join(" ")}
                  </span>
                </>
              ) : (
                <span className="text-gradient">{settings.hero.title}</span>
              )}
            </h1>

            <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
              {settings.hero.subtitle}
            </p>

            {/* Search Input */}
            <div className="mx-auto max-w-lg mt-8 flex items-center rounded-2xl glass p-1 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-white/20 dark:border-white/5 focus-within:ring-2 focus-within:ring-primary/25 focus-within:border-primary/30 transition-all duration-300">
              <div className="flex items-center px-3.5 text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search latest articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-3 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/60"
              />
              {searchQuery ? (
                <button
                  onClick={() => setSearchQuery("")}
                  className="px-3.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                >
                  Clear
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] font-extrabold bg-muted px-2 py-1 rounded-xl border border-border/60 text-muted-foreground/80 mr-2.5 shrink-0 select-none">
                  <span>⌘</span>K
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Blog Banner */}
      {featuredBlog && (
        <section id="featured" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border/30 bg-card/50 backdrop-blur-md shadow-md lg:grid lg:grid-cols-12 lg:gap-0 group hover-lift hover-glow duration-300 hover:border-primary/25 hover:shadow-[0_16px_48px_rgba(99,102,241,0.07)] dark:hover:shadow-[0_16px_48px_rgba(99,102,241,0.14)] animate-entrance">
            {/* Cover Image */}
            <div className="relative h-64 sm:h-80 lg:h-full lg:col-span-6 overflow-hidden rounded-tl-[2.5rem] rounded-bl-[2.5rem] max-lg:rounded-bl-none max-lg:rounded-tr-[2.5rem]">
              <img
                src={featuredBlog.coverImage}
                alt={featuredBlog.title}
                className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-card/20" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent md:hidden" />
            </div>

            {/* Content Details */}
            <div className="flex flex-col justify-center p-8 sm:p-10 lg:col-span-6 space-y-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex self-start rounded-xl bg-primary/12 border border-primary/25 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary-foreground dark:bg-primary/80 shadow-sm">
                  {categories.find((c) => c.slug === featuredBlog.category)?.name || featuredBlog.category}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">Featured</span>
              </div>

              <Link
                to={`/blogs/${featuredBlog.slug}`}
                className="block group-hover:text-primary transition-colors duration-300"
              >
                <h2 className="text-2xl font-black sm:text-3xl text-foreground font-geist-sans leading-tight hover:text-primary transition-colors">
                  {featuredBlog.title}
                </h2>
              </Link>

              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                {featuredBlog.excerpt}
              </p>

              {/* Author & Meta */}
              <div className="flex items-center gap-4 pt-4 border-t border-border/30">
                <img
                  src={featuredBlog.author.avatar}
                  alt={featuredBlog.author.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-border/60 shadow-sm"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{featuredBlog.author.name}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5 font-medium">
                    <span>
                      {new Date(featuredBlog.createdAt).toLocaleDateString("en-US", {
                        month: "short", day: "numeric", year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-semibold text-primary">
                      <Clock className="h-3 w-3" /> {featuredBlog.readingTime} min read
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to={`/blogs/${featuredBlog.slug}`}
                className="btn-shimmer inline-flex items-center gap-2 self-start rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-[0_4px_16px_rgba(99,102,241,0.3)] hover:opacity-92 hover:scale-[1.02] active:scale-95 transition-all duration-200"
              >
                Read Article <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Trending & Categories Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Categories Section (Left col) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Layers className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-geist-sans text-lg font-bold">Categories</h3>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left text-sm font-semibold ${
                selectedCategory === "all"
                  ? "bg-primary border-primary text-primary-foreground shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                  : "bg-card border-border/40 text-foreground hover:bg-muted/50 hover:border-foreground/20"
              }`}
            >
              <span>All Categories</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg font-bold ${
                selectedCategory === "all" ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {blogs.length}
              </span>
            </button>
            {categories.map((cat) => {
              const blogCount = blogs.filter((b) => b.category === cat.slug).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left text-sm font-semibold ${
                    selectedCategory === cat.slug
                      ? "bg-primary border-primary text-primary-foreground shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
                      : "bg-card border-border/40 text-foreground hover:bg-muted/50 hover:border-foreground/20"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-bold shrink-0 ml-2 ${
                    selectedCategory === cat.slug ? "bg-white/20 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {blogCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Trending Section (Right col) */}
        <div className="lg:col-span-8 space-y-5">
          <div className="flex items-center gap-2 border-b border-border/40 pb-3">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-geist-sans text-lg font-bold">Trending Articles</h3>
          </div>
          <div className="space-y-3">
            {trendingBlogs.map((blog, idx) => (
              <div
                key={blog.id}
                className="relative flex gap-4 p-5 rounded-2xl border border-border/25 bg-card/40 hover:bg-card hover:border-primary/20 transition-all duration-300 items-center group hover:shadow-md animate-entrance"
                style={{ animationDelay: `${idx * 0.07}s` }}
              >
                {/* Rank number */}
                <div className={`text-3xl font-black font-geist-sans w-9 shrink-0 text-center leading-none ${
                  idx === 0 ? "text-gradient" : "text-muted-foreground/25"
                }`}>
                  0{idx + 1}
                </div>
                <div className="flex-1 space-y-1 min-w-0">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                    {categories.find((c) => c.slug === blog.category)?.name || blog.category}
                  </span>
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="block hover:text-primary transition-colors"
                  >
                    <p className="text-base font-semibold leading-snug text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {blog.title}
                    </p>
                  </Link>
                  <div className="flex gap-4 items-center text-xs text-muted-foreground">
                    <span className="font-semibold">{blog.views} views</span>
                    <span>•</span>
                    <span>{blog.readingTime} min read</span>
                  </div>
                </div>
                <Link
                  to={`/blogs/${blog.slug}`}
                  className="p-2 rounded-full hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-all duration-200 shrink-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Blogs Listing */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog, idx) => (
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
                  </div>

                  <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={blog.author.avatar}
                        alt={blog.author.name}
                        className="h-7 w-7 rounded-full object-cover border border-border/50 shadow-sm"
                      />
                      <span className="text-xs font-bold text-foreground truncate max-w-[100px]">
                        {blog.author.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold">
                      <span>
                        {new Date(blog.createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric",
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
        ) : (
          <div className="text-center py-20 border border-dashed border-border/40 rounded-2xl bg-muted/10">
            <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">No publications matched your filter</p>
            <p className="text-xs text-muted-foreground mt-1">
              Try resetting the search terms or choosing a different category.
            </p>
          </div>
        )}
      </section>

      {/* Previous Publication Spotlight Section */}
      {blogs[1] && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-950 via-slate-900 to-violet-950 text-primary-foreground px-6 py-14 sm:px-14 sm:py-18 shadow-2xl border border-white/8 group">
            {/* Ambient Glowing mesh background */}
            <div className="absolute -top-[15%] -left-[10%] w-[55%] h-[55%] bg-primary/25 rounded-full blur-[120px] pointer-events-none animate-float-slow" />
            <div className="absolute -bottom-[15%] -right-[10%] w-[55%] h-[55%] bg-violet-500/20 rounded-full blur-[120px] pointer-events-none animate-float-slower" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left text section (Col 7) */}
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-xl bg-white/10 border border-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                    {categories.find((c) => c.slug === blogs[1].category)?.name || blogs[1].category}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">Previous Publication</span>
                </div>

                <Link
                  to={`/blogs/${blogs[1].slug}`}
                  className="block group-hover:text-primary transition-colors duration-300"
                >
                  <h3 className="text-3xl font-black sm:text-4xl text-white font-geist-sans leading-tight hover:text-indigo-200 transition-colors">
                    {blogs[1].title}
                  </h3>
                </Link>

                <p className="text-sm text-white/70 leading-relaxed line-clamp-3 font-medium">
                  {blogs[1].excerpt}
                </p>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                  <img
                    src={blogs[1].author.avatar}
                    alt={blogs[1].author.name}
                    className="h-10 w-10 rounded-full object-cover border-2 border-white/20 shadow-sm"
                  />
                  <div>
                    <p className="text-sm font-bold text-white">{blogs[1].author.name}</p>
                    <div className="flex items-center gap-2 text-xs text-white/50 mt-0.5 font-medium">
                      <span>
                        {new Date(blogs[1].createdAt).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-indigo-300">
                        <Clock className="h-3 w-3" /> {blogs[1].readingTime} min read
                      </span>
                    </div>
                  </div>
                </div>

                <Link
                  to={`/blogs/${blogs[1].slug}`}
                  className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-950 shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200"
                >
                  Read Previous Article <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Right image section (Col 5) */}
              <div className="lg:col-span-5 h-64 sm:h-80 w-full overflow-hidden rounded-3xl border border-white/10 relative">
                <img
                  src={blogs[1].coverImage}
                  alt={blogs[1].title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-750 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/40 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      )}

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
