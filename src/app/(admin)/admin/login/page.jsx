"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate("/admin/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError("");

    try {
      await login(email, password);
      navigate("/admin/dashboard");
    } catch (err) {
      const errMsg = err?.message || "";
      if (
        errMsg.includes("invalid-credential") ||
        errMsg.includes("wrong-password") ||
        errMsg.includes("user-not-found") ||
        errMsg.includes("Invalid admin credentials")
      ) {
        setError("The admin email or password you entered is incorrect. Please re-enter your credentials.");
      } else {
        setError(errMsg || "Invalid login credentials. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground font-semibold">
          Validating session...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden transition-colors duration-300">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse duration-[12000ms]" />

      <Link
        to="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all hover:-translate-x-0.5 duration-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Visitor Website
      </Link>

      <div className="w-full max-w-md mx-auto p-8 rounded-3xl border border-border/40 bg-card/75 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] space-y-6 animate-entrance">
        <div className="text-center space-y-2.5">
          <span className="font-geist-sans text-xl font-bold tracking-tight text-foreground flex items-center justify-center gap-1.5 select-none">
            <span className="text-primary font-black animate-spin-slow">✦</span> AETHER CONSOLE
          </span>
          <p className="text-xs text-muted-foreground font-medium">
            Enter administrative credentials to access console.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/25 text-red-700 dark:text-red-400 animate-entrance text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="admin-email-input"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                id="admin-email-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@aether-blog.com"
                className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="admin-password-input"
              className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
              <input
                id="admin-password-input"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-10 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-shimmer w-full flex items-center justify-center rounded-xl bg-primary py-3 text-sm font-bold text-white hover:opacity-95 shadow-[0_4px_16px_rgba(99,102,241,0.2)] dark:shadow-[0_4px_20px_rgba(99,102,241,0.35)] transition-all duration-300 active:scale-95 disabled:opacity-50 font-geist-sans cursor-pointer"
          >
            {submitting ? "Securing channel..." : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}
