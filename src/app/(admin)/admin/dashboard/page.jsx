"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Layers,
  Mail,
  Users,
  Eye,
  Activity,
  TrendingUp,
  MousePointerClick,
  ArrowRight,
  Plus,
  ChevronRight,
  Image as ImageIcon,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import { dbService } from "@/lib/db";
import { Link } from "react-router-dom";



export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [activeUsers, setActiveUsers] = useState(12); // Simulated realtime count

  useEffect(() => {
    setMounted(true);
    async function loadStats() {
      const data = await dbService.getAnalyticsData();
      setStats(data);
    }
    loadStats();

    // Simulate active users fluctuation
    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const next = prev + delta;
        return next > 2 ? next : 3;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Color constants for charts
  const COLORS = ["#000000", "#4f46e5", "#06b6d4", "#10b981", "#f59e0b"];
  const DARK_COLORS = ["#ffffff", "#818cf8", "#22d3ee", "#34d399", "#fbbf24"];

  const currentColors = COLORS; // Recharts automatically inherits styling mostly

  const statCards = [
    {
      name: "Total Publications",
      value: stats.totalBlogs,
      description: `${stats.publishedBlogs} Published, ${stats.draftBlogs} Drafts`,
      icon: FileText,
      href: "/admin/blogs",
    },
    {
      name: "Categories Active",
      value: stats.categoriesCount,
      description: "Columns organized",
      icon: Layers,
      href: "/admin/categories",
    },
    {
      name: "Contact Messages",
      value: stats.contactsCount,
      description: "Inbox messages",
      icon: Mail,
      href: "/admin/contacts",
    },
    {
      name: "Newsletter Members",
      value: stats.newsletterCount,
      description: "Active subscribers",
      icon: Users,
      href: "/admin/newsletter",
    },
    {
      name: "Total Page Views",
      value: stats.totalViews,
      description: "Visitor counts",
      icon: Eye,
      href: "#",
    },
    {
      name: "Today's Visitors",
      value: stats.todaysVisitors,
      description: "Unique IPs today",
      icon: MousePointerClick,
      href: "#",
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/30 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
            Executive Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Real-time analytics, user engagement channels, and article content
            performance metrics.
          </p>
        </div>

        {/* Real-time status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-xs font-bold shadow-sm backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {activeUsers} Active Readers Online
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.href}
              className="group p-6 rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm hover-lift flex flex-col justify-between hover:border-primary/20 hover:shadow-[0_8px_30px_rgba(99,102,241,0.06)] dark:hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    {card.name}
                  </p>
                  <p className="text-3xl font-extrabold font-geist-sans tracking-tight text-foreground">
                    {card.value}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-[0_4px_12px_rgba(99,102,241,0.25)] transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 flex items-center justify-between font-semibold">
                <span>{card.description}</span>
                {card.href !== "#" && (
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 text-primary dark:text-white">
                    Manage <ArrowRight className="h-3 w-3" />
                  </span>
                )}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions Panel */}
      <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-border/20">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="h-4.5 w-4.5" /> Quick Actions
          </h3>
        </div>

        <div className="flex flex-wrap gap-3.5 pt-2 pb-1">
          <Link
            to="/admin/blogs"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <FileText className="h-4.5 w-4.5 text-primary shrink-0" /> Manage Blogs
          </Link>
          <Link
            to="/admin/blogs?action=create"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5 text-primary shrink-0" /> Compose Blog
          </Link>
          <Link
            to="/admin/categories"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Layers className="h-4.5 w-4.5 text-primary shrink-0" /> Categories
          </Link>
          <Link
            to="/admin/contacts"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Mail className="h-4.5 w-4.5 text-primary shrink-0" /> Inbox Messages
          </Link>
          <Link
            to="/admin/newsletter"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <Users className="h-4.5 w-4.5 text-primary shrink-0" /> Newsletter
          </Link>
          <Link
            to="/admin/media"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <ImageIcon className="h-4.5 w-4.5 text-primary shrink-0" /> Media Library
          </Link>
          <Link
            to="/admin/settings"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <SettingsIcon className="h-4.5 w-4.5 text-primary shrink-0" /> Site Settings
          </Link>
          <Link
            to="/admin/admins"
            className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border border-border bg-card hover:bg-muted/80 hover:text-primary hover:border-primary/20 text-xs sm:text-sm font-bold transition-all duration-200 hover:scale-[1.02] hover:-translate-y-0.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" /> Manage Admins
          </Link>
        </div>
      </div>
    </div>
  );
}
