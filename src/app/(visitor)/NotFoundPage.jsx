"use client";

import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";

export default function NotFoundPage() {
  return (
    <>
      <VisitorNavbar />

      <main className="flex-grow flex flex-col items-center justify-center text-center py-24 px-4 relative overflow-hidden transition-colors duration-300">
        {/* Ambient decorative glowing orbs */}
        <div className="absolute top-[10%] left-[10%] w-[300px] h-[300px] bg-primary/8 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-[250px] h-[250px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slower" />

        <div className="max-w-md mx-auto space-y-6 animate-entrance">
          {/* Sparkles icon container */}
          <div className="h-20 w-20 rounded-2xl bg-muted/60 border border-border/40 flex items-center justify-center mx-auto shadow-sm backdrop-blur-sm">
            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-7xl font-black font-geist-sans tracking-tight text-gradient">
              404
            </h1>
            <h2 className="text-xl font-bold font-geist-sans text-foreground">
              Page Not Found
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto font-medium">
              The page you are looking for might have been removed, renamed, or is temporarily unavailable.
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/"
              className="btn-shimmer inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-92 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_4px_16px_rgba(99,102,241,0.28)]"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Homepage
            </Link>
          </div>
        </div>
      </main>

      <VisitorFooter />
    </>
  );
}
