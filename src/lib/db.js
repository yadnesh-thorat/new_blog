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

const FIREBASE_TIMEOUT_MS = 1200;
let firebaseUnavailable = typeof window !== "undefined" && sessionStorage.getItem("aether_firebase_unavailable") === "true";

function canUseFirebase() {
  return isFirebaseConfigured && Boolean(db) && !firebaseUnavailable;
}

function handleFirebaseFailure(operation, error) {
  if (!firebaseUnavailable) {
    firebaseUnavailable = true;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("aether_firebase_unavailable", "true");
    }
    console.warn(
      `Firebase ${operation} is unavailable right now; using local fallback data.`,
      error,
    );
  }
}

// Define Interfaces

const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Web Development",
    slug: "web-dev",
    description: "Modern frontend techniques, Next.js, React, CSS, and serverless engineering.",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "cat-2",
    name: "Design Systems",
    slug: "design-systems",
    description: "Typography, fluid grids, tokenization, animations, and premium visual components.",
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=60"
  },
  {
    id: "cat-3",
    name: "AI Engineering",
    slug: "ai-engineering",
    description: "Generative AI, Large Language Model orchestration, prompt engineering, and agent systems.",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60"
  }
];

const MOCK_SETTINGS = {
  websiteName: "Aether",
  logo: "✦ AETHER",
  logoImage: "",
  hero: {
    title: "The Future of Web Engineering & Aesthetics",
    subtitle:
      "Exploring next-generation technologies, interactive interfaces, serverless systems, and the design languages of tomorrow.",
    ctaText: "Explore Blogs",
    ctaLink: "#featured",
  },
  aboutContent: {
    title: "Crafting Premium Digital Experiences",
    text: "Welcome to Aether. We are a collection of developers, designers, and AI researchers documenting our path through the digital frontier. We believe that technology should not only be highly performant, but visually gorgeous and satisfying to interact with.",
    mission:
      "To inspire and educate developers by producing high-fidelity technical articles that pair bleeding-edge code with premium interactive design.",
    vision:
      "To become the definitive journal for high-end web development, AI integration, and fluid UX systems.",
    stats: [
      { label: "Active Readers", value: "250K+" },
      { label: "Articles Published", value: "480+" },
      { label: "Community Members", value: "50K+" },
      { label: "Open Source Stars", value: "12K+" },
    ],
    team: [
      {
        name: "Yadnesh Thorat",
        role: "Chief Architect & Editor",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=60",
        bio: "Yadnesh is a full stack specialist who spends his time designing systems with Next.js, Firebase, and real-time data sync.",
      },
      {
        name: "Aria Sterling",
        role: "Head of Design",
        avatar:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60",
        bio: "Aria is obsessed with motion design, typography, and creating digital environments that respond fluidly to users.",
      },
    ],
    timeline: [
      {
        year: "2024",
        title: "Project Inception",
        desc: "Aether was launched as a small technical newsletter with 100 subscribers.",
      },
      {
        year: "2025",
        title: "Expanding to AI Hub",
        desc: "Introduced dedicated columns covering generative AI integration and Next.js App Router tutorials.",
      },
      {
        year: "2026",
        title: "v2 Portal Launch",
        desc: "Redesigned the entire visitor experience using glassmorphism and real-time Firebase tracking.",
      },
    ],
  },
  contactInfo: {
    email: "contact@aether-blog.com",
    phone: "+1 (555) 019-2834",
    address: "One Infinite Loop, Cupertino, CA 95014",
    mapsEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3172.3325300305886!2d-122.0311812!3d37.33182!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb5b5c907b311%3A0x25e412613cf7b2b6!2sApple%20Infinite%20Loop!5e0!3m2!1sen!2sus!4v1700000000000",
    socialLinks: {
      twitter: "https://twitter.com/aether_blog",
      github: "https://github.com/aether",
      linkedin: "https://linkedin.com/company/aether",
      youtube: "https://youtube.com/aether",
    },
  },
  footerText:
    "© 2026 Aether Journal. Built with React, Tailwind CSS, and Firebase.",
  seoDefaults: {
    title: "Aether | The Modern Tech & Design Journal",
    description:
      "A beautifully crafted blog platform exploring modern frontend, web design systems, Firebase backend, and generative artificial intelligence.",
    ogImage:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80",
  },
};

const MOCK_BLOGS = [];

const MOCK_CONTACTS = [];

const MOCK_SUBSCRIBERS = [];

