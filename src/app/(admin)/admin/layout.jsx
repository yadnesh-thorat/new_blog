"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/components/ThemeContext";
import {
  LayoutDashboard,
  FileText,
  Layers,
  Mail,
  Users,
  Image as ImageIcon,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  ShieldCheck,
} from "lucide-react";
import { dbService } from "@/lib/db";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);
  const [settings, setSettings] = useState(null);

  // Load Settings
  useEffect(() => {
    dbService.getSettings().then(setSettings).catch(console.error);
  }, [pathname]);

  // Protection Redirect
  useEffect(() => {
    if (!loading && !user && pathname !== "/admin/login") {
      navigate("/admin/login");
    }
  }, [user, loading, pathname, navigate]);

  // Fetch unread count for sidebar badge
  useEffect(() => {
    if (user) {
      dbService
        .getContacts()
        .then((messages) => {
          const unread = messages.filter((m) => !m.read).length;
          setUnreadContacts(unread);
        })
        .catch(console.error);
    }
  }, [user, pathname]);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Blogs", href: "/admin/blogs", icon: FileText },
    { name: "Categories", href: "/admin/categories", icon: Layers },
    {
      name: "Messages",
      href: "/admin/contacts",
      icon: Mail,
      badge: unreadContacts > 0 ? unreadContacts : undefined,
    },
    { name: "Newsletter", href: "/admin/newsletter", icon: Users },
    { name: "Media Library", href: "/admin/media", icon: ImageIcon },
    { name: "Settings", href: "/admin/settings", icon: SettingsIcon },
    { name: "Admins", href: "/admin/admins", icon: ShieldCheck },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-xs text-muted-foreground font-semibold">
          Verifying secure path...
        </p>
      </div>
    );
  }

  // If on login page, render children directly without dashboard structure
  if (pathname === "/admin/login") {
    return <Outlet />;
  }

  // If redirecting (not loaded or not logged in), render minimal loading shell
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground font-semibold">
          Redirecting to login portal...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground transition-colors duration-300">
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border/30 bg-card/60 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 cursor-pointer"
            aria-label="Open Sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-geist-sans text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
            {settings?.logoImage ? (
              <img
                src={settings.logoImage}
                alt={settings.websiteName || "Aether"}
                className="h-6 w-auto object-contain max-h-6"
              />
            ) : (
              <>
                <span className="text-primary font-black">✦</span>
                <span>{(settings?.logo || "AETHER") + " ADMIN"}</span>
              </>
            )}
          </span>
        </div>
        
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 cursor-pointer"
          aria-label="Toggle Theme"
        >
          {theme === "light" ? (
            <Moon className="h-4.5 w-4.5" />
          ) : (
            <Sun className="h-4.5 w-4.5" />
          )}
        </button>
      </header>

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 border-r border-border/40 bg-card p-5 justify-between shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6 relative">
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <span className="font-geist-sans text-base font-bold tracking-tight text-foreground flex items-center gap-1.5 w-full">
              {settings?.logoImage ? (
                <img
                  src={settings.logoImage}
                  alt={settings.websiteName || "Aether"}
                  className="h-8 w-auto object-contain max-h-8"
                />
              ) : (
                <>
                  <span className="text-primary font-black">✦</span>
                  <span>{(settings?.logo || "AETHER") + " ADMIN"}</span>
                </>
              )}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>

          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(99,102,241,0.25)] scale-[1.01]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:translate-x-0.5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${
                        isActive
                          ? "bg-white text-primary"
                          : "bg-primary text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="space-y-3 pt-6 border-t border-border/30 relative">
          <div className="flex items-center justify-between gap-1.5">
            <Link
              to="/admin/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-all group min-w-0"
              title="View Profile Settings"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {(user.displayName || user.email || "A").substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.displayName || "Admin User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-semibold">
                  {user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 shrink-0 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-all hover:translate-x-0.5"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Visitor Portal</span>
          </Link>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              handleLogout();
            }}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Permanent Full Sidebar (Left - Col Width) - Hidden on Mobile/Tablet */}
      <aside className="sticky top-0 h-screen flex-col w-56 sm:w-64 border-r border-border/40 bg-card/60 backdrop-blur-md p-4 sm:p-5 shrink-0 justify-between shadow-sm overflow-y-auto overflow-x-hidden transition-all duration-300 hidden lg:flex">
        {/* Subtle decorative glow dot in background of sidebar */}
        <div className="absolute -top-10 -left-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-6 relative z-10">
          {/* Sidebar Top Logo */}
          <div className="flex items-center justify-between border-b border-border/30 pb-4">
            <span className="font-geist-sans text-base lg:text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5 group w-full">
              {settings?.logoImage ? (
                <img
                  src={settings.logoImage}
                  alt={settings.websiteName || "Aether"}
                  className="h-8 w-auto object-contain max-h-8"
                />
              ) : (
                <>
                  <span className="text-primary font-black transition-transform group-hover:rotate-12 duration-300 text-lg sm:text-xl">✦</span>
                  <span>{(settings?.logo || "AETHER") + " ADMIN"}</span>
                </>
              )}
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-all duration-300 relative group ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-[0_4px_16px_rgba(99,102,241,0.25)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.4)] scale-[1.01]"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/70 hover:translate-x-0.5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shadow-sm ${
                        isActive
                          ? "bg-white text-primary"
                          : "bg-primary text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Bottom Controls */}
        <div className="space-y-3 pt-6 border-t border-border/30 relative z-10">
          <div className="flex items-center justify-between gap-1.5">
            <Link
              to="/admin/profile"
              className="flex-1 flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-muted/40 transition-all group min-w-0"
              title="View Profile Settings"
            >
              <div className="h-8 w-8 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.displayName} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">
                    {(user.displayName || user.email || "A").substring(0, 2)}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                  {user.displayName || "Admin User"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-semibold">
                  {user.email}
                </p>
              </div>
            </Link>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all active:scale-95 shrink-0 cursor-pointer"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4.5 w-4.5" />
              ) : (
                <Sun className="h-4.5 w-4.5" />
              )}
            </button>
          </div>

          <Link
            to="/"
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 rounded-xl transition-all hover:translate-x-0.5"
          >
            <Home className="h-4.5 w-4.5" />
            <span>Visitor Portal</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-all hover:translate-x-0.5 cursor-pointer text-left"
          >
            <LogOut className="h-4.5 w-4.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Core Administrative Page Views wrapper */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
