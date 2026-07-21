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
} from "lucide-react";
import { dbService, MOCK_BLOGS } from "@/lib/db";
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
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
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

  const handleSeedMarathiArticles = async () => {
    if (submitting) return;
    if (!confirm("Are you sure you want to seed 10 Marathi articles directly into the database?")) return;
    
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("Seeding started... please wait.");
    
    try {
      let count = 0;
      for (const blog of MOCK_BLOGS) {
        await dbService.saveBlog({
          ...blog,
          status: "published",
          createdAt: new Date(Date.now() - count * 3600000 * 24).toISOString()
        });
        count++;
      }
      setSuccessMsg("Successfully seeded 10 Marathi articles directly into the database!");
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
      await loadData();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to seed articles.");
    } finally {
      setSubmitting(false);
    }
  };

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
    setSlug("");
    setExcerpt("");
    setContent("");
    setCoverImage(
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
    );
    setImageCredit("");
    setCategory(categories[0]?.slug || "__custom__");
    setCustomCategory("");
    setTagsInput("");
    setAuthor(user?.displayName || user?.email || "");
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
    setSlug(blog.slug);
    setExcerpt(blog.excerpt);
    setContent(blog.content);
    setCoverImage(blog.coverImage);
    setImageCredit(blog.coverImageCredit || blog.imageCredit || "");
    
    // Check if the blog's category exists in standard categories
    const categoryExists = categories.some((c) => c.slug === blog.category);
    if (categoryExists) {
      setCategory(blog.category);
      setCustomCategory("");
    } else {
      setCategory("__custom__");
      setCustomCategory(blog.category);
    }
    
    setTagsInput(blog.tags.join(", "));
    // Extract string author name (blog.author may already be a resolved object from getBlogs)
    const rawAuthor = typeof blog.author === "object" ? (blog.author?.name || blog.author?.email || "") : (blog.author || "");
    setAuthor(rawAuthor);
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
    if (!title.trim() || !slug.trim() || submitting) return;

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
      if (!customName) {
        setErrorMsg("Please enter a custom category name.");
        setSubmitting(false);
        return;
      }
      
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
    }

    const blogData = {
      title,
      slug,
      excerpt,
      content,
      coverImage,
      coverImageCredit: imageCredit,
      category: finalCategory,
      tags,
      author: typeof author === "object" ? (author?.name || author?.email || "") : author,
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
        /* Blog Edit / Create Screen */
        <div className="rounded-2xl border border-border/40 bg-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-border/20 pb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-bold font-geist-sans">
                {editBlogId ? "Modify Blog Article" : "Compose New Article"}
              </h3>
              
              {/* Edit vs Preview Toggle */}
              <div className="flex items-center gap-1 bg-muted/65 p-1 rounded-xl border border-border/40 text-[10px] font-bold uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-3 py-1 rounded-lg transition-all active:scale-95 ${!showPreview ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Edit Mode
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-3 py-1 rounded-lg transition-all active:scale-95 ${showPreview ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Live Preview
                </button>
              </div>
            </div>
            <button
              onClick={handleCloseForm}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-4 rounded-xl text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              {successMsg}
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-4 rounded-xl text-sm font-semibold">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSaveBlog} className="space-y-6">
            {showPreview ? (
              /* Live Preview Component */
              <div className="space-y-8 animate-entrance py-4 border border-border/40 rounded-3xl p-6 bg-background/50">
                {/* Header preview */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded uppercase text-[10px] tracking-wider">
                      {categories.find(c => c.slug === category)?.name || category}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                      {status === "published" ? "Published Post" : "Draft Preview"}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-foreground font-geist-sans tracking-tight leading-tight">
                    {title || "Untitled Article Preview"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground italic font-medium leading-relaxed max-w-2xl">
                    {excerpt || "No summary provided yet. Write an excerpt to see it spotlighted here."}
                  </p>
                </div>

                {/* Cover Image */}
                {coverImage && (
                  <div className="h-48 sm:h-80 w-full rounded-2xl overflow-hidden border border-border/30 shadow-sm">
                    <img src={coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Content Body Preview */}
                <div className="border-t border-border/20 pt-6 max-w-none">
                  {content ? renderRichText(content) : (
                    <p className="text-xs text-muted-foreground italic">Write content in Edit Mode to see rendering details here.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form columns */}
              <div className="lg:col-span-2 space-y-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="blog-title"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Article Title
                  </label>
                  <input
                    id="blog-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Scaling Next.js 15 Applications"
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="blog-slug"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      URL Slug
                    </label>
                    <input
                      id="blog-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="auto-generated-slug"
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="blog-category"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Category Column
                    </label>
                    <select
                      id="blog-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.slug} className="bg-card text-foreground">
                          {c.name}
                        </option>
                      ))}
                      <option value="__custom__" className="bg-card text-primary font-bold">
                        -- Create Custom Category (Type manually) --
                      </option>
                    </select>
                    {category === "__custom__" && (
                      <input
                        type="text"
                        required
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category name (e.g. AI Tools)"
                        className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50 mt-2 animate-entrance"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5">
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
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                      <option value="" className="bg-card text-muted-foreground">
                        -- Select Author --
                      </option>
                      {adminUsers.map((admin) => (
                        <option key={admin.id} value={admin.displayName || admin.email} className="bg-card text-foreground">
                          {admin.displayName ? `${admin.displayName} (${admin.email})` : admin.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="blog-excerpt"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Excerpt (Summary)
                    </label>
                    <span className="text-[9px] font-bold text-primary/80 uppercase">Rich Text enabled</span>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2 py-1.5 border-b-0">
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-excerpt", "bold", setExcerpt)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-excerpt", "italic", setExcerpt)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-excerpt", "code", setExcerpt)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Code"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    id="blog-excerpt"
                    required
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence preview shown on lists..."
                    className="w-full rounded-b-xl rounded-t-none border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  ></textarea>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="blog-content"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Markdown Content
                    </label>
                    <span className="text-[9px] font-bold text-primary/80 uppercase">Rich Text enabled</span>
                  </div>

                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2 py-1.5 border-b-0 overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "bold", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "italic", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "code", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Code Inline"
                    >
                      <Code className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-border/60 mx-1" />
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "h2", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Heading 2"
                    >
                      <Heading2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "h3", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Heading 3"
                    >
                      <Heading3 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "list", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Bullet List"
                    >
                      <List className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "quote", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Blockquote"
                    >
                      <Quote className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "link", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Insert Link"
                    >
                      <LinkIcon className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInsertFormat("blog-content", "image", setContent)}
                      className="p-1.5 rounded-lg hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40 flex items-center justify-center cursor-pointer"
                      title="Insert Image"
                    >
                      <ImageIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <textarea
                    id="blog-content"
                    required
                    rows={12}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write detailed article here... Support standard Markdown and ## headers"
                    className="w-full rounded-b-xl rounded-t-none border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  ></textarea>
                </div>
              </div>

              {/* Sidebar controls */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="blog-cover"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Cover Image
                    </label>
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Upload file or paste URL
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      id="blog-cover"
                      type="text"
                      required
                      value={coverImage}
                      onChange={(e) => setCoverImage(e.target.value)}
                      placeholder="Paste cover URL or upload..."
                      className="flex-1 rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                    />
                    <label className="rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold px-4 py-2.5 cursor-pointer shrink-0 flex items-center justify-center transition-all active:scale-95 text-foreground">
                      <span>{uploadingImage ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {coverImage && (
                    <div className="mt-2 relative h-48 w-full overflow-hidden rounded-xl border border-border bg-muted/20 flex items-center justify-center shadow-sm">
                      <img
                        src={coverImage}
                        alt="Cover Preview"
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";
                        }}
                      />
                    </div>
                  )}

                  <div className="pt-2">
                    <label
                      htmlFor="blog-cover-credit"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between"
                    >
                      <span>Photo Credit / Source</span>
                      <span className="text-[10px] text-muted-foreground/60 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      id="blog-cover-credit"
                      type="text"
                      value={imageCredit}
                      onChange={(e) => setImageCredit(e.target.value)}
                      placeholder="e.g. Photo by Unsplash / Photographer Name"
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50 mt-1.5"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="blog-tags"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Tags (Comma-separated)
                  </label>
                  <input
                    id="blog-tags"
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="React, NextJS, ServerActions"
                    className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="blog-status"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Status
                    </label>
                    <select
                      id="blog-status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
                    >
                      <option value="draft" className="bg-card text-foreground">Draft</option>
                      <option value="published" className="bg-card text-foreground">Published</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label
                      htmlFor="blog-schedule"
                      className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    >
                      Schedule Publish
                    </label>
                    <input
                      id="blog-schedule"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border/40 p-4 space-y-3 bg-muted/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-1">
                    SEO overrides
                  </h4>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="blog-seo-title"
                        className="text-[10px] uppercase font-bold text-muted-foreground"
                      >
                        Meta Title
                      </label>
                      <input
                        id="blog-seo-title"
                        type="text"
                        value={seoTitle}
                        onChange={(e) => setSeoTitle(e.target.value)}
                        placeholder="defaults to blog title"
                        className="w-full rounded-lg border border-border bg-background/50 px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-1">
                      <label
                        htmlFor="blog-seo-desc"
                        className="text-[10px] uppercase font-bold text-muted-foreground"
                      >
                        Meta Description
                      </label>
                      <textarea
                        id="blog-seo-desc"
                        rows={2}
                        value={seoDesc}
                        onChange={(e) => setSeoDesc(e.target.value)}
                        placeholder="defaults to excerpt"
                        className="w-full rounded-lg border border-border bg-background/50 px-2.5 py-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                      ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

            <div className="flex gap-3 justify-end pt-4 border-t border-border/20">
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted transition-all active:scale-95 cursor-pointer"
              >
                Discard
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all active:scale-95 cursor-pointer shadow-[0_4px_12px_rgba(99,102,241,0.25)]"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
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
                        <th className="p-4">Status</th>
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
                            <span className="text-xs px-2.5 py-0.5 rounded-lg bg-muted text-foreground font-semibold">
                              {categories.find((c) => c.slug === b.category)
                                ?.name || b.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                b.status === "published"
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              {b.status}
                            </span>
                            {b.scheduledAt && (
                              <p className="text-[9px] text-muted-foreground mt-0.5">
                                Sched:{" "}
                                {new Date(b.scheduledAt).toLocaleDateString()}
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

                    {/* Middle details: Category, Status, Engagement, Date */}
                    <div className="flex flex-wrap gap-2 items-center justify-between text-xs pt-1 border-t border-border/10">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-foreground font-semibold">
                          {categories.find((c) => c.slug === b.category)?.name || b.category}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                            b.status === "published"
                              ? "bg-green-500/10 text-green-600 dark:text-green-400"
                              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="flex gap-2.5 items-center text-[10px] text-muted-foreground font-semibold">
                        <span>
                          {new Date(b.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Bottom actions row */}
                    <div className="flex items-center justify-between pt-2 border-t border-border/15">
                      {b.scheduledAt ? (
                        <p className="text-[9px] text-muted-foreground font-semibold">
                          Sched: {new Date(b.scheduledAt).toLocaleDateString()}
                        </p>
                      ) : (
                        <div />
                      )}
                      
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
