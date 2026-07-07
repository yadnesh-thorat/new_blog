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

        {/* Hero Banner */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Ambient orbs */}
          <div className="absolute top-[-80px] left-[5%] w-[450px] h-[450px] bg-primary/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slow" />
          <div className="absolute bottom-[-60px] right-[5%] w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slower" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] bg-gradient-to-tr from-violet-500/5 to-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-7 animate-entrance">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <Sparkles className="h-3 w-3 animate-pulse" />
              Who We Are
            </span>
            <h1 className="text-5xl font-black font-geist-sans tracking-tight sm:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              <span className="text-gradient">{aboutContent.title.split(" ").slice(0, 2).join(" ")}</span>
              {aboutContent.title.split(" ").length > 2 && (
                <span className="block text-foreground">{aboutContent.title.split(" ").slice(2).join(" ")}</span>
              )}
            </h1>
            <p className="text-lg sm:text-xl leading-relaxed text-muted-foreground max-w-2xl mx-auto font-medium">
              {aboutContent.text}
            </p>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {aboutContent.stats.map((stat, idx) => {
              const Icon = statIcons[idx % statIcons.length];
              return (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl border border-border/40 bg-card p-6 text-center hover-lift hover-glow gradient-border group cursor-default animate-entrance"
                  style={{ animationDelay: `${idx * 0.07}s` }}
                >
                  <div className="absolute top-3 right-3 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/12 transition-all duration-500" />
                  <p className="text-3xl font-black tracking-tight text-foreground font-geist-sans relative z-10">{stat.value}</p>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mt-1 relative z-10">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mission */}
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/6 via-primary/3 to-transparent p-8 space-y-5 hover-glow gradient-border group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-500" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-[0_4px_20px_rgba(99,102,241,0.35)] group-hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] transition-shadow duration-300">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold font-geist-sans text-foreground relative z-10">Our Mission</h3>
              <p className="text-base leading-relaxed text-muted-foreground relative z-10">{aboutContent.mission}</p>
            </div>
            {/* Vision */}
            <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/6 via-indigo-500/3 to-transparent p-8 space-y-5 hover-glow group transition-all duration-300 hover:shadow-[0_8px_30px_rgba(99,102,241,0.1)]">
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-500" />
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.35)] group-hover:shadow-[0_6px_24px_rgba(99,102,241,0.5)] transition-shadow duration-300">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-bold font-geist-sans text-foreground relative z-10">Our Vision</h3>
              <p className="text-base leading-relaxed text-muted-foreground relative z-10">{aboutContent.vision}</p>
            </div>
          </div>
        </section>

        {/* Team Members */}
        <section className="bg-muted/20 border-y border-border/40 py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-14">
            <div className="text-center space-y-3 animate-entrance">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                <Users className="h-3 w-3" />
                The Team
              </span>
              <h2 className="text-3xl font-black font-geist-sans tracking-tight text-foreground">Meet the Architects</h2>
              <p className="text-base text-muted-foreground max-w-xl mx-auto">
                The writers and engineering leads behind every Aether journal edition.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {aboutContent.team.map((member, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row items-center gap-5 p-6 rounded-3xl border border-border/30 bg-card hover-lift hover-glow gradient-border transition-all text-center sm:text-left group animate-entrance"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/30 to-indigo-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="h-20 w-20 rounded-2xl object-cover border-2 border-border/50 relative z-10 group-hover:scale-105 transition-transform duration-500 group-hover:border-primary/40"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-base font-bold font-geist-sans text-foreground">{member.name}</h4>
                    <p className="text-xs font-bold text-primary uppercase tracking-widest">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-24 space-y-14">
          <div className="text-center space-y-3 animate-entrance">
            <h2 className="text-3xl font-black font-geist-sans tracking-tight text-foreground">Our Timeline</h2>
            <p className="text-base text-muted-foreground">Key milestones on our publishing roadmap.</p>
          </div>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-primary/60 via-primary/20 to-transparent" />
            <div className="space-y-5">
              {aboutContent.timeline.map((item, idx) => (
                <div
                  key={idx}
                  className="relative pl-16 group animate-entrance"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  <div className="absolute left-[18px] top-4 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background group-hover:bg-primary group-hover:scale-125 transition-all duration-300 shadow-[0_0_0_3px_hsl(var(--background))]">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary group-hover:bg-white transition-colors" />
                  </div>
                  <div className="rounded-2xl border border-border/30 bg-card/60 p-5 hover:bg-card hover:border-primary/25 hover:shadow-md transition-all duration-300 backdrop-blur-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                      <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full w-fit border border-primary/20">{item.year}</span>
                      <h4 className="text-sm font-bold text-foreground font-geist-sans">{item.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <VisitorFooter />
    </>
  );
}