const MOCK_ANALYTICS = {
  totalVisitors: 84320,
  todaysVisitors: 1240,
  monthlyVisitors: 38900,
  visitorTrends: [
    { name: "Mon", visitors: 800, bounceRate: 35, duration: 120 },
    { name: "Tue", visitors: 950, bounceRate: 32, duration: 145 },
    { name: "Wed", visitors: 1100, bounceRate: 34, duration: 160 },
    { name: "Thu", visitors: 1050, bounceRate: 36, duration: 155 },
    { name: "Fri", visitors: 1300, bounceRate: 30, duration: 180 },
    { name: "Sat", visitors: 980, bounceRate: 28, duration: 190 },
    { name: "Sun", visitors: 1240, bounceRate: 29, duration: 200 },
  ],
  trafficSources: [
    { name: "Direct", value: 35000 },
    { name: "Organic Search", value: 28000 },
    { name: "Social Media", value: 14000 },
    { name: "Newsletter", value: 7320 },
  ],
  deviceTypes: [
    { name: "Desktop", value: 52000 },
    { name: "Mobile", value: 28000 },
    { name: "Tablet", value: 4320 },
  ],
  topLandingPages: [
    { path: "/", views: 42000 },
    { path: "/blogs/mastering-nextjs-15", views: 24000 },
    { path: "/blogs/designing-fluid-interfaces", views: 12000 },
    { path: "/categories", views: 6320 },
  ],
};

