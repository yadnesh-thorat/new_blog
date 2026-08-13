"use client";

import React, { useState, useEffect } from "react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { dbService } from "@/lib/db";
import { Star, Shield, Sparkles, Users, BookOpen, TrendingUp, ArrowRight } from "lucide-react";

export default function AboutPage() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      const data = await dbService.getSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  if (!settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="mt-5 text-sm font-medium text-muted-foreground">Loading About page...</p>
      </div>
    );
  }

  const { aboutContent } = settings;
  const statIcons = [Sparkles, BookOpen, Users, TrendingUp];

  return (
    <>
      <VisitorNavbar />

      <main className="flex-grow transition-colors duration-300">

        {/* Header section matching homepage */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-28 pb-8 animate-entrance">
          <div className="border-b border-border/40 pb-5 mb-8">
            <h3 className="font-geist-sans text-2xl font-bold">{aboutContent.title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              {aboutContent.text}
            </p>
          </div>
        </section>







        {/* 3 Stats Section */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(aboutContent?.stats && aboutContent.stats.length >= 3
              ? aboutContent.stats.slice(0, 3)
              : [
                  { value: "250K+", label: "Active Readers", icon: Sparkles },
                  { value: "480+", label: "Articles Published", icon: BookOpen },
                  { value: "50K+", label: "Community Members", icon: Users },
                ]
            ).map((stat, idx) => {
              const icons = [Sparkles, BookOpen, Users];
              const Icon = stat.icon || icons[idx % icons.length];
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-3xl border border-border/40 bg-card p-8 text-center shadow-xs hover:border-primary/30 transition-all group"
                >
                  <div className="absolute top-4 right-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors">
                    <Icon className="h-7 w-7" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground font-outfit">
                    {stat.value}
                  </p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mt-2">
                    {stat.label}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <VisitorFooter />
    </>
  );
}
