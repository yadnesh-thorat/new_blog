import { useEffect } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { dbService } from "./db";

// Support both Vite import.meta.env and process.env fallback
const getEnv = (key) => {
  if (typeof window !== "undefined" && import.meta.env) {
    return import.meta.env[key];
  }
  return typeof process !== "undefined" && process.env ? process.env[key] : undefined;
};

// GA4 Measurement ID from environment
const GA_TRACKING_ID = getEnv("NEXT_PUBLIC_GA_MEASUREMENT_ID");

// Helper to log standard events to Google Analytics
export const pageview = (url) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("config", GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

export const event = ({ action, category, label, value }) => {
  if (typeof window !== "undefined" && window.gtag && GA_TRACKING_ID) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Also log to our local db analytics system for administrative overview
  trackDBEvent(action, { category, label, value }).catch(console.error);
};

// Log to internal DB for dashboard stats
async function trackDBEvent(eventName, params) {
  if (typeof window === "undefined") return;
  try {
    const analyticsLogs = JSON.parse(
      localStorage.getItem("aether_analytics_logs") || "[]",
    );
    analyticsLogs.push({
      event: eventName,
      params,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer || "direct",
    });
    // Keep max 500 logs locally
    if (analyticsLogs.length > 500) {
      analyticsLogs.shift();
    }
    localStorage.setItem(
      "aether_analytics_logs",
      JSON.stringify(analyticsLogs),
    );
  } catch (e) {
    console.error("Internal analytics logging failed:", e);
  }
}

// React Component to initialize GA script and track path changes
export function AnalyticsProvider() {
  const location = useLocation();
  const pathname = location.pathname;
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (!GA_TRACKING_ID) return;

    // Inject GA4 script tag
    const script1 = document.createElement("script");
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    script1.async = true;
    document.head.appendChild(script1);

    const script2 = document.createElement("script");
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_path: window.location.pathname,
      });
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, []);

  useEffect(() => {
    if (pathname) {
      const url =
        pathname +
        (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      pageview(url);
      // Increment blog view counter if viewing a blog post
      if (pathname.startsWith("/blogs/")) {
        const slug = pathname.replace("/blogs/", "");
        if (slug) {
          dbService.incrementViews(slug).catch(console.error);
          event({
            action: "blog_view",
            category: "engagement",
            label: slug,
          });
        }
      } else {
        event({
          action: "page_view",
          category: "navigation",
          label: pathname,
        });
      }
    }
  }, [pathname, searchParams]);

  // Track scroll depth
  useEffect(() => {
    let maxScroll = 0;
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight <= 0) return;
      const currentScroll = (window.scrollY / totalHeight) * 100;
      if (currentScroll > maxScroll) {
        maxScroll = currentScroll;
        // Track at 25%, 50%, 75%, 100%
        if (maxScroll >= 99 && maxScroll < 100) {
          maxScroll = 100; // Trigger once at end
          event({
            action: "scroll_depth",
            category: "engagement",
            label: "100%",
            value: 100,
          });
        } else if (maxScroll >= 75 && maxScroll < 76) {
          event({
            action: "scroll_depth",
            category: "engagement",
            label: "75%",
            value: 75,
          });
        } else if (maxScroll >= 50 && maxScroll < 51) {
          event({
            action: "scroll_depth",
            category: "engagement",
            label: "50%",
            value: 50,
          });
        } else if (maxScroll >= 25 && maxScroll < 26) {
          event({
            action: "scroll_depth",
            category: "engagement",
            label: "25%",
            value: 25,
          });
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  return null;
}
