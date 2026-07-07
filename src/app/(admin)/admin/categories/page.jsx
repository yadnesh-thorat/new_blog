"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { dbService } from "@/lib/db";
import confetti from "canvas-confetti";

export default function CategoriesManagerPage() {
  const [categories, setCategories] = useState([]);
  // Modal / Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editCatId, setEditCatId] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  
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
    else if (syntax === "list") replacement = `\n- ${selected || "list item"}`;
    
    const newVal = text.substring(0, start) + replacement + text.substring(end);
    setter(newVal);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 0);
  };
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const url = await dbService.uploadImage(file);
      setImage(url);
      setSuccessMsg("Cover image uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload image. Please try pasting a URL directly.");
    } finally {
      setUploading(false);
    }
  };

  const loadCategories = async () => {
    const list = await dbService.getCategories();
    setCategories(list);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Auto slugger
  useEffect(() => {
    if (!editCatId) {
      const generated = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setSlug(generated);
    }
  }, [name, editCatId]);

  const handleOpenCreate = () => {
    setIsOpen(true);
    setEditCatId(null);
    setName("");
    setSlug("");
    setDescription("");
    setImage(
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
    );
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleOpenEdit = (cat) => {
    setIsOpen(true);
    setEditCatId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setImage(cat.image);
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    setIsOpen(false);
    setEditCatId(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim() || submitting) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const catData = {
        name,
        slug,
        description,
        image,
      };

      if (editCatId) {
        catData.id = editCatId;
      }

      await dbService.saveCategory(catData);
      setSuccessMsg(
        editCatId
          ? "Category updated successfully!"
          : "Category created successfully!",
      );
      confetti({
        particleCount: 40,
        spread: 30,
        origin: { y: 0.8 },
      });

      await loadCategories();
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to save category.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? Blogs linked to this category may display raw labels.",
      )
    )
      return;
    try {
      await dbService.deleteCategory(id);
      await loadCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
            {isOpen 
              ? (editCatId ? "Update Category details" : "Register New Column")
              : "Category Catalog"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {isOpen
              ? "Configure your category details, slugs, and cover graphics."
              : "Group your articles into columns. Define covers, unique slugs, and brief editorial descriptions."}
          </p>
        </div>

        {isOpen ? (
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Catalog
          </button>
        ) : (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" /> Add Category
          </button>
        )}
      </div>

      {isOpen ? (
        /* Edit / Create Pane (Split-Page Layout) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
          {/* Left Column: Live Card Preview */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Live Card Preview
            </h3>
            
            <div className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col justify-between shadow-md relative group">
              <div>
                <div className="relative h-36 bg-muted/20 overflow-hidden flex items-center justify-center">
                  <img
                    src={image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60"}
                    alt="Category Cover Preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60";
                    }}
                  />

                  <span className="absolute top-3 left-3 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-foreground border border-white/10 shadow-sm">
                    /{slug || "new-column"}
                  </span>
                </div>
                
                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold font-geist-sans text-foreground">
                    {name || "Column Title"}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-4 font-medium min-h-[4rem]">
                    {description || "Provide an editorial description on the right side to see how the text will wrap and present in the column card..."}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-4 border-t border-border/10 flex gap-2 justify-end bg-muted/20 dark:bg-muted/5 opacity-50 select-none">
                <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                  interactive actions hidden during preview
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Form Fields */}
          <div className="lg:col-span-7 rounded-3xl border border-border/40 bg-card/50 backdrop-blur-md p-6 sm:p-8 space-y-6 shadow-sm relative overflow-hidden">
            {successMsg && (
              <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-4 rounded-xl text-sm font-semibold animate-fade-in">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-4 rounded-xl text-sm font-semibold animate-fade-in">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="cat-name"
                  className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
                >
                  Category Name
                </label>
                <input
                  id="cat-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Design & User Experience"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cat-slug"
                  className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
                >
                  URL Slug
                </label>
                <input
                  id="cat-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="design-ux"
                  className="w-full rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="cat-desc"
                    className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
                  >
                    Editorial Description
                  </label>
                  <span className="text-[9px] font-bold text-primary/80 uppercase">Rich Text enabled</span>
                </div>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-1 bg-muted/40 border border-border/40 rounded-t-xl px-2 py-1.5 border-b-0">
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("cat-desc", "bold", setDescription)}
                    className="p-1 px-2.5 rounded-lg text-xs font-bold hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40"
                    title="Bold"
                  >
                    B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("cat-desc", "italic", setDescription)}
                    className="p-1 px-2.5 rounded-lg text-xs italic hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40"
                    title="Italic"
                  >
                    I
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("cat-desc", "code", setDescription)}
                    className="p-1 px-2 rounded-lg text-xs font-mono hover:bg-muted/80 text-foreground transition-all active:scale-95 border border-transparent hover:border-border/40"
                    title="Code"
                  >
                    &lt;&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertFormat("cat-desc", "list", setDescription)}
                    className="p-1 px-2 rounded-lg text-[10px] hover:bg-muted/80 text-foreground transition-all active:scale-95 font-semibold border border-transparent hover:border-border/40"
                    title="Bullet List"
                  >
                    • List
                  </button>
                </div>

                <textarea
                  id="cat-desc"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what topics are covered under this column..."
                  className="w-full rounded-b-xl rounded-t-none border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/50"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="cat-img"
                    className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground"
                  >
                    Cover Image
                  </label>
                  <span className="text-[9px] text-muted-foreground font-bold">
                    Upload file or paste URL
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    id="cat-img"
                    type="text"
                    required
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="Paste cover URL or upload..."
                    className="flex-1 rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                  />
                  <label className="rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold px-4 py-2.5 cursor-pointer shrink-0 flex items-center justify-center transition-all active:scale-95 text-foreground">
                    <span>{uploading ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploading}
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-5 border-t border-border/20">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-border hover:bg-muted hover:text-foreground transition-all active:scale-95 cursor-pointer"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary text-primary-foreground hover:opacity-90 shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? "Saving..." : "Save Column"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        /* Categories Table list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-3xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col justify-between hover-lift shadow-sm relative group"
            >
              <div>
                <div className="relative h-32 bg-muted overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />

                  <span className="absolute top-3 left-3 bg-background/70 backdrop-blur-md px-2.5 py-1 rounded-xl text-[9px] font-extrabold uppercase tracking-wider text-foreground border border-white/10 shadow-sm">
                    /{cat.slug}
                  </span>
                </div>
                <div className="p-5 space-y-2">
                  <h4 className="text-base font-bold font-geist-sans text-foreground">
                    {cat.name}
                  </h4>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 font-medium">
                    {cat.description}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-4 border-t border-border/10 flex gap-2 justify-end bg-muted/20 dark:bg-muted/5">
                <button
                  onClick={() => handleOpenEdit(cat)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-card text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary/20 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-500/10 bg-card text-xs font-bold text-red-600 hover:bg-red-500/10 hover:border-red-500/30 transition-all duration-200 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
