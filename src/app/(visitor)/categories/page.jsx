"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { dbService } from "@/lib/db";
import { Search, Clock, ArrowRight, Layers, ChevronLeft } from "lucide-react";

function CategoriesContent() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeFilter = searchParams.get("filter") || "all";

  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadData() {
      const cats = await dbService.getCategories();
      const allBlogs = await dbService.getBlogs(false);
      setCategories(cats);
      setBlogs(allBlogs);
    }
    loadData();
  }, []);

  const handleSelectCategory = (slug) => {
    if (slug === "all") {
      navigate("/categories");
    } else {
      navigate(`/categories?filter=${slug}`);
    }
  };

  const filteredCategories = categories.filter((cat) => {
    const matchSearch =
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  const displayedBlogs = blogs.filter((blog) => {
    return activeFilter === "all" || blog.category === activeFilter;
  });

  const activeCategoryDetail = categories.find((c) => c.slug === activeFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-12">
      {/* Header section matching homepage */}
      <div className="border-b border-border/40 pb-5 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h3 className="font-geist-sans text-2xl font-bold">Browse by Category</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Specialized columns authored by our design architects, code creators, and database experts.
          </p>
        </div>
        {activeFilter === "all" && (
          <div className="flex items-center rounded-xl border border-border/30 bg-muted/20 px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all duration-300 w-full sm:w-72 shrink-0">
            <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs w-full focus:outline-none placeholder:text-muted-foreground/50 text-foreground"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors ml-1 shrink-0"
              >
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      <div className="space-y-10">
        {activeFilter === "all" ? (
          <>
            {/* Category count header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">
                <span className="font-bold text-foreground">{filteredCategories.length}</span> {filteredCategories.length === 1 ? "category" : "categories"} available
              </p>
            </div>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filteredCategories.map((cat, idx) => {
                const blogCount = blogs.filter((b) => b.category === cat.slug).length;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCategory(cat.slug)}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card hover-lift hover-glow gradient-border transition-all duration-300 cursor-pointer animate-entrance"
                    style={{ animationDelay: `${idx * 0.05}s` }}
                  >
                    <div>
                      <div className="relative h-44 overflow-hidden bg-muted flex items-center justify-center">
                        <img
                          src={cat.image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60"}
                          alt={cat.name}
                          onError={(e) => {
                            e.target.src = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60";
                          }}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                        <div className="absolute bottom-3 left-3 rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-bold text-foreground border border-white/10 shadow-sm">
                          {blogCount} {blogCount === 1 ? "article" : "articles"}
                        </div>
                      </div>
                      <div className="p-5 space-y-2">
                        <h3 className="text-base font-bold font-geist-sans group-hover:text-primary transition-colors duration-200">
                          {cat.name}
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {cat.description}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 pb-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary group-hover:translate-x-1 transition-transform duration-200">
                        Explore Articles <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Active Category Header Card */}
            {activeCategoryDetail && (
              <div className="relative overflow-hidden rounded-3xl border border-border/40 bg-card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-sm animate-entrance">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent pointer-events-none" />
                <img
                  src={activeCategoryDetail.image || "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60"}
                  alt={activeCategoryDetail.name}
                  onError={(e) => {
                    e.target.src = "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60";
                  }}
                  className="w-full sm:w-52 h-36 rounded-2xl object-cover border border-border/40 shrink-0 bg-muted"
                />

                <div className="space-y-3 text-center sm:text-left flex-1 relative z-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <span className="inline-flex self-center sm:self-start rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-primary">
                      Active Filter
                    </span>
                    <button
                      onClick={() => handleSelectCategory("all")}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="h-3 w-3" />
                      All Categories
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold font-geist-sans text-foreground">{activeCategoryDetail.name}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{activeCategoryDetail.description}</p>
                </div>
              </div>
            )}

            {/* Blogs filtered by category */}
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-border/40 pb-3">
                <h3 className="text-lg font-bold font-geist-sans">
                  Articles in {activeCategoryDetail?.name || activeFilter}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({displayedBlogs.length})</span>
                </h3>
              </div>
              {displayedBlogs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedBlogs.map((blog, idx) => (
                    <article
                      key={blog.id}
                      className="flex flex-col overflow-hidden rounded-2xl border border-border/30 bg-card/60 hover-lift hover-glow gradient-border transition-all duration-300 group animate-entrance"
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                        <span className="absolute top-3 left-3 rounded-lg bg-background/85 backdrop-blur-sm px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-wider text-foreground border border-white/10 shadow-sm">
                          {blog.category}
                        </span>
                      </div>
                      <div className="flex-1 flex flex-col p-5 space-y-3 justify-between">
                        <div className="space-y-2">
                          <Link
                            to={`/blogs/${blog.slug}`}
                            className="block hover:text-primary transition-colors duration-200"
                          >
                            <h4 className="text-base font-bold leading-snug line-clamp-2 text-foreground font-geist-sans">
                              {blog.title}
                            </h4>
                          </Link>
                          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                            {blog.excerpt}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-border/20 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {blog.author?.avatar ? (
                              <img
                                src={blog.author.avatar}
                                alt={blog.author.name}
                                className="h-6 w-6 rounded-full object-cover border border-border/50"
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full border border-border/50 bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                {blog.author?.name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                            )}
                            <span className="text-xs font-semibold text-foreground truncate max-w-[90px]">
                              {blog.author?.name || "Aether Writer"}
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-semibold">
                            <Clock className="h-3 w-3" /> {blog.readingTime} min
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-muted/10">
                  <Layers className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-foreground">No articles in this category yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon or explore other categories.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <>
      <VisitorNavbar />
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <div className="relative h-12 w-12">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
          </div>
        }
      >
        <CategoriesContent />
      </Suspense>
      <VisitorFooter />
    </>
  );
}
