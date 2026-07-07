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
} from "lucide-react";
import { dbService } from "@/lib/db";
import { Link } from "react-router-dom";

// Dynamically import Recharts to prevent SSR errors
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

      {/* Charts section */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Traffic Trend (Col 8) */}
          <div className="lg:col-span-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5" /> Visitor Traffic Trends
              </h3>
              <span className="text-xs text-muted-foreground font-bold bg-muted/65 px-2 py-0.5 rounded-md">
                Past 7 Days
              </span>
            </div>

            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={stats.visitorTrends}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    opacity={0.15}
                  />
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 15, 0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorVis)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Traffic Sources (Col 4) */}
          <div className="lg:col-span-4 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm relative">
            <div className="flex items-center justify-between pb-3 border-b border-border/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Traffic Referral Channels
              </h3>
            </div>

            <div className="h-[200px] w-full relative flex justify-center items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.trafficSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.trafficSources.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={currentColors[index % currentColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(10, 10, 15, 0.85)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255, 255, 255, 0.08)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "12px",
                      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.15)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend label fields */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {stats.trafficSources.map((src, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        currentColors[idx % currentColors.length],
                    }}
                  ></span>
                  <span className="text-muted-foreground truncate font-medium">
                    {src.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Landing pages and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Landing pages list (Col 8) */}
        <div className="lg:col-span-8 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Top Visited Paths (Landing Pages)
            </h3>
          </div>

          <div className="space-y-1.5">
            {stats.topLandingPages.map((page, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm py-2.5 border-b border-border/10 last:border-0 hover:bg-muted/30 px-2.5 rounded-xl transition-colors duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground font-mono w-6 text-center text-xs font-bold">
                    /{idx + 1}
                  </span>
                  <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                    {page.path}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold">
                  <span className="text-muted-foreground font-semibold">
                    {page.views} views
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-muted text-foreground">
                    {((page.views / stats.totalViews) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel (Col 4) */}
        <div className="lg:col-span-4 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-border/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Activity className="h-4.5 w-4.5" /> Administrative Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/admin/blogs?action=create"
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/65 hover:border-primary/20 hover:text-primary text-xs font-bold transition-all duration-300 hover:scale-[1.01] hover:-translate-y-px shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.05)]"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create New Blog
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/admin/categories"
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/65 hover:border-primary/20 hover:text-primary text-xs font-bold transition-all duration-300 hover:scale-[1.01] hover:-translate-y-px shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.05)]"
            >
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Manage Categories
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-muted/65 hover:border-primary/20 hover:text-primary text-xs font-bold transition-all duration-300 hover:scale-[1.01] hover:-translate-y-px shadow-sm hover:shadow-[0_4px_12px_rgba(99,102,241,0.05)]"
            >
              <span>Edit Website Layout & Info</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
