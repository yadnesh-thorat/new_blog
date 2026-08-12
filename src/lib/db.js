import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  updateDoc,
} from "firebase/firestore";
import { db, isFirebaseConfigured, storage } from "./firebase";

const FIREBASE_TIMEOUT_MS = 2500;
// Only block WRITE operations when they fail — never block reads
let firebaseWriteUnavailable = false;

function canUseFirebase() {
  return isFirebaseConfigured && Boolean(db);
}

// Only used for non-critical write operations (views, analytics)
function handleWriteFailure(operation, error) {
  if (!firebaseWriteUnavailable) {
    firebaseWriteUnavailable = true;
    console.warn(`Firebase ${operation} write failed (non-critical):`, error?.message);
  }
}

// Define Interfaces

// Removed default/mock categories — production categories should be added via admin or Firestore.
const MOCK_CATEGORIES = [];

// Remove mock settings to avoid injecting demo homepage content.
const MOCK_SETTINGS = null;

export const MOCK_BLOGS = [];

const MOCK_CONTACTS = [];

const MOCK_SUBSCRIBERS = [];

const MOCK_ADMINS = [];

const MOCK_COMMENTS = [];

const MOCK_ANALYTICS = {};

// STORAGE ACTIONS (LOCAL STORAGE OR MEMORY STORAGE FALLBACKS)
function getLocalData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) {
    // Do not auto-write fallback data to localStorage — return fallback only.
    return fallback;
  }
  try {
    const data = JSON.parse(stored);
    if (key === "aether_blogs_v2" && Array.isArray(data)) {
      const realBlogsOnly = data.filter((b) => b.id && !b.id.startsWith("mock-blog-"));
      if (realBlogsOnly.length !== data.length) {
        localStorage.setItem(key, JSON.stringify(realBlogsOnly));
        return realBlogsOnly;
      }
    }
    return data;
  } catch (e) {
    // On parse error, do not overwrite localStorage with fallback.
    return fallback;
  }
}

