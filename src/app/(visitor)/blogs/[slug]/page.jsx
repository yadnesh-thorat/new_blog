"use client";

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  ArrowLeft,
  Link2,
  MessageSquare,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Eye,
} from "lucide-react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { dbService } from "@/lib/db";

const LinkedinIcon = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);
import confetti from "canvas-confetti";

export default function BlogDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const slug = params?.slug;

  const [blog, setBlog] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHeader, setActiveHeader] = useState("");

  const [comments, setComments] = useState([]);
  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [adminUsers, setAdminUsers] = useState([]);

  useEffect(() => {
    async function loadBlogData() {
      if (!slug) return;
      setLoading(true);
      const activeBlog = await dbService.getBlogBySlug(slug);
      const allBlogs = await dbService.getBlogs(false);
      const cats = await dbService.getCategories();
      const allAdmins = await dbService.getAdmins();
      
      if (activeBlog) {
        const blogComments = await dbService.getComments(activeBlog.id);
        setComments(blogComments);
      }
      
      setBlog(activeBlog);
      setBlogs(allBlogs);
      setCategories(cats);
      setAdminUsers(allAdmins);
      setLoading(false);
    }
    loadBlogData();
  }, [slug]);

  // Track active TOC header on scroll
  useEffect(() => {
    if (!blog) return;
    const headers = document.querySelectorAll("h2[id], h3[id]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveHeader(entry.target.id);
        });
      },
      { rootMargin: "-80px 0px -60% 0px" }
    );
    headers.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [blog]);

  const getAuthorDetails = () => {
    if (!blog) return { name: "Author", avatar: "", role: "Writer", bio: "" };
    
    // If blog.author is already a structured object (old mock posts or resolved by dbService)
    if (blog.author && typeof blog.author === "object") {
      return {
        name: blog.author.name || "Aether Writer",
        avatar: blog.author.avatar || "",
        role: blog.author.role || "Writer",
        bio: blog.author.bio || ""
      };
    }

    // If blog.author is a string (new dynamically created posts, which contain name or email)
    if (blog.author && typeof blog.author === "string") {
      const matched = adminUsers.find(
        (a) =>
          a.displayName?.toLowerCase() === blog.author.toLowerCase() ||
          a.email?.toLowerCase() === blog.author.toLowerCase()
      );
      if (matched) {
        return {
          name: matched.displayName || matched.email,
          avatar: matched.avatarUrl || "",
          role: matched.role || "Administrator",
          bio: matched.bio || ""
        };
      }
      return {
        name: blog.author,
        avatar: "",
        role: "Administrator",
        bio: ""
      };
    }

    return {
      name: "Aether Writer",
      avatar: "",
      role: "Writer",
      bio: ""
    };
  };

  if (loading) {
    return (
      <>
        <VisitorNavbar />
        <main className="flex-grow py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Back button skeleton */}
            <div className="skeleton h-4 w-32 mb-8" />

            {/* Article header skeleton */}
            <div className="space-y-4 max-w-4xl border-b border-border/40 pb-8 mb-8">
              <div className="skeleton h-5 w-24" />
              <div className="skeleton h-10 w-full" />
              <div className="skeleton h-10 w-3/4" />
              <div className="skeleton h-5 w-full" />
              <div className="skeleton h-5 w-2/3" />
              <div className="flex items-center gap-4 pt-2">
                <div className="skeleton h-9 w-9 rounded-full" />
                <div className="skeleton h-4 w-28" />
                <div className="skeleton h-4 w-24" />
                <div className="skeleton h-4 w-20" />
              </div>
            </div>

            {/* Cover image skeleton */}
            <div className="skeleton w-full aspect-video rounded-2xl mb-12" />

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-1" />
              <div className="lg:col-span-8 space-y-4">
                {[100, 85, 92, 78, 95, 60, 88, 72].map((w, i) => (
                  <div key={i} className={`skeleton h-4`} style={{ width: `${w}%` }} />
                ))}
                <div className="skeleton h-8 w-48 mt-6" />
                {[90, 75, 88, 65, 95].map((w, i) => (
                  <div key={i} className={`skeleton h-4`} style={{ width: `${w}%` }} />
                ))}
              </div>
              <div className="lg:col-span-3 space-y-3">
                <div className="skeleton h-4 w-20" />
                {[1, 2, 3].map((i) => <div key={i} className="skeleton h-4 w-full" />)}
              </div>
            </div>
          </div>
        </main>
        <VisitorFooter />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <VisitorNavbar />
        <main className="flex-grow flex flex-col items-center justify-center text-center py-24 px-4">
          <div className="h-20 w-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
            <Sparkles className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <h2 className="text-2xl font-bold font-geist-sans text-foreground">Publication Not Found</h2>
          <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-8">
            The article might have been converted to a draft, renamed, or moved to another column.
          </p>
          <Link
            to="/"
            className="btn-shimmer inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.25)]"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
        </main>
        <VisitorFooter />
      </>
    );
  }

  const extractHeaders = (content) => {
    const lines = content.split("\n");
    const headers = [];
    lines.forEach((line) => {
      if (line.startsWith("## ")) {
        const text = line.replace("## ", "").trim();
        // Unicode-safe slug: keep letters (including Devanagari), digits, replace rest with -
        const id = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        headers.push({ id, text, level: 2 });
      } else if (line.startsWith("### ")) {
        const text = line.replace("### ", "").trim();
        const id = text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        headers.push({ id, text, level: 3 });
      }
    });
    return headers;
  };

  const headers = extractHeaders(blog.content);
  const relatedBlogs = blogs.filter((b) => b.category === blog.category && b.id !== blog.id).slice(0, 3);
  const currentIdx = blogs.findIndex((b) => b.id === blog.id);
  const nextBlog = currentIdx > 0 ? blogs[currentIdx - 1] : null;
  const prevBlog = currentIdx < blogs.length - 1 ? blogs[currentIdx + 1] : null;

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;
    const newComment = {
      id: "c-" + Math.random().toString(36).substr(2, 9),
      name: newCommentName,
      avatar: `https://images.unsplash.com/photo-${["1535713875002-d1d0cf377fde", "1494790108377-be9c29b29330", "1599566150163-29194dcaad36"][Math.floor(Math.random() * 3)]}?w=200&auto=format&fit=crop&q=60`,
      content: newCommentText,
      createdAt: new Date().toISOString(),
    };
    setComments([...comments, newComment]);
    setNewCommentName("");
    setNewCommentText("");
    setCommentSuccess(true);
    setTimeout(() => setCommentSuccess(false), 3000);
    confetti({ particleCount: 30, spread: 30, origin: { y: 0.8 } });
  };

  const handleCopyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderRichText = (text) => {
    const normalized = (text || "").replace(/^(#{2,3}\s[^\n]+)\n(?![#\n])/gm, "$1\n\n");
    const blocks = normalized.split("\n\n");
    return blocks.map((block, idx) => {
      if (block.startsWith("```")) {
        const match = block.match(/```(\w*)\n([\s\S]*?)```/);
        const language = match ? match[1] : "";
        const code = match ? match[2] : block.replace(/```/g, "");
        return (
          <div key={idx} className="my-6">
            {language && (
              <div className="flex justify-between items-center bg-[#161b22] px-4 py-1.5 rounded-t-lg border-x border-t border-border/40 text-xs font-semibold text-muted-foreground uppercase font-mono tracking-wider">
                <span>{language}</span>
                <span className="text-[10px] lowercase text-white/50">syntax highlighting active</span>
              </div>
            )}
            <pre className={language ? "rounded-t-none" : ""}>
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }
      if (block.startsWith("## ")) {
        const title = block.replace("## ", "");
        const id = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        return (
          <h2 key={idx} id={id} className="text-xl sm:text-2xl font-bold font-marathi-heading text-foreground mt-10 mb-4 border-b border-outline-variant/20 pb-2 scroll-mt-24 leading-snug">
            {title}
          </h2>
        );
      }
      if (block.startsWith("### ")) {
        const title = block.replace("### ", "");
        const id = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
        return (
          <h3 key={idx} id={id} className="text-lg sm:text-xl font-bold font-marathi-heading text-foreground mt-8 mb-3 scroll-mt-24 leading-snug">
            {title}
          </h3>
        );
      }
      if (block.startsWith("* ") || block.startsWith("- ")) {
        const items = block.split(/\n[*\-]\s/);
        return (
          <ul key={idx} className="list-disc pl-5 my-4 space-y-2 text-sm sm:text-base leading-relaxed text-muted-foreground">
            {items.map((item, itemIdx) => {
              const cleaned = item.replace(/^[*\-\s]+/, "").replace(/\*\*([\s\S]*?)\*\*/g, "$1").replace(/`([\s\S]*?)`/g, "$1");
              return <li key={itemIdx}>{cleaned}</li>;
            })}
          </ul>
        );
      }
      const inlineCodePattern = /`([^`]+)`/g;
      const inlineBoldPattern = /\*\*([^*]+)\*\*/g;
      let htmlContent = block
        .replace(inlineBoldPattern, "<strong>$1</strong>")
        .replace(inlineCodePattern, "<code class='bg-muted px-1.5 py-0.5 rounded text-xs font-mono border border-border/40 text-primary dark:text-white'>$1</code>");
      return (
        <p key={idx} className="text-sm sm:text-base leading-[1.9] text-muted-foreground my-4" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      );
    });
  };

  return (
    <>
      <VisitorNavbar />

      <main className="flex-grow py-10 transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground mb-8 transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> Back to Articles
          </button>

          {/* Article Header */}
          <div className="space-y-5 max-w-4xl border-b border-outline-variant/20 pb-8 mb-8 animate-entrance">
            <div className="flex items-center gap-3">
              <span className="inline-flex rounded-xl bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
                {categories.find((c) => c.slug === blog.category)?.name || blog.category}
              </span>
              {blog.views && (
                <span className="flex items-center gap-1 text-xs text-on-surface-variant/70 font-medium">
                  <Eye className="h-3.5 w-3.5" /> {blog.views} views
                </span>
              )}
            </div>
            <h1 className="text-3xl font-extrabold sm:text-5xl text-foreground font-marathi-heading leading-[1.15] tracking-tight">
              {blog.title}
            </h1>
            <p className="text-base sm:text-lg text-on-surface-variant/80 leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Author / Date Meta Bar */}
            {(() => {
              const authorDetails = getAuthorDetails();
              return (
                <div className="flex flex-wrap items-center gap-4 sm:gap-5 pt-2 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    {authorDetails.avatar ? (
                      <img
                        src={authorDetails.avatar}
                        alt={authorDetails.name}
                        className="h-9 w-9 rounded-full object-cover border-2 border-border/60 shadow-sm"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full border-2 border-border/60 shadow-sm bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {authorDetails.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                    <span className="font-bold text-foreground">{authorDetails.name}</span>
                  </div>
                  <span className="hidden sm:inline text-border">|</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(blog.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" /> {blog.readingTime} min read
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Featured Cover Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-video w-full border border-border/30 shadow-lg mb-12 animate-entrance" style={{ animationDelay: "0.1s" }}>
            <img src={blog.coverImage} alt={blog.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-2xl" />
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Share Column (Left - Col 1) */}
            <div className="lg:col-span-1 flex lg:flex-col lg:sticky lg:top-24 gap-3 py-2 items-center justify-center lg:justify-start">
              {/* Share label */}
              <span className="hidden lg:block text-[9px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">Share</span>
              <button
                onClick={handleCopyLink}
                className="group relative p-2.5 rounded-xl border border-border/50 hover:border-primary/40 hover:bg-primary/8 text-muted-foreground hover:text-primary bg-card transition-all duration-200"
                aria-label="Copy link"
                title="Copy link"
              >
                <Link2 className="h-4 w-4" />
                {copied && (
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] px-2 py-1 rounded-lg shadow font-semibold whitespace-nowrap animate-entrance">
                    Copied!
                  </span>
                )}
              </button>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-border/50 hover:border-sky-500/40 hover:bg-sky-500/8 text-muted-foreground hover:text-sky-500 bg-card transition-all duration-200"
                aria-label="Share on Twitter"
                title="Share on Twitter"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : "")}&title=${encodeURIComponent(blog.title)}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl border border-border/50 hover:border-blue-600/40 hover:bg-blue-600/8 text-muted-foreground hover:text-blue-600 bg-card transition-all duration-200"
                aria-label="Share on LinkedIn"
                title="Share on LinkedIn"
              >
                <LinkedinIcon className="h-4 w-4" />
              </a>
            </div>

            {/* Content Column (Center - Col 8) */}
            <div className="lg:col-span-8 space-y-8">
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {renderRichText(blog.content)}
              </div>

              {/* Author Card */}
              {(() => {
                const authorDetails = getAuthorDetails();
                return (
                  <div className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 flex flex-col sm:flex-row items-center gap-5 mt-12 gradient-border group hover:shadow-md transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
                    <div className="relative shrink-0">
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-lg opacity-0 group-hover:opacity-80 transition-opacity duration-500 scale-110" />
                      {authorDetails.avatar ? (
                        <img
                          src={authorDetails.avatar}
                          alt={authorDetails.name}
                          className="h-16 w-16 rounded-full object-cover border-2 border-border/60 relative z-10 group-hover:border-primary/40 transition-all duration-300"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full border-2 border-border/60 bg-muted relative z-10 flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:border-primary/40 transition-all duration-300">
                          {authorDetails.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 text-center sm:text-left relative z-10">
                      <h4 className="text-base font-bold font-geist-sans text-foreground">Written by {authorDetails.name}</h4>
                      {authorDetails.role && (
                        <p className="text-xs uppercase font-bold text-primary tracking-wider">{authorDetails.role}</p>
                      )}
                      {authorDetails.bio && (
                        <p className="text-xs text-muted-foreground leading-relaxed">{authorDetails.bio}</p>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Prev / Next navigation */}
              <div className="grid grid-cols-2 gap-4 border-t border-b border-border/30 py-6">
                <div>
                  {prevBlog ? (
                    <Link to={`/blogs/${prevBlog.slug}`} className="group space-y-1 block text-left">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 group-hover:-translate-x-0.5 transition-transform">
                        <ChevronLeft className="h-3.5 w-3.5" /> Previous
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {prevBlog.title}
                      </p>
                    </Link>
                  ) : (
                    <div className="space-y-1 text-muted-foreground text-left">
                      <p className="text-[10px] uppercase font-bold tracking-wider">Previous Post</p>
                      <p className="text-xs italic">First edition</p>
                    </div>
                  )}
                </div>
                <div>
                  {nextBlog ? (
                    <Link to={`/blogs/${nextBlog.slug}`} className="group space-y-1 block text-right">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1 justify-end group-hover:translate-x-0.5 transition-transform">
                        Next <ChevronRight className="h-3.5 w-3.5" />
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-foreground leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                        {nextBlog.title}
                      </p>
                    </Link>
                  ) : (
                    <div className="space-y-1 text-muted-foreground text-right">
                      <p className="text-[10px] uppercase font-bold tracking-wider">Next Post</p>
                      <p className="text-xs italic">Latest edition</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Feed */}
              <div className="space-y-6 pt-2">
                <div className="flex items-center gap-2 border-b border-border/30 pb-3">
                  <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-bold font-geist-sans">Comments ({comments.length})</h3>
                </div>

                <div className="space-y-3">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-4 items-start p-5 rounded-2xl border border-border/20 bg-muted/10 hover:bg-muted/20 transition-colors duration-200">
                      <img src={c.avatar} alt={c.name} className="h-9 w-9 rounded-full object-cover shrink-0 border border-border/40" />
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-sm font-bold text-foreground">{c.name}</span>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Write Comment Form */}
                <div className="rounded-2xl border border-border/40 p-6 bg-card space-y-4 gradient-border">
                  <h4 className="text-sm font-bold font-geist-sans">Join the Discussion</h4>
                  {commentSuccess && (
                    <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-xl text-xs font-semibold animate-entrance">
                      <CheckCircle2 className="h-4 w-4" /> Comment posted successfully!
                    </div>
                  )}
                  <form onSubmit={handleCommentSubmit} className="space-y-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      required
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      className="w-full text-sm px-4 py-3 rounded-xl bg-background border border-border focus:outline-none"
                    />
                    <textarea
                      rows={3}
                      placeholder="Write your constructive thoughts here..."
                      required
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                      className="w-full text-sm px-4 py-3 rounded-xl bg-background border border-border focus:outline-none resize-none"
                    />
                    <button
                      type="submit"
                      className="btn-shimmer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-all shadow-[0_4px_14px_rgba(99,102,241,0.2)] cursor-pointer"
                    >
                      Post Comment <Send className="h-3.5 w-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar (Right - Col 3) */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
              {/* Table of Contents */}
              {headers.length > 0 && (
                <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
                    Table of Contents
                  </h4>
                  <nav className="space-y-1">
                    {headers.map((h, i) => (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        style={{ paddingLeft: `${(h.level - 2) * 10}px` }}
                        className={`flex items-center gap-2 text-xs py-1 transition-all font-medium group ${
                          activeHeader === h.id
                            ? "text-primary font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {activeHeader === h.id && (
                          <span className="w-1 h-3.5 rounded-full bg-primary shrink-0 animate-entrance" />
                        )}
                        <span className="truncate">{h.text}</span>
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Related Posts */}
              <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2">
                  Related Posts
                </h4>
                <div className="space-y-4">
                  {relatedBlogs.length > 0 ? (
                    relatedBlogs.map((b) => (
                      <Link key={b.id} to={`/blogs/${b.slug}`} className="flex gap-3 items-center group hover:text-primary transition-colors">
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border/30">
                          <img
                            src={b.coverImage}
                            alt={b.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="space-y-1 flex-1 min-w-0">
                          <p className="text-xs font-bold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                            {b.title}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{b.readingTime} min read</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-xs italic text-muted-foreground">No other posts in this column yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <VisitorFooter />
    </>
  );
}
