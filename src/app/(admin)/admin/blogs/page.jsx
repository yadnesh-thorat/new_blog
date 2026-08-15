"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Bold,
  Italic,
  Code,
  Heading2,
  Heading3,
  List,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  ChevronDown,
  Check,
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
} from "lucide-react";
import { dbService } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import confetti from "canvas-confetti";

// Custom Dropdown Component
function CustomDropdown({ value, onChange, options, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative flex-1 sm:flex-initial min-w-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2.5 rounded-xl border border-border bg-background/50 px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-semibold min-w-[140px] hover:bg-muted/40"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-full sm:w-56 max-h-60 overflow-y-auto rounded-xl border border-border/40 bg-card p-1 shadow-lg backdrop-blur-md z-50 animate-fade-in divide-y divide-border/10 focus:outline-none">
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-lg text-left transition-all ${
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-muted/70"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BlogsManagerContent() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialAction = searchParams.get("action");
  
  const handleInsertFormat = (textareaId, syntax, setter) => {
    const textarea = document.getElementById(textareaId);
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let replacement = "";
    if (syntax === "bold") replacement = `**${selected || "bold text"}**`;
    else if (syntax === "italic") replacement = `*${selected || "italic text"}*`;
    else if (syntax === "code") replacement = `\`${selected || "code"}\``;
    else if (syntax === "h2") replacement = `\n## ${selected || "Heading 2"}\n`;
    else if (syntax === "h3") replacement = `\n### ${selected || "Heading 3"}\n`;
    else if (syntax === "list") replacement = `\n- ${selected || "list item"}`;
    else if (syntax === "quote") replacement = `\n> ${selected || "blockquote"}\n`;
    else if (syntax === "link") replacement = `[${selected || "link text"}](https://example.com)`;
    else if (syntax === "image") replacement = `![${selected || "image alt"}](https://example.com/image.png)`;
    
    const newVal = text.substring(0, start) + replacement + text.substring(end);
    setter(newVal);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };

  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [author, setAuthor] = useState("");
  // List settings
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const categoryOptions = [
    { value: "all", label: "All Categories" },
    ...categories.map((c) => ({ value: c.slug, label: c.name }))
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "draft", label: "Drafts" },
    { value: "published", label: "Published" }
  ];

  // Form settings
  const [isEditing, setIsEditing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [editBlogId, setEditBlogId] = useState(null);
  // Form fields
  const [title, setTitle] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [content, setContent] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [imageCredit, setImageCredit] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [status, setStatus] = useState("draft");
  const [scheduledAt, setScheduledAt] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const url = await dbService.uploadImage(file);
      setCoverImage(url);
      setSuccessMsg("Cover image uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload image file. Please try pasting a URL directly.");
    } finally {
      setUploadingImage(false);
    }
  };

  // Seeding helper removed to disable demo/mock blog insertion.

  // Load Data
  const loadData = async () => {
    const allBlogs = await dbService.getBlogs(true); // Include drafts
    const allCats = await dbService.getCategories();
    const allAdmins = await dbService.getAdmins();
    setBlogs(allBlogs);
    setCategories(allCats);
    setAdminUsers(allAdmins);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle URL action parameter (e.g. ?action=create)
  useEffect(() => {
    if (initialAction === "create") {
      handleOpenCreate();
      // Remove query param to prevent loop on updates
      navigate("/admin/blogs", { replace: true });
    }
  }, [initialAction, navigate]);

  // Auto-generate slug from Title
  useEffect(() => {
    if (!editBlogId) {
      const generated = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [title, editBlogId]);

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditing(true);
    setEditBlogId(null);
    setTitle("");
    setTitleEn("");
    setSlug("");
    setExcerpt("");
    setExcerptEn("");
    setContent("");
    setContentEn("");
    setCoverImage(
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    );
    setImageCredit("");
    setCategory("");
    setCustomCategory("");
    setTagsInput("");
    setAuthor("");
    setStatus("draft");
    setScheduledAt("");
    setSeoTitle("");
    setSeoDesc("");
    setErrorMsg("");
    setSuccessMsg("");
    setShowPreview(false);
  };

  // Open Edit Form
  const handleOpenEdit = (blog) => {
    setIsEditing(true);
    setEditBlogId(blog.id);
    setTitle(blog.title);
    setTitleEn(blog.titleEn || "");
    setSlug(blog.slug);
    setExcerpt(blog.excerpt || "");
    setExcerptEn(blog.excerptEn || "");
    setContent(blog.content || "");
    setContentEn(blog.contentEn || "");
    setCoverImage(blog.coverImage);
    setImageCredit(blog.coverImageCredit || blog.imageCredit || "");
    
    // Check if the blog's category exists in standard categories
    if (!blog.category) {
      setCategory("");
      setCustomCategory("");
    } else {
      const categoryExists = categories.some((c) => c.slug === blog.category);
      if (categoryExists) {
        setCategory(blog.category);
        setCustomCategory("");
      } else {
        setCategory("__custom__");
        setCustomCategory(blog.category);
      }
    }
    
    setTagsInput((blog.tags || []).join(", "));
    // Extract string author name (blog.author may already be a resolved object from getBlogs)
    const rawAuthor = typeof blog.author === "object" ? (blog.author?.name || blog.author?.email || "") : (blog.author || "");
    setAuthor(rawAuthor.toLowerCase() === "admin" ? "" : rawAuthor);
    setStatus(blog.status);
    setScheduledAt(blog.scheduledAt || "");
    setSeoTitle(blog.seo?.title || "");
    setSeoDesc(blog.seo?.description || "");
    setErrorMsg("");
    setSuccessMsg("");
    setShowPreview(false);
  };

  // Close Form
  const handleCloseForm = () => {
    setIsEditing(false);
    setEditBlogId(null);
    setShowPreview(false);
  };

  // Handle Save
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (submitting) return;

    // Only title, cover photo, and image credit are required
    if (!title.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!coverImage.trim()) {
      setErrorMsg("Cover photo is required.");
      return;
    }
    if (!imageCredit.trim()) {
      setErrorMsg("Image credit / source is required.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    let finalCategory = category;
    if (category === "__custom__") {
      const customName = customCategory.trim();
      if (customName) {
        // Generate slug from the custom name
        const customSlug = customName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        finalCategory = customSlug;

        // If the category doesn't exist, auto-create it
        const categoryExists = categories.some((c) => c.slug === customSlug);
        if (!categoryExists) {
          try {
            await dbService.saveCategory({
              name: customName,
              slug: customSlug,
              description: `Auto-generated category for ${customName}`,
              image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
            });
          } catch (err) {
            console.error("Failed to auto-create category:", err);
          }
        }
      } else {
        // No custom category entered — leave blank
        finalCategory = "";
      }
    }

    const blogData = {
      title,
      titleEn,
      slug,
      excerpt,
      excerptEn,
      content,
      contentEn,
      coverImage,
      coverImageCredit: imageCredit,
      category: finalCategory,
      tags,
      author: (typeof author === "string" ? author.trim() : (author?.name || author?.email || "")) || "Admin",
      status,
      scheduledAt: scheduledAt || null,
      seo: {
        title: seoTitle || title,
        description: seoDesc || excerpt,
      },
    };

    if (editBlogId) {
      blogData.id = editBlogId;
      // Preserve dates / counters
      const existing = blogs.find((b) => b.id === editBlogId);
      if (existing) {
        blogData.createdAt = existing.createdAt;
        blogData.views = existing.views;
      }
    }

    try {
      await dbService.saveBlog(blogData);
      setSuccessMsg(
        editBlogId
          ? "Blog updated successfully!"
          : "Blog created successfully!",
      );
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
      });

      await loadData();
      setTimeout(() => {
        handleCloseForm();
      }, 1000);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to save blog post.");
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete
  const handleDeleteBlog = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this blog post?"))
      return;
    try {
      await dbService.deleteBlog(id);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // Quick Toggle Visibility (Published / Live vs Draft / Hidden) without deleting
  const handleToggleVisibility = async (blog) => {
    const isCurrentlyPublished = blog.status === "published";
    const newStatus = isCurrentlyPublished ? "draft" : "published";

    // Optimistic UI update
    setBlogs((prev) =>
      prev.map((b) =>
        b.id === blog.id
          ? {
              ...b,
              status: newStatus,
              publishedAt:
                newStatus === "published"
                  ? b.publishedAt || new Date().toISOString()
                  : b.publishedAt,
            }
          : b
      )
    );

    try {
      const updatedBlog = {
        ...blog,
        status: newStatus,
        publishedAt:
          newStatus === "published"
            ? blog.publishedAt || new Date().toISOString()
            : blog.publishedAt || "",
      };
      await dbService.saveBlog(updatedBlog);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle blog visibility:", err);
      await loadData();
    }
  };

  // Filter logic
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      categoryFilter === "all" || blog.category === categoryFilter;
    const matchesStatus =
      statusFilter === "all" || blog.status === statusFilter;
    return matchesSearch && matchesCat && matchesStatus;
  });

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
            <pre className={`bg-[#0d1117] text-white p-4 overflow-x-auto text-xs font-mono border border-border/40 ${language ? "rounded-b-lg rounded-t-none" : "rounded-lg"}`}>
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      }
      if (block.startsWith("## ")) {
        const hTitle = block.replace("## ", "");
        return (
          <h2 key={idx} className="text-lg sm:text-xl font-bold font-geist-sans text-foreground mt-8 mb-3 border-b border-border/20 pb-1">
            {hTitle}
          </h2>
        );
      }
      if (block.startsWith("### ")) {
        const hTitle = block.replace("### ", "");
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold font-geist-sans text-foreground mt-6 mb-2">
            {hTitle}
          </h3>
        );
      }
      if (block.startsWith("* ") || block.startsWith("- ")) {
        const items = block.split(/\n[*\-]\s/);
        return (
          <ul key={idx} className="list-disc pl-5 my-3 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
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
        .replace(inlineCodePattern, "<code class='bg-muted px-1.5 py-0.5 rounded text-[10px] font-mono border border-border/40 text-primary dark:text-white'>$1</code>");
      return (
        <p key={idx} className="text-xs sm:text-sm leading-relaxed text-muted-foreground my-3" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      );
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
            Article Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create drafts, schedule publish times, write detailed posts, and
            manage keywords.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition-opacity"
          >
            <Plus className="h-4.5 w-4.5" /> Create Article
          </button>
        )}
      </div>

      {isEditing ? (
        /* Blog Edit / Create Screen — Full Page Editorial Layout */
        <div className="space-y-6 animate-fade-in pb-16">
          {/* Top Sticky/Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border/40 p-4 sm:p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseForm}
                className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-border/50 bg-background hover:bg-muted text-foreground transition-all cursor-pointer shrink-0 shadow-sm"
                title="Back to Articles"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Article Editor
                  </span>
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    status === "published" 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                  }`}>
                    {status === "published" ? "Ready to Publish" : "Draft Mode"}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-geist-sans tracking-tight text-foreground mt-0.5">
                  {editBlogId ? "Modify Blog Article" : "Compose New Article"}
                </h2>
              </div>
            </div>

            {/* Top Action Buttons & Mode Switcher */}
            <div className="flex items-center gap-2.5 self-end md:self-auto">
              {/* Edit vs Preview Toggle */}
              <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border/40 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    !showPreview
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    showPreview
                      ? "bg-background text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-all active:scale-95 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Discard
              </button>
              <button
                type="button"
                onClick={handleSaveBlog}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-md"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{submitting ? "Saving..." : (editBlogId ? "Update Article" : "Save & Publish")}</span>
              </button>
            </div>
          </div>

          {/* Feedback Messages */}
          {successMsg && (
            <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 p-4 rounded-2xl text-sm font-semibold shadow-sm animate-fade-in">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2.5 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-4 rounded-2xl text-sm font-semibold shadow-sm animate-fade-in">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveBlog} className="space-y-8">
            {showPreview ? (
              /* Live Preview Component */
              <div className="space-y-8 animate-fade-in bg-card border border-border/40 rounded-3xl p-6 sm:p-10 shadow-sm">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full uppercase text-[11px] tracking-wider">
                      {categories.find((c) => c.slug === category)?.name || category || "Uncategorized"}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">
                      {status === "published" ? "Published Post" : "Draft Preview"}
                    </span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black text-foreground font-geist-sans tracking-tight leading-tight">
                    {title || "Untitled Article Preview"}
                  </h1>
                  {titleEn && (
                    <p className="text-lg text-muted-foreground font-medium">
                      {titleEn}
                    </p>
                  )}
                  <p className="text-sm sm:text-base text-muted-foreground italic font-medium leading-relaxed border-l-4 border-primary/40 pl-4 py-1">
                    {excerpt || "No summary provided yet. Write an excerpt in Edit mode."}
                  </p>

                  {coverImage && (
                    <div className="my-6 rounded-2xl overflow-hidden border border-border/40 shadow-md">
                      <img src={coverImage} alt="Cover Preview" className="w-full max-h-[420px] object-cover" />
                      {imageCredit && (
                        <p className="text-[11px] text-muted-foreground text-center py-2 bg-muted/20">
                          Source: {imageCredit}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border/20 pt-8 mt-8 prose dark:prose-invert max-w-none">
                    {content ? renderRichText(content) : (
                      <p className="text-sm text-muted-foreground italic">Write content in Edit Mode to see full formatted preview here.</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Two-Column Editorial Grid Layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* ══ LEFT MAIN COLUMN (8 cols) — Titles, Excerpts, Content ══ */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Card 1: Titles & Excerpts */}
                  <div className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="border-b border-border/20 pb-4">
                      <h3 className="text-base font-bold font-geist-sans text-foreground">
                        Article Information
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Provide headlines and summaries in Marathi and English.
                      </p>
                    </div>

                    {/* Article Titles (Bilingual) */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="blog-title"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                          >
                            <span>Article Title — मराठी</span>
                            <span style={{ color: '#ef4444', fontSize: '14px', lineHeight: 1 }}>*</span>
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                            मराठी
                          </span>
                        </div>
                        <input
                          id="blog-title"
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="उदा. नवनिर्मितीची नवी दिशा..."
                          className="w-full h-11 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="blog-title-en"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Article Title — English
                          </label>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 uppercase">
                            English
                          </span>
                        </div>
                        <input
                          id="blog-title-en"
                          type="text"
                          value={titleEn}
                          onChange={(e) => setTitleEn(e.target.value)}
                          placeholder="e.g. Scaling Modern Web Applications..."
                          className="w-full h-11 rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 font-medium"
                        />
                      </div>
                    </div>

                    {/* Excerpt / Short Summary (Bilingual) */}
                    <div className="space-y-5 pt-4 border-t border-border/20">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="blog-excerpt"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Description / Summary — मराठी
                          </label>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            मराठी
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2.5 py-1.5 border-b-0">
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt", "bold", setExcerpt)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Bold"
                          >
                            <Bold className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt", "italic", setExcerpt)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Italic"
                          >
                            <Italic className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt", "code", setExcerpt)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Code"
                          >
                            <Code className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <textarea
                          id="blog-excerpt"
                          rows={3}
                          value={excerpt}
                          onChange={(e) => setExcerpt(e.target.value)}
                          placeholder="मराठी संक्षिप्त वर्णन लिहा..."
                          className="w-full rounded-b-xl rounded-t-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label
                            htmlFor="blog-excerpt-en"
                            className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                          >
                            Description / Summary — English
                          </label>
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">
                            English
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2.5 py-1.5 border-b-0">
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt-en", "bold", setExcerptEn)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Bold"
                          >
                            <Bold className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt-en", "italic", setExcerptEn)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Italic"
                          >
                            <Italic className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInsertFormat("blog-excerpt-en", "code", setExcerptEn)}
                            className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                            title="Code"
                          >
                            <Code className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <textarea
                          id="blog-excerpt-en"
                          rows={3}
                          value={excerptEn}
                          onChange={(e) => setExcerptEn(e.target.value)}
                          placeholder="Brief English summary or excerpt..."
                          className="w-full rounded-b-xl rounded-t-none border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Main Body Markdown Content */}
                  <div className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                    <div className="border-b border-border/20 pb-4">
                      <h3 className="text-base font-bold font-geist-sans text-foreground">
                        Article Content (Markdown)
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Write in-depth content with headings, lists, quotes, images, and code.
                      </p>
                    </div>

                    {/* Markdown Content — मराठी */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="blog-content"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Markdown Body — मराठी
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-primary/10 text-primary uppercase">
                          मराठी मजकूर
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2.5 py-1.5 border-b-0 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "bold", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "italic", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "code", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Code"
                        >
                          <Code className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "h2", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Heading 2"
                        >
                          <Heading2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "h3", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Heading 3"
                        >
                          <Heading3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "list", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Bullet List"
                        >
                          <List className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "quote", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Blockquote"
                        >
                          <Quote className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "link", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Insert Link"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content", "image", setContent)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Insert Image"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <textarea
                        id="blog-content"
                        rows={12}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="मराठीत सविस्तर लेख लिहा..."
                        className="w-full rounded-b-xl rounded-t-none border border-border bg-background px-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                      />
                    </div>

                    {/* Markdown Content — English */}
                    <div className="space-y-2 pt-4 border-t border-border/20">
                      <div className="flex justify-between items-center">
                        <label
                          htmlFor="blog-content-en"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Markdown Body — English
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-500 uppercase">
                          English Content
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2.5 py-1.5 border-b-0 overflow-x-auto">
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "bold", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Bold"
                        >
                          <Bold className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "italic", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Italic"
                        >
                          <Italic className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "code", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Code"
                        >
                          <Code className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "h2", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Heading 2"
                        >
                          <Heading2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "h3", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Heading 3"
                        >
                          <Heading3 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "list", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Bullet List"
                        >
                          <List className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "quote", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Blockquote"
                        >
                          <Quote className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "link", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Insert Link"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleInsertFormat("blog-content-en", "image", setContentEn)}
                          className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 cursor-pointer"
                          title="Insert Image"
                        >
                          <ImageIcon className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <textarea
                        id="blog-content-en"
                        rows={10}
                        value={contentEn}
                        onChange={(e) => setContentEn(e.target.value)}
                        placeholder="Write detailed English article here..."
                        className="w-full rounded-b-xl rounded-t-none border border-border bg-background px-4 py-3 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                      />
                    </div>
                  </div>
                </div>

                {/* ══ RIGHT SIDEBAR COLUMN (4 cols) — Media, Publishing, SEO ══ */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Card 3: Featured Cover & Media */}
                  <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5 shadow-sm">
                    <div className="border-b border-border/20 pb-3">
                      <h3 className="text-sm font-bold font-geist-sans text-foreground">
                        Featured Cover Media
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Primary thumbnail & header image.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Cover Image Input + Upload */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-cover"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                        >
                          <span>Cover Image URL</span>
                          <span style={{ color: '#ef4444', fontSize: '14px', lineHeight: 1 }}>*</span>
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="blog-cover"
                            type="text"
                            required
                            value={coverImage}
                            onChange={(e) => setCoverImage(e.target.value)}
                            placeholder="Paste image URL..."
                            className="flex-1 h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                          />
                          <label className="rounded-xl border border-border bg-muted/60 hover:bg-muted text-xs font-bold px-3.5 h-10 cursor-pointer shrink-0 flex items-center justify-center transition-all active:scale-95 text-foreground shadow-sm">
                            <span>{uploadingImage ? "..." : "Upload"}</span>
                            <input
                              type="file"
                              accept="image/*"
                              disabled={uploadingImage}
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Cover Image Preview */}
                      {coverImage && (
                        <div className="relative h-44 w-full overflow-hidden rounded-2xl border border-border bg-muted/30 flex items-center justify-center shadow-inner group">
                          <img
                            src={coverImage}
                            alt="Cover Preview"
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
                            }}
                          />
                        </div>
                      )}

                      {/* Photo Credit */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-cover-credit"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"
                        >
                          <span>Photo Credit / Source</span>
                          <span style={{ color: '#ef4444', fontSize: '14px', lineHeight: 1 }}>*</span>
                        </label>
                        <input
                          id="blog-cover-credit"
                          type="text"
                          required
                          value={imageCredit}
                          onChange={(e) => setImageCredit(e.target.value)}
                          placeholder="e.g. Unsplash / Photographer Name"
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 4: Publishing & Organization */}
                  <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-5 shadow-sm">
                    <div className="border-b border-border/20 pb-3">
                      <h3 className="text-sm font-bold font-geist-sans text-foreground">
                        Publishing & Settings
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Visibility, tags, category and author settings.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* Status */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-status"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Publication Status
                        </label>
                        <select
                          id="blog-status"
                          value={status}
                          onChange={(e) => setStatus(e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="draft" className="bg-card text-foreground">Draft (Unpublished)</option>
                          <option value="published" className="bg-card text-foreground">Published (Public)</option>
                        </select>
                      </div>

                      {/* Category */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-category"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Category
                        </label>
                        <select
                          id="blog-category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="" className="bg-card text-muted-foreground font-semibold">
                            -- No Category --
                          </option>
                          {categories.map((c) => (
                            <option key={c.id} value={c.slug} className="bg-card text-foreground">
                              {c.name}
                            </option>
                          ))}
                          <option value="__custom__" className="bg-card text-primary font-bold">
                            + Create Custom Category
                          </option>
                        </select>
                        {category === "__custom__" && (
                          <input
                            type="text"
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            placeholder="Type new category name..."
                            className="w-full h-10 rounded-xl border border-primary/40 bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all mt-1.5 shadow-sm"
                          />
                        )}
                      </div>

                      {/* URL Slug */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-slug"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          URL Slug
                        </label>
                        <input
                          id="blog-slug"
                          type="text"
                          value={slug}
                          onChange={(e) => setSlug(e.target.value)}
                          placeholder="auto-generated-slug"
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>

                      {/* Author */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-author"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Author / Writer
                        </label>
                        <select
                          id="blog-author"
                          value={author}
                          onChange={(e) => setAuthor(e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                        >
                          <option value="" className="bg-card text-foreground font-semibold">
                            -- No Author (Display as Admin) --
                          </option>
                          {adminUsers.map((admin) => (
                            <option key={admin.id} value={admin.displayName || admin.email} className="bg-card text-foreground">
                              {admin.displayName ? `${admin.displayName} (${admin.email})` : admin.email}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Tags */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-tags"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Tags (comma separated)
                        </label>
                        <input
                          id="blog-tags"
                          type="text"
                          value={tagsInput}
                          onChange={(e) => setTagsInput(e.target.value)}
                          placeholder="Tech, Politics, News"
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>

                      {/* Schedule */}
                      <div className="space-y-2">
                        <label
                          htmlFor="blog-schedule"
                          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Schedule Publish Date
                        </label>
                        <input
                          id="blog-schedule"
                          type="datetime-local"
                          value={scheduledAt}
                          onChange={(e) => setScheduledAt(e.target.value)}
                          className="w-full h-10 rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card 5: SEO Overrides */}
                  <div className="bg-card border border-border/40 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="border-b border-border/20 pb-3">
                      <h3 className="text-sm font-bold font-geist-sans text-foreground">
                        SEO & Metadata
                      </h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Customize how search engines display this article.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <label
                          htmlFor="blog-seo-title"
                          className="text-[11px] uppercase font-bold text-muted-foreground"
                        >
                          Meta Title
                        </label>
                        <input
                          id="blog-seo-title"
                          type="text"
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder="Defaults to article title..."
                          className="w-full h-9 rounded-xl border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label
                          htmlFor="blog-seo-desc"
                          className="text-[11px] uppercase font-bold text-muted-foreground"
                        >
                          Meta Description
                        </label>
                        <textarea
                          id="blog-seo-desc"
                          rows={2}
                          value={seoDesc}
                          onChange={(e) => setSeoDesc(e.target.value)}
                          placeholder="Defaults to excerpt..."
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Floating/Sticky Action Bar */}
            <div className="flex items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-card border border-border/40 shadow-lg">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-5 py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-all active:scale-95 cursor-pointer text-muted-foreground hover:text-foreground"
              >
                Discard & Return
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border border-border/60 bg-muted/30 hover:bg-muted text-foreground transition-all cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{showPreview ? "Back to Edit" : "Live Preview"}</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-md"
                >
                  <Save className="h-4 w-4" />
                  <span>{submitting ? "Saving..." : (editBlogId ? "Update Article" : "Save & Publish Article")}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Blog Directory List */
        <div className="space-y-4 animate-fade-in">
          {/* Filtering bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-4 rounded-2xl border border-border/30 bg-card/50 backdrop-blur-sm shadow-sm">
            <div className="flex rounded-xl border border-border bg-background/50 w-full sm:max-w-xs items-center px-3 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
              <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search repository..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs w-full focus:outline-none text-foreground py-0.5 placeholder:text-muted-foreground/60"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
              <CustomDropdown
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={categoryOptions}
                placeholder="Select Category"
              />

              <CustomDropdown
                value={statusFilter}
                onChange={setStatusFilter}
                options={statusOptions}
                placeholder="Select Status"
              />
            </div>
          </div>

          {/* Blogs Table / Card list */}
          {filteredBlogs.length > 0 ? (
            <div className="space-y-4">
              {/* Desktop view: Table */}
              <div className="hidden md:block overflow-hidden rounded-3xl border border-border/30 bg-card/45 backdrop-blur-md shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="border-b border-border/20 bg-muted/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        <th className="p-4">Cover / Title</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Visitor Visibility</th>
                        <th className="p-4">Created Date</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/25">
                      {filteredBlogs.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-muted/40 transition-colors duration-150"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={b.coverImage}
                                alt=""
                                className="h-10 w-16 object-cover rounded-lg border border-border/60 shrink-0 shadow-sm"
                              />

                              <div className="space-y-0.5 truncate max-w-xs sm:max-w-sm">
                                <p className="font-semibold text-foreground truncate">
                                  {b.title}
                                </p>
                                <p className="text-[10px] text-muted-foreground font-mono">
                                  /{b.slug}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {b.category ? (
                              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-muted text-foreground font-semibold">
                                {categories.find((c) => c.slug === b.category)
                                  ?.name || b.category}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground/60 italic">—</span>
                            )}
                          </td>
                          <td className="p-4">
                            {/* Interactive Visibility Toggle Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleVisibility(b)}
                              title={
                                b.status === "published"
                                  ? "Click to Hide from visitor website (Switch to Draft)"
                                  : "Click to Publish & make Live on visitor website"
                              }
                              className={`group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95 ${
                                b.status === "published"
                                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                  : "bg-muted/70 hover:bg-muted text-muted-foreground hover:text-foreground border-border/50"
                              }`}
                            >
                              {/* Animated Switch Pill */}
                              <span
                                className={`inline-flex h-4 w-7 rounded-full transition-colors duration-200 ease-in-out p-0.5 ${
                                  b.status === "published" ? "bg-emerald-500" : "bg-muted-foreground/30"
                                }`}
                              >
                                <span
                                  className={`inline-block h-3 w-3 rounded-full bg-white shadow-sm transform transition-transform duration-200 ease-in-out ${
                                    b.status === "published" ? "translate-x-3" : "translate-x-0"
                                  }`}
                                />
                              </span>
                              <span className="flex items-center gap-1">
                                {b.status === "published" ? (
                                  <>
                                    <Eye className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                                    <span>Live on Site</span>
                                  </>
                                ) : (
                                  <>
                                    <EyeOff className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <span>Hidden</span>
                                  </>
                                )}
                              </span>
                            </button>
                            {b.scheduledAt && (
                              <p className="text-[9px] text-muted-foreground mt-1">
                                Sched: {new Date(b.scheduledAt).toLocaleDateString()}
                              </p>
                            )}
                          </td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {b.status === "published" && (
                                <a
                                  href={`/blogs/${(b.slug || "").replace(/^\/+/, "")}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                  title="View in visitor page"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                              <button
                                onClick={() => handleToggleVisibility(b)}
                                className={`p-1.5 rounded-lg transition-all ${
                                  b.status === "published"
                                    ? "text-emerald-600 hover:bg-emerald-500/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                }`}
                                title={b.status === "published" ? "Hide from visitors" : "Make Live on website"}
                              >
                                {b.status === "published" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                              </button>
                              <button
                                onClick={() => handleOpenEdit(b)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80"
                                title="Edit post"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10"
                                title="Delete post"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile View: Cards stack */}
              <div className="md:hidden flex flex-col gap-4">
                {filteredBlogs.map((b) => (
                  <div
                    key={b.id}
                    className="rounded-2xl border border-border/30 bg-card p-4 space-y-4 shadow-sm hover:border-foreground/10 transition-all duration-300"
                  >
                    {/* Top row: Cover image and title info */}
                    <div className="flex gap-3">
                      <img
                        src={b.coverImage}
                        alt=""
                        className="h-14 w-20 object-cover rounded-lg border border-border/60 shrink-0 shadow-sm"
                      />
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-sm text-foreground leading-snug line-clamp-2">
                          {b.title}
                        </p>
                        <p className="text-[10px] text-muted-foreground font-mono truncate">
                          /{b.slug}
                        </p>
                      </div>
                    </div>

                    {/* Middle details: Category, Visibility Toggle, Date */}
                    <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1 border-t border-border/10">
                      {b.category ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold">
                          {categories.find((c) => c.slug === b.category)?.name || b.category}
                        </span>
                      ) : (
                        <div />
                      )}

                      {/* Mobile Visibility Toggle */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(b)}
                        title={b.status === "published" ? "Click to Hide" : "Click to Publish"}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all cursor-pointer active:scale-95 ${
                          b.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                            : "bg-muted/70 text-muted-foreground border-border/50"
                        }`}
                      >
                        <span
                          className={`inline-flex h-3.5 w-6 rounded-full transition-colors duration-200 p-0.5 ${
                            b.status === "published" ? "bg-emerald-500" : "bg-muted-foreground/30"
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 rounded-full bg-white shadow-sm transform transition-transform duration-200 ${
                              b.status === "published" ? "translate-x-2.5" : "translate-x-0"
                            }`}
                          />
                        </span>
                        <span>{b.status === "published" ? "Live on Site" : "Hidden"}</span>
                      </button>
                    </div>

                    {/* Bottom actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/15">
                      <div className="text-[10px] text-muted-foreground font-medium">
                        {new Date(b.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {b.status === "published" && (
                          <a
                            href={`/blogs/${(b.slug || "").replace(/^\/+/, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/45"
                            title="View in visitor page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/45"
                          title="Edit post"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(b.id)}
                          className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 border border-red-500/15"
                          title="Delete post"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-card">
              <FileText className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                No publications found
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try refining search parameters or write a new article.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function BlogsManagerPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[50vh] items-center justify-center">
          <p className="text-sm text-muted-foreground">
            Loading Blogs Manager...
          </p>
        </div>
      }
    >
      <BlogsManagerContent />
    </Suspense>
  );
}