function setLocalData(key, data) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// Helper to race Firestore operations against a timeout so the app never hangs
function withTimeout(promise, timeoutMs = FIREBASE_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("Firebase operation timed out")),
      timeoutMs,
    );
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// HIGH LEVEL DATABASE SERVICE
export const dbService = {
  // --- BLOGS ---
  // Helper to map blog authors to a proper object
  _resolveAuthor(blog, admins) {
    if (!blog) return blog;

    // Extract a lookup key from the author field (whether string or object)
    let lookupName = null;
    let lookupEmail = null;
    if (blog.author && typeof blog.author === "string") {
      // Could be email or display name
      if (blog.author.includes("@")) {
        lookupEmail = blog.author.toLowerCase();
      } else {
        lookupName = blog.author.toLowerCase();
      }
    } else if (blog.author && typeof blog.author === "object") {
      lookupName = blog.author.name?.toLowerCase();
    }

    // Always try to find a real admin profile match first
    if (admins && admins.length > 0 && (lookupName || lookupEmail)) {
      const matched = admins.find((a) => {
        const adminName = a.displayName?.toLowerCase();
        const adminEmail = a.email?.toLowerCase();
        return (
          (lookupEmail && adminEmail === lookupEmail) ||
          (lookupName && adminName === lookupName)
        );
      });

      if (matched) {
        return {
          ...blog,
          author: {
            name: matched.displayName || matched.email,
            avatar: matched.avatarUrl || null,
            role: matched.role || "Administrator",
            bio: matched.bio || "Aether blog administrator and tech enthusiast."
          }
        };
      }
    }

    // If author is a structured object with data, use it as-is (or try to upgrade with first admin)
    const GENERIC_NAMES = ["admin user", "primary admin", "aether writer", "writer", "administrator"];
    const isGeneric = GENERIC_NAMES.includes((lookupName || "").toLowerCase());

    if (blog.author && typeof blog.author === "object") {
      // If the stored name is generic and we have admins, use the first/primary admin
      if (isGeneric && admins && admins.length > 0) {
        const primaryAdmin = admins[0];
        return {
          ...blog,
          author: {
            name: primaryAdmin.displayName || primaryAdmin.email,
            avatar: primaryAdmin.avatarUrl || null,
            role: primaryAdmin.role || "Administrator",
            bio: primaryAdmin.bio || "Aether blog administrator and tech enthusiast."
          }
        };
      }
      return {
        ...blog,
        author: {
          name: blog.author.name || "Aether Writer",
          avatar: null,  // Don't use hardcoded mock avatars — only real uploaded profile photos
          role: blog.author.role || "Writer",
          bio: blog.author.bio || null
        }
      };
    }

    // Default fallback — use primary admin if available
    if (admins && admins.length > 0) {
      const primaryAdmin = admins[0];
      return {
        ...blog,
        author: {
          name: primaryAdmin.displayName || primaryAdmin.email || "Aether Writer",
          avatar: primaryAdmin.avatarUrl || null,
          role: primaryAdmin.role || "Administrator",
          bio: primaryAdmin.bio || "Aether blog administrator and tech enthusiast."
        }
      };
    }

    return {
      ...blog,
      author: {
        name: (typeof blog.author === "string" ? blog.author : null) || "Aether Writer",
        avatar: null,
        role: "Writer",
        bio: "Aether blog administrator and tech enthusiast."
      }
    };
  },

  async getBlogs(includeDrafts = false) {
    let rawList = [];
    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        let q;
        if (includeDrafts) {
          q = query(blogsRef, orderBy("createdAt", "desc"));
        } else {
          q = query(
            blogsRef,
            where("status", "==", "published"),
            orderBy("createdAt", "desc"),
          );
        }
        const snapshot = await withTimeout(getDocs(q));
        snapshot.forEach((d) => {
          if (d.id && d.id.startsWith("mock-blog-")) {
            // Permanently purge legacy mock blog document from Firestore database
            deleteDoc(doc(db, "aether_blogs_v2", d.id)).catch(() => {});
          } else {
            rawList.push({ id: d.id, ...d.data() });
          }
        });
      } catch (err) {
        // Read failure — fall back to local cache, but do NOT block future Firebase reads
        console.warn("getBlogs: Firestore read failed, using local cache:", err?.message);
      }
    } else {
      // Fallback
      let blogs = getLocalData("aether_blogs_v2", []);
      let filtered = blogs.filter((b) => !b.id || !b.id.startsWith("mock-blog-"));
      if (!includeDrafts) {
        filtered = filtered.filter((b) => b.status === "published");
      }
      rawList = filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }

    // Map authors dynamically
    const admins = await this.getAdmins();
    return rawList.map((b) => this._resolveAuthor(b, admins));
  },

  async getBlogBySlug(slug) {
    if (!slug) return null;
    const normalizedSlug = slug.replace(/^\/+/, "").trim().toLowerCase();

    let rawBlog = null;

    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        // Try exact slug and lowercase variant
        const q = query(
          blogsRef,
          where("slug", "in", [normalizedSlug, `/${normalizedSlug}`, slug.trim()]),
          limit(1)
        );
        const snapshot = await withTimeout(getDocs(q), FIREBASE_TIMEOUT_MS);
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          rawBlog = { id: docSnap.id, ...docSnap.data() };
        } else {
          // Fallback: scan all blogs and do case-insensitive match
          const allSnap = await withTimeout(getDocs(blogsRef), FIREBASE_TIMEOUT_MS);
          allSnap.forEach((d) => {
            if (!rawBlog) {
              const s = (d.data().slug || "").replace(/^\/+/, "").trim().toLowerCase();
              if (s === normalizedSlug) {
                rawBlog = { id: d.id, ...d.data() };
              }
            }
          });
        }
      } catch (err) {
        // Do NOT poison global Firebase state for reads — just try local cache
        console.warn("getBlogBySlug: Firestore error, trying local cache", err?.message);
        const blogs = getLocalData("aether_blogs_v2", []);
        rawBlog = blogs.find((b) => {
          const blogSlugNorm = (b.slug || "").replace(/^\/+/, "").trim().toLowerCase();
          return blogSlugNorm === normalizedSlug;
        }) || null;
      }
    } else {
      const blogs = getLocalData("aether_blogs_v2", []);
      rawBlog = blogs.find((b) => {
        const blogSlugNorm = (b.slug || "").replace(/^\/+/, "").trim().toLowerCase();
        return blogSlugNorm === normalizedSlug;
      }) || null;
    }

    if (!rawBlog) return null;
    const admins = await this.getAdmins();
    return this._resolveAuthor(rawBlog, admins);
  },

  async saveBlog(blog) {
    // Resolve a sensible default author: prefer an existing admin, else fallback to a generic admin object
    const admins = await this.getAdmins();
    const defaultAuthor = (admins && admins.length > 0)
      ? {
          name: admins[0].displayName || admins[0].email || "Admin",
          email: admins[0].email || null,
          avatar: admins[0].avatarUrl || null,
          role: admins[0].role || "Administrator",
        }
      : { name: "Admin", email: null, role: "Administrator" };
    const words = (blog.content || "").trim().split(/\s+/).length;
    const readingTime = Math.ceil(words / 225) || 1;

    const newBlog = {
      id: blog.id || "blog-" + Math.random().toString(36).substr(2, 9),
      title: blog.title || "Untitled Blog",
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      coverImage:
        blog.coverImage ||
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80",
      coverImageCredit: blog.coverImageCredit || blog.imageCredit || "",
      category: blog.category || "web-dev",
      tags: blog.tags || [],
      author: blog.author || defaultAuthor,
      status: blog.status || "draft",
      publishedAt:
        blog.status === "published"
          ? blog.publishedAt || new Date().toISOString()
          : "",
      createdAt: blog.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      scheduledAt: blog.scheduledAt || null,
      views: blog.views || 0,
      readingTime: readingTime,
      seo: {
        title: blog.seo?.title || blog.title || "Untitled Blog",
        description: blog.seo?.description || blog.excerpt || "",
      },
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_blogs_v2", newBlog.id), newBlog));
        return newBlog;
      } catch (err) {
        handleWriteFailure("saveBlog", err);
      }
    }

    // Fallback
    const blogs = getLocalData("aether_blogs_v2", []);
    const index = blogs.findIndex((b) => b.id === newBlog.id);
    if (index > -1) {
      blogs[index] = newBlog;
    } else {
      blogs.push(newBlog);
    }
    setLocalData("aether_blogs_v2", blogs);
    return newBlog;
  },

  async deleteBlog(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_blogs_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteBlog", err);
        return false;
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", []);
    const filtered = blogs.filter((b) => b.id !== id);
    setLocalData("aether_blogs_v2", filtered);
    return true;
  },

  async incrementViews(slug) {
    // Log real daily hit for today's visitors count
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayKey = `aether_daily_hits_${todayStr}`;
      const currentHits = Number(localStorage.getItem(todayKey) || 0);
      localStorage.setItem(todayKey, String(currentHits + 1));
    } catch (e) {
      console.warn("Failed to store daily hit:", e);
    }

    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        const q = query(blogsRef, where("slug", "==", slug), limit(1));
        const snapshot = await withTimeout(getDocs(q));
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          await withTimeout(
            updateDoc(doc(db, "aether_blogs_v2", docSnap.id), {
              views: increment(1),
            }),
          );
        }
        return;
      } catch (err) {
        // Non-critical — silently skip view count increment
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", []);
    const blog = blogs.find((b) => b.slug === slug);
    if (blog) {
      blog.views = (blog.views || 0) + 1;
      setLocalData("aether_blogs_v2", blogs);
    }
  },

  // --- CATEGORIES ---
  async getCategories() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(
          getDocs(collection(db, "aether_categories_v2")),
        );
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) return list;

        // If Firestore returns empty, do not auto-seed defaults — return empty list.
        return list;
      } catch (err) {
        console.warn("getCategories: Firestore read failed, using local cache:", err?.message);
      }
    }
    // Fallback: return local cache if present, otherwise empty list.
    const cats = getLocalData("aether_categories_v2", []);
    if (Array.isArray(cats) && cats.length > 0) return cats;
    return [];
  },

  async saveCategory(cat) {
    const newCat = {
      id: cat.id || "cat-" + Math.random().toString(36).substr(2, 9),
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image:
        cat.image ||
        "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60",
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_categories_v2", newCat.id), newCat));
        return newCat;
      } catch (err) {
        handleWriteFailure("saveCategory", err);
      }
    }

    // Fallback
    const cats = getLocalData("aether_categories_v2", []);
    const index = cats.findIndex((c) => c.id === newCat.id);
    if (index > -1) {
      cats[index] = newCat;
    } else {
      cats.push(newCat);
    }
    setLocalData("aether_categories_v2", cats);
    return newCat;
  },

  async deleteCategory(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_categories_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteCategory", err);
        return false;
      }
    }
    // Fallback
    const cats = getLocalData("aether_categories_v2", []);
    const filtered = cats.filter((c) => c.id !== id);
    setLocalData("aether_categories_v2", filtered);
    return true;
  },

  // --- SETTINGS ---
  async getSettings() {
    let settingsData = null;
    if (canUseFirebase()) {
      try {
        const docSnap = await withTimeout(
          getDoc(doc(db, "aether_settings_v2", "global")),
          2500
        );
        if (docSnap.exists()) {
          settingsData = docSnap.data();
        }
      } catch (err) {
        console.warn("getSettings: Firestore read failed, using local cache:", err?.message);
      }
    }
    if (!settingsData) {
      // Do not auto-fallback to MOCK_SETTINGS. Try local cache without writing defaults.
      settingsData = getLocalData("aether_settings_v2", null);
    }

    // Return settings as-is; do not merge homepage defaults from MOCK_SETTINGS.
    return settingsData;
  },

  async saveSettings(settings) {
    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_settings_v2", "global"), settings));
        return settings;
      } catch (err) {
        handleWriteFailure("saveSettings", err);
      }
    }
    // Fallback
    setLocalData("aether_settings_v2", settings);
    return settings;
  },

  // --- CONTACTS ---
  async getContacts() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(
          getDocs(
            query(collection(db, "aether_contacts_v2"), orderBy("createdAt", "desc")),
          ),
        );
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.warn("getContacts: Firestore read failed:", err?.message);
      }
    }
    // Fallback
    return getLocalData("aether_contacts_v2", []);
  },

  async addContact(msg) {
    const newMsg = {
      id: "msg-" + Math.random().toString(36).substr(2, 9),
      ...msg,
      createdAt: new Date().toISOString(),
      read: false,
    };

if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_contacts_v2", newMsg.id), newMsg));
        return newMsg;
      } catch (err) {
        handleWriteFailure("addContact", err);
      }
    }

    // Fallback
    const contacts = getLocalData("aether_contacts_v2", []);
    contacts.unshift(newMsg);
    setLocalData("aether_contacts_v2", contacts);
    return newMsg;
  },

  async markContactAsRead(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(updateDoc(doc(db, "aether_contacts_v2", id), { read: true }));
        return;
      } catch (err) {
        handleWriteFailure("markContactAsRead", err);
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", []);
    const index = contacts.findIndex((c) => c.id === id);
    if (index > -1) {
      contacts[index].read = true;
      setLocalData("aether_contacts_v2", contacts);
    }
  },

  async deleteContact(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_contacts_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteContact", err);
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", []);
    const filtered = contacts.filter((c) => c.id !== id);
    setLocalData("aether_contacts_v2", filtered);
    return true;
  },

  // --- NEWSLETTER ---
  async getNewsletterSubscribers() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(getDocs(
          query(collection(db, "aether_newsletter_v2"), orderBy("subscribedAt", "desc")),
        ));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.warn("getNewsletterSubscribers: Firestore read failed:", err?.message);
      }
    }
    // Fallback
    return getLocalData("aether_newsletter_v2", []);
  },

  async subscribeNewsletter(email) {
    const subscriber = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      email: email.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
    };

    if (canUseFirebase()) {
      try {
        const newsletterRef = collection(db, "aether_newsletter_v2");
        const q = query(
          newsletterRef,
          where("email", "==", subscriber.email),
          limit(1),
        );
        const snapshot = await withTimeout(getDocs(q));
        if (!snapshot.empty) {
          return { success: true, isNew: false };
        }
        await withTimeout(setDoc(doc(db, "aether_newsletter_v2", subscriber.id), subscriber));
        return { success: true, isNew: true };
      } catch (err) {
        handleWriteFailure("subscribeNewsletter", err);
      }
    }

    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", []);
    const exists = subscribers.some((s) => s.email === subscriber.email);
    if (exists) {
      return { success: true, isNew: false };
    }
    subscribers.unshift(subscriber);
    setLocalData("aether_newsletter_v2", subscribers);
    return { success: true, isNew: true };
  },

  async deleteSubscriber(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_newsletter_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteSubscriber", err);
      }
    }
    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", []);
    const filtered = subscribers.filter((s) => s.id !== id);
    setLocalData("aether_newsletter_v2", filtered);
    return true;
  },

  // --- ANALYTICS ---
  async getAnalyticsData() {
    let blogs = [];
    let categories = [];
    let contacts = [];
    let newsletter = [];

    if (canUseFirebase()) {
      try {
        blogs = await this.getBlogs(true);
        categories = await this.getCategories();
        contacts = await this.getContacts();
        newsletter = await this.getNewsletterSubscribers();
      } catch (err) {
        console.warn("getAnalyticsData: Firestore read failed:", err?.message);
      }
    }

    // If Firebase failed or was bypassed, load fallback local data
    if (blogs.length === 0) {
      blogs = getLocalData("aether_blogs_v2", []);
    }
    if (categories.length === 0) {
      categories = getLocalData("aether_categories_v2", []);
    }
    if (contacts.length === 0) {
      contacts = getLocalData("aether_contacts_v2", []);
    }
    if (newsletter.length === 0) {
      newsletter = getLocalData("aether_newsletter_v2", []);
    }

    // Calculate actual sums
    const publishedBlogsCount = blogs.filter((b) => b.status === "published").length;
    let totalViews = blogs.reduce((sum, b) => sum + (Number(b.views) || 0), 0);

    // Auto-reset legacy 15376 mock view sums in Firestore & LocalStorage to clean 0
    if (totalViews === 15376) {
      totalViews = 0;
      blogs.forEach((b) => {
        b.views = 0;
        if (canUseFirebase() && b.id) {
          updateDoc(doc(db, "aether_blogs_v2", b.id), { views: 0 }).catch(() => {});
        }
      });
      try {
        setLocalData("aether_blogs_v2", blogs);
      } catch (e) {}
    }

    // Get real today's visitors count from live daily hit log
    let todaysVisitors = 0;
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const todayKey = `aether_daily_hits_${todayStr}`;
      todaysVisitors = Number(localStorage.getItem(todayKey) || 0);
    } catch (e) {
      todaysVisitors = 0;
    }

    return {
      totalBlogs: blogs.length,
      publishedBlogs: publishedBlogsCount,
      draftBlogs: blogs.length - publishedBlogsCount,
      categoriesCount: categories.length,
      totalViews: totalViews,
      todaysVisitors: todaysVisitors,
      contactsCount: contacts.length,
      newsletterCount: newsletter.length,
    };
  },

  // --- ADMINS ---
  async getAdmins() {
    if (canUseFirebase()) {
      try {
        const snapshot = await withTimeout(getDocs(collection(db, "aether_admins_v2")));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        // Quietly fallback to local cache on permission or network restriction
      }
    }
    // Fallback
    return getLocalData("aether_admins_v2", []);
  },

  async addAdmin(admin) {
    const newAdmin = {
      id: "admin-" + Math.random().toString(36).substr(2, 9),
      ...admin,
      createdAt: new Date().toISOString(),
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_admins_v2", newAdmin.id), newAdmin));
        return newAdmin;
      } catch (err) {
        handleWriteFailure("addAdmin", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", []);
    admins.push(newAdmin);
    setLocalData("aether_admins_v2", admins);
    return newAdmin;
  },

  async deleteAdmin(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_admins_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteAdmin", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", []);
    const filtered = admins.filter((a) => a.id !== id);
    setLocalData("aether_admins_v2", filtered);
    return true;
  },

  async updateAdminProfile(id, data) {
    if (canUseFirebase()) {
      try {
        await withTimeout(updateDoc(doc(db, "aether_admins_v2", id), data));
        return true;
      } catch (err) {
        handleWriteFailure("updateAdminProfile", err);
      }
    }

    // Fallback
    const admins = getLocalData("aether_admins_v2", []);
    const idx = admins.findIndex((a) => a.id === id);
    if (idx > -1) {
      admins[idx] = { ...admins[idx], ...data };
      setLocalData("aether_admins_v2", admins);
    }
    return true;
  },

  // --- COMMENTS ---
  async getComments(blogId = null) {
    if (canUseFirebase()) {
      try {
        let q = collection(db, "aether_comments_v2");
        if (blogId) {
          q = query(q, where("blogId", "==", blogId));
        }
        const snapshot = await withTimeout(getDocs(q));
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (err) {
        console.warn("getComments: Firestore read failed, using local cache:", err?.message);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", []);
    let filtered = comments;
    if (blogId) {
      filtered = comments.filter((c) => c.blogId === blogId);
    }
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async addComment(comment) {
    const newComment = {
      id: "comment-" + Math.random().toString(36).substr(2, 9),
      ...comment,
      createdAt: new Date().toISOString(),
      approved: true, // Auto-approved by default
    };

    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_comments_v2", newComment.id), newComment));
        return newComment;
      } catch (err) {
        handleWriteFailure("addComment", err);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", []);
    comments.push(newComment);
    setLocalData("aether_comments_v2", comments);
    return newComment;
  },

  async deleteComment(id) {
    if (canUseFirebase()) {
      try {
        await withTimeout(deleteDoc(doc(db, "aether_comments_v2", id)));
        return true;
      } catch (err) {
        handleWriteFailure("deleteComment", err);
      }
    }

    // Fallback
    const comments = getLocalData("aether_comments_v2", []);
    const filtered = comments.filter((c) => c.id !== id);
    setLocalData("aether_comments_v2", filtered);
    return true;
  },

  // --- IMAGE UPLOADS ---
  async uploadImage(file) {
    const IMGBB_API_KEY = "34051735573d6c57568941cdf51137dd";

    // 1. Primary: Upload to ImgBB for free unlimited CDN hosting & direct URL
    try {
      let imagePayload = file;

      // If passed a base64 string, convert to Blob for robust upload
      if (typeof file === "string" && file.startsWith("data:image")) {
        const res = await fetch(file);
        imagePayload = await res.blob();
      }

      const formData = new FormData();
      formData.append("image", imagePayload);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data && data.success && data.data && (data.data.display_url || data.data.url)) {
        return data.data.display_url || data.data.url;
      } else {
        console.warn("ImgBB API upload response:", data);
      }
    } catch (err) {
      console.warn("ImgBB upload failed, falling back to local canvas compression:", err);
    }

    // 2. Fallback: Client-side compressed canvas Base64 DataURL
    if (typeof file === "string") return file;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const dataUrl = canvas.toDataURL("image/webp", 0.7);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  },

  // --- MIGRATION HELPER ---
  async migrateExistingImagesToImgBB() {
    const IMGBB_API_KEY = "34051735573d6c57568941cdf51137dd";

    const uploadBase64 = async (base64Str) => {
      if (!base64Str || typeof base64Str !== "string" || !base64Str.startsWith("data:image")) {
        return base64Str;
      }
      try {
        // Convert Base64 Data URL to Blob for reliable binary upload
        const res = await fetch(base64Str);
        const blob = await res.blob();

        const formData = new FormData();
        formData.append("image", blob, "migrated_image.jpg");

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (data && data.success && data.data && (data.data.display_url || data.data.url)) {
          return data.data.display_url || data.data.url;
        } else {
          console.warn("ImgBB API returned error during migration:", data);
        }
      } catch (err) {
        console.error("Migration failed for image:", err);
      }
      return base64Str;
    };

    let migratedCount = 0;

    // 1. Migrate Blogs
    try {
      const blogs = await this.getBlogs();
      let blogsChanged = false;
      for (const blog of blogs) {
        if (blog.coverImage && blog.coverImage.startsWith("data:image")) {
          console.log(`Migrating blog cover image: ${blog.title}...`);
          const newUrl = await uploadBase64(blog.coverImage);
          if (newUrl && newUrl !== blog.coverImage && !newUrl.startsWith("data:image")) {
            blog.coverImage = newUrl;
            migratedCount++;
            blogsChanged = true;
            if (canUseFirebase()) {
              try {
                await updateDoc(doc(db, "aether_blogs_v2", blog.id), { coverImage: newUrl });
              } catch (e) { console.warn("Firestore blog update failed:", e); }
            }
          }
        }
      }
      if (blogsChanged) {
        setLocalData("aether_blogs_v2", blogs);
      }
    } catch (err) {
      console.warn("Blog migration check failed:", err);
    }

    // 2. Migrate Categories
    try {
      const categories = await this.getCategories();
      let catChanged = false;
      for (const cat of categories) {
        if (cat.image && cat.image.startsWith("data:image")) {
          console.log(`Migrating category image: ${cat.name}...`);
          const newUrl = await uploadBase64(cat.image);
          if (newUrl && newUrl !== cat.image && !newUrl.startsWith("data:image")) {
            cat.image = newUrl;
            migratedCount++;
            catChanged = true;
            if (canUseFirebase()) {
              try {
                await updateDoc(doc(db, "aether_categories_v2", cat.id), { image: newUrl });
              } catch (e) { console.warn("Firestore category update failed:", e); }
            }
          }
        }
      }
      if (catChanged) {
        setLocalData("aether_categories_v2", categories);
      }
    } catch (err) {
      console.warn("Category migration check failed:", err);
    }

    // 3. Migrate Settings
    try {
      const settings = await this.getSettings();
      let settingsChanged = false;
      if (settings && settings.logoImage && settings.logoImage.startsWith("data:image")) {
        console.log("Migrating logo image...");
        const newUrl = await uploadBase64(settings.logoImage);
        if (newUrl && newUrl !== settings.logoImage && !newUrl.startsWith("data:image")) {
          settings.logoImage = newUrl;
          migratedCount++;
          settingsChanged = true;
        }
      }
      if (settingsChanged) {
        await this.updateSettings(settings);
      }
    } catch (err) {
      console.warn("Settings migration check failed:", err);
    }

    // 4. Migrate Media Items in local storage if present
    try {
      const media = getLocalData("aether_media_v2", []);
      let mediaChanged = false;
      for (const item of media) {
        if (item.url && item.url.startsWith("data:image")) {
          console.log(`Migrating media item: ${item.name || item.id}...`);
          const newUrl = await uploadBase64(item.url);
          if (newUrl && newUrl !== item.url && !newUrl.startsWith("data:image")) {
            item.url = newUrl;
            migratedCount++;
            mediaChanged = true;
          }
        }
      }
      if (mediaChanged) {
        setLocalData("aether_media_v2", media);
      }
    } catch (err) {
      console.warn("Media migration check failed:", err);
    }

    console.log(`Migration complete. Migrated ${migratedCount} images to ImgBB.`);
    return migratedCount;
  },
};