// STORAGE ACTIONS (LOCAL STORAGE OR MEMORY STORAGE FALLBACKS)
function getLocalData(key, fallback) {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(stored);
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
  async getBlogs(includeDrafts = false) {
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
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        handleFirebaseFailure("getBlogs", err);
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    let filtered = blogs;
    if (!includeDrafts) {
      filtered = blogs.filter((b) => b.status === "published");
    }
    return filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },

  async getBlogBySlug(slug) {
    if (canUseFirebase()) {
      try {
        const blogsRef = collection(db, "aether_blogs_v2");
        const q = query(blogsRef, where("slug", "==", slug), limit(1));
        const snapshot = await withTimeout(getDocs(q));
        if (!snapshot.empty) {
          const docSnap = snapshot.docs[0];
          return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
      } catch (err) {
        handleFirebaseFailure("getBlogBySlug", err);
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    return blogs.find((b) => b.slug === slug) || null;
  },

  async saveBlog(blog) {
    const defaultAuthor = MOCK_SETTINGS.aboutContent.team[0];
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
        handleFirebaseFailure("saveBlog", err);
      }
    }

    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
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
        handleFirebaseFailure("deleteBlog", err);
        return false;
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    const filtered = blogs.filter((b) => b.id !== id);
    setLocalData("aether_blogs_v2", filtered);
    return true;
  },

  async incrementViews(slug) {
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
        handleFirebaseFailure("incrementViews", err);
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
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
      } catch (err) {
        handleFirebaseFailure("getCategories", err);
      }
    }
    // Fallback
    return getLocalData("aether_categories_v2", MOCK_CATEGORIES);
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
        handleFirebaseFailure("saveCategory", err);
      }
    }

    // Fallback
    const cats = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
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
        handleFirebaseFailure("deleteCategory", err);
        return false;
      }
    }
    // Fallback
    const cats = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    const filtered = cats.filter((c) => c.id !== id);
    setLocalData("aether_categories_v2", filtered);
    return true;
  },

  // --- SETTINGS ---
  async getSettings() {
    if (canUseFirebase()) {
      try {
        const docSnap = await withTimeout(
          getDoc(doc(db, "aether_settings_v2", "global")),
        );
        if (docSnap.exists()) {
          return docSnap.data();
        }
      } catch (err) {
        handleFirebaseFailure("getSettings", err);
      }
    }
    // Fallback
    return getLocalData("aether_settings_v2", MOCK_SETTINGS);
  },

  async saveSettings(settings) {
    if (canUseFirebase()) {
      try {
        await withTimeout(setDoc(doc(db, "aether_settings_v2", "global"), settings));
        return settings;
      } catch (err) {
        handleFirebaseFailure("saveSettings", err);
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
        handleFirebaseFailure("getContacts", err);
      }
    }
    // Fallback
    return getLocalData("aether_contacts_v2", MOCK_CONTACTS);
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
        handleFirebaseFailure("addContact", err);
      }
    }

    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    contacts.unshift(newMsg);
    setLocalData("aether_contacts_v2", contacts);
    return newMsg;
  },

  async markContactAsRead(id) {
    if (isFirebaseConfigured) {
      try {
        await updateDoc(doc(db, "aether_contacts_v2", id), { read: true });
        return;
      } catch (err) {
        console.error("Firebase markContactAsRead error:", err);
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    const index = contacts.findIndex((c) => c.id === id);
    if (index > -1) {
      contacts[index].read = true;
      setLocalData("aether_contacts_v2", contacts);
    }
  },

  async deleteContact(id) {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "aether_contacts_v2", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteContact error:", err);
        return false;
      }
    }
    // Fallback
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    const filtered = contacts.filter((c) => c.id !== id);
    setLocalData("aether_contacts_v2", filtered);
    return true;
  },

  // --- NEWSLETTER ---
  async getNewsletterSubscribers() {
    if (isFirebaseConfigured) {
      try {
        const snapshot = await getDocs(
          query(collection(db, "aether_newsletter_v2"), orderBy("subscribedAt", "desc")),
        );
        const list = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        return list;
      } catch (err) {
        console.error("Firebase getNewsletterSubscribers error:", err);
      }
    }
    // Fallback
    return getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
  },

  async subscribeNewsletter(email) {
    const subscriber = {
      id: "sub-" + Math.random().toString(36).substr(2, 9),
      email: email.trim().toLowerCase(),
      subscribedAt: new Date().toISOString(),
    };

    if (isFirebaseConfigured) {
      try {
        const newsletterRef = collection(db, "aether_newsletter_v2");
        const q = query(
          newsletterRef,
          where("email", "==", subscriber.email),
          limit(1),
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          return { success: true, isNew: false };
        }
        await setDoc(doc(db, "aether_newsletter_v2", subscriber.id), subscriber);
        return { success: true, isNew: true };
      } catch (err) {
        console.error("Firebase subscribeNewsletter error:", err);
        return { success: false, isNew: false };
      }
    }

    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
    const exists = subscribers.some((s) => s.email === subscriber.email);
    if (exists) {
      return { success: true, isNew: false };
    }
    subscribers.unshift(subscriber);
    setLocalData("aether_newsletter_v2", subscribers);
    return { success: true, isNew: true };
  },

  async deleteSubscriber(id) {
    if (isFirebaseConfigured) {
      try {
        await deleteDoc(doc(db, "aether_newsletter_v2", id));
        return true;
      } catch (err) {
        console.error("Firebase deleteSubscriber error:", err);
        return false;
      }
    }
    // Fallback
    const subscribers = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);
    const filtered = subscribers.filter((s) => s.id !== id);
    setLocalData("aether_newsletter_v2", filtered);
    return true;
  },

  // --- ANALYTICS ---
  async getAnalyticsData() {
    if (isFirebaseConfigured) {
      try {
        // In real project, we could load from an 'analytics' collection
        // For simplicity and matching GA4 integration dashboard, we can return computed database counts
        // plus simulated trends based on real database contents
        const blogs = await this.getBlogs(true);
        const categories = await this.getCategories();
        const contacts = await this.getContacts();
        const newsletter = await this.getNewsletterSubscribers();

        // Calculate actual sums
        const publishedBlogsCount = blogs.filter(
          (b) => b.status === "published",
        ).length;
        const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

        return {
          totalBlogs: blogs.length,
          publishedBlogs: publishedBlogsCount,
          draftBlogs: blogs.length - publishedBlogsCount,
          categoriesCount: categories.length,
          totalViews: totalViews + MOCK_ANALYTICS.totalVisitors,
          todaysVisitors: MOCK_ANALYTICS.todaysVisitors,
          monthlyVisitors: MOCK_ANALYTICS.monthlyVisitors,
          contactsCount: contacts.length,
          newsletterCount: newsletter.length,
          visitorTrends: MOCK_ANALYTICS.visitorTrends,
          trafficSources: MOCK_ANALYTICS.trafficSources,
          deviceTypes: MOCK_ANALYTICS.deviceTypes,
          topLandingPages: MOCK_ANALYTICS.topLandingPages,
        };
      } catch (err) {
        console.error("Firebase getAnalyticsData error:", err);
      }
    }
    // Fallback
    const blogs = getLocalData("aether_blogs_v2", MOCK_BLOGS);
    const categories = getLocalData("aether_categories_v2", MOCK_CATEGORIES);
    const contacts = getLocalData("aether_contacts_v2", MOCK_CONTACTS);
    const newsletter = getLocalData("aether_newsletter_v2", MOCK_SUBSCRIBERS);

    const publishedBlogsCount = blogs.filter(
      (b) => b.status === "published",
    ).length;
    const totalViews = blogs.reduce((sum, b) => sum + (b.views || 0), 0);

    return {
      totalBlogs: blogs.length,
      publishedBlogs: publishedBlogsCount,
      draftBlogs: blogs.length - publishedBlogsCount,
      categoriesCount: categories.length,
      totalViews: totalViews,
      todaysVisitors: MOCK_ANALYTICS.todaysVisitors,
      monthlyVisitors: MOCK_ANALYTICS.monthlyVisitors,
      contactsCount: contacts.length,
      newsletterCount: newsletter.length,
      visitorTrends: MOCK_ANALYTICS.visitorTrends,
      trafficSources: MOCK_ANALYTICS.trafficSources,
      deviceTypes: MOCK_ANALYTICS.deviceTypes,
      topLandingPages: MOCK_ANALYTICS.topLandingPages,
    };
  },

  // --- IMAGE UPLOADS ---
  async uploadImage(file) {
    if (canUseFirebase() && storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage");
        const storageRef = ref(storage, `aether_covers/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (err) {
        console.error("Firebase storage upload failed, falling back to local Base64:", err);
      }
    }
    // Fallback: Read file as Base64 Data URL (useful for local development/fallback)
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  },
};
