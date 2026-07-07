"use client";

import React, { useState, useEffect } from "react";
import { Copy, Trash2, Plus, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function MediaLibraryPage() {
  const [mediaList, setMediaList] = useState([]);
  const [newUrl, setNewUrl] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [feedback, setFeedback] = useState("");

  // Initial premium stock illustrations for copy-pasting convenience
  const stockAssets = [
    {
      id: "stock-1",
      title: "Abstract Neon Shape",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-01T00:00:00Z",
    },
    {
      id: "stock-2",
      title: "Creative Workspace",
      url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-01T00:00:00Z",
    },
    {
      id: "stock-3",
      title: "Mobile App Wireframe Mockup",
      url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-02T00:00:00Z",
    },
    {
      id: "stock-4",
      title: "Holographic Glass",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-03T00:00:00Z",
    },
    {
      id: "stock-5",
      title: "Minimalist Code Editor",
      url: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-04T00:00:00Z",
    },
    {
      id: "stock-6",
      title: "Vaporwave Retro Horizon",
      url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&auto=format&fit=crop&q=80",
      createdAt: "2026-07-04T00:00:00Z",
    },
  ];

  useEffect(() => {
    // Load from localstorage if available, else load stocks
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("aether_media_library");
      if (stored) {
        try {
          setMediaList(JSON.parse(stored));
        } catch (e) {
          setMediaList(stockAssets);
        }
      } else {
        setMediaList(stockAssets);
        localStorage.setItem(
          "aether_media_library",
          JSON.stringify(stockAssets),
        );
      }
    }
  }, []);

  const saveToStorage = (updated) => {
    setMediaList(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("aether_media_library", JSON.stringify(updated));
    }
  };

  const handleAddMedia = (e) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    const newItem = {
      id: "media-" + Math.random().toString(36).substr(2, 9),
      title: newTitle.trim() || "Uploaded Asset",
      url: newUrl.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...mediaList];
    saveToStorage(updated);
    setNewUrl("");
    setNewTitle("");
    setFeedback("Asset cataloged successfully!");
    confetti({
      particleCount: 30,
      spread: 30,
      origin: { y: 0.8 },
    });

    setTimeout(() => setFeedback(""), 3000);
  };

  const handleDelete = (id) => {
    if (
      !confirm(
        "Are you sure you want to remove this media reference? (Doesn't affect published blogs currently referencing this URL)",
      )
    )
      return;
    const updated = mediaList.filter((m) => m.id !== id);
    saveToStorage(updated);
    setFeedback("Media reference deleted.");
    setTimeout(() => setFeedback(""), 2000);
  };

  const handleCopyLink = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
          Media Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Catalog and copy URLs for cover illustrations. Save Unsplash links or
          custom uploads in one centralized repository.
        </p>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          {feedback}
        </div>
      )}

      {/* Grid: Form and Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Register Asset (Col 4) */}
        <div className="lg:col-span-4 rounded-2xl border border-border/40 bg-card p-5 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground border-b border-border/20 pb-2 flex items-center gap-1.5">
            <Plus className="h-4.5 w-4.5" /> Catalog New Image
          </h3>

          <form onSubmit={handleAddMedia} className="space-y-3.5">
            <div className="space-y-1">
              <label
                htmlFor="media-title"
                className="text-[10px] uppercase font-bold text-muted-foreground"
              >
                Asset Title
              </label>
              <input
                id="media-title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Modern UI Mockup"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="media-url"
                className="text-[10px] uppercase font-bold text-muted-foreground"
              >
                Image URL
              </label>
              <input
                id="media-url"
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 transition-opacity"
            >
              Add to Library
            </button>
          </form>
        </div>

        {/* Gallery (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((m) => (
              <div
                key={m.id}
                className="group rounded-2xl border border-border/40 bg-card overflow-hidden flex flex-col justify-between hover:shadow transition-all"
              >
                <div className="relative aspect-video bg-muted overflow-hidden">
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleCopyLink(m.url, m.id)}
                      className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-foreground border border-border/30"
                      title="Copy URL link"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="p-1.5 rounded-lg bg-background/80 hover:bg-background text-red-600 border border-border/30"
                      title="Remove asset"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-3.5 space-y-1 bg-card border-t border-border/20">
                  <p className="text-xs font-bold text-foreground truncate">
                    {m.title}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-muted-foreground">
                    <span className="font-mono truncate max-w-[130px]">
                      {m.url}
                    </span>
                    {copiedId === m.id && (
                      <span className="text-green-600 dark:text-green-400 font-bold uppercase tracking-wider animate-fade-in">
                        Copied!
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
