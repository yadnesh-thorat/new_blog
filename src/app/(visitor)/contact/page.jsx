"use client";

import React, { useState, useEffect } from "react";
import { VisitorNavbar } from "@/components/VisitorNavbar";
import { VisitorFooter } from "@/components/VisitorFooter";
import { dbService } from "@/lib/db";
import { event } from "@/lib/analytics";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const data = await dbService.getSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    setSuccess(false);
    try {
      await dbService.addContact({ name, email, subject, message });
      setSuccess(true);
      setName(""); setEmail(""); setSubject(""); setMessage("");
      event({ action: "contact_submission", category: "conversion", label: `${name} - ${subject}` });
      confetti({ particleCount: 50, spread: 40, origin: { y: 0.7 } });
    } catch (err) {
      setError(err?.message || "Failed to submit message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!settings) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
        </div>
        <p className="mt-5 text-sm font-medium text-muted-foreground">Loading Contact page...</p>
      </div>
    );
  }

  const { contactInfo } = settings;
  const channels = [
    { icon: Mail, label: "Email Address", value: contactInfo.email, href: `mailto:${contactInfo.email}`, color: "from-blue-500/20 to-blue-500/5", iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white" },
  ];

  return (
    <>
      <VisitorNavbar />

      <main className="flex-grow transition-colors duration-300">

        {/* Header section matching homepage */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-28 pb-8 animate-entrance">
          <div className="border-b border-border/40 pb-5 mb-8">
            <h3 className="font-geist-sans text-2xl font-bold">Contact</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
              Have questions, editorial pitches, or sponsorship proposals? Fill out the form or reach us via email.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left: Contact Info */}
            <div className="lg:col-span-4 space-y-5 animate-entrance" style={{ animationDelay: "0.1s" }}>
              {/* Info Cards */}
              <div className="rounded-3xl border border-border/40 bg-card p-6 space-y-5 shadow-sm">
                <h3 className="text-lg font-bold font-geist-sans text-foreground">Our Channels</h3>
                <div className="space-y-4">
                  {channels.map(({ icon: Icon, label, value, href, iconBg }) => (
                    <div key={label} className="flex items-start gap-4 group cursor-default">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${iconBg}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-0.5">{label}</p>
                        {href ? (
                          <a href={href} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">{value}</a>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">{value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Social Media Channels Card */}
              <div className="rounded-3xl border border-border/40 bg-card p-6 space-y-4 shadow-sm">
                <h3 className="text-lg font-bold font-geist-sans text-foreground">Follow Us</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Stay updated with our latest articles, insights, and tech announcements across our social channels.
                </p>
                <div className="flex items-center gap-3 flex-wrap pt-1">
                  {settings?.contactInfo?.socialLinks?.twitter && (
                    <a
                      href={settings.contactInfo.socialLinks.twitter}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="Twitter / X"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                  )}
                  {settings?.contactInfo?.socialLinks?.github && (
                    <a
                      href={settings.contactInfo.socialLinks.github}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="GitHub"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg>
                    </a>
                  )}
                  {settings?.contactInfo?.socialLinks?.linkedin && (
                    <a
                      href={settings.contactInfo.socialLinks.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="LinkedIn"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {settings?.contactInfo?.socialLinks?.instagram && (
                    <a
                      href={settings.contactInfo.socialLinks.instagram}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="Instagram"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.243 2 2 4.243 2 7v10c0 2.757 2.243 5 5 5h10c2.757 0 5-2.243 5-5V7c0-2.757-2.243-5-5-5H7zm0 2h10c1.654 0 3 1.346 3 3v10c0 1.654-1.346 3-3 3H7c-1.654 0-3-1.346-3-3V7c0-1.654 1.346-3 3-3zm5 3a5 5 0 100 10 5 5 0 000-10zm0 2a3 3 0 110 6 3 3 0 010-6zm4.5-.75a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z"/></svg>
                    </a>
                  )}
                  {settings?.contactInfo?.socialLinks?.facebook && (
                    <a
                      href={settings.contactInfo.socialLinks.facebook}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="Facebook"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.5 9.9v-7H8.9v-2.9h1.6V9.4c0-1.6 1-2.5 2.4-2.5.7 0 1.4.1 1.4.1v1.6h-.8c-.8 0-1 0-1 1v1.2h1.8l-.3 2.9h-1.5v7A10 10 0 0022 12z"/></svg>
                    </a>
                  )}
                  {settings?.contactInfo?.socialLinks?.whatsapp && (
                    <a
                      href={settings.contactInfo.socialLinks.whatsapp}
                      target="_blank"
                      rel="noreferrer"
                      className="w-11 h-11 flex items-center justify-center border-2 border-border hover:border-primary bg-background rounded-full text-foreground hover:text-primary transition-all hover:scale-110 shadow-2xs group"
                      aria-label="WhatsApp"
                    >
                      <svg className="h-5 w-5 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11 11 0 0012 1C6 1 1.5 5.5 1.5 11c0 1.8.5 3.5 1.5 5L1 23l7-2c1.4.5 2.8.7 4 .7a11 11 0 009.5-8.2c.3-1.3.5-2.6.5-3.8 0-1.1-.1-2.1-.5-3zM12 21c-1 0-2-.2-3-.6l-.2-.1-4.2 1.2 1.2-3.8-.1-.2A8.9 8.9 0 013 11C3 6 7 2 12 2s9 4 9 9-4 10-9 10zm4.2-6.8c-.2-.1-1.3-.6-1.5-.7-.2-.1-.4-.1-.6.1-.2.2-.8.7-1 1-.2.2-.4.2-.7.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.3-1.4-1.6-.1-.2 0-.3.1-.4.1-.1.2-.4.3-.6.1-.2.1-.4 0-.6-.1-.2-1-2.5-1.4-3.4-.4-.9-.8-.8-1.1-.8-.2 0-.4 0-.6 0-.2 0-.6.1-.9.4-.3.3-1 1-1 2.5s1 2.9 1.2 3.1c.2.2 2 3.3 4.9 4.6 2.9 1.3 3.1.9 3.6.8.5-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1 .1-.1.1-.3 0-.4z"/></svg>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="lg:col-span-8 rounded-3xl border border-border/40 bg-card p-6 sm:p-8 space-y-6 shadow-sm animate-entrance" style={{ animationDelay: "0.15s" }}>
              <div className="space-y-1">
                <h3 className="text-xl font-bold font-geist-sans text-foreground">Send a Message</h3>
                <p className="text-sm text-muted-foreground">We typically respond within 48 business hours.</p>
              </div>

              {success && (
                <div className="flex items-start gap-3 rounded-2xl bg-green-500/10 p-4 border border-green-500/25 text-green-700 dark:text-green-400 animate-entrance">
                  <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold">Message sent successfully!</h5>
                    <p className="text-xs mt-0.5 opacity-80">Our editorial office will respond within 48 business hours.</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/25 text-red-700 dark:text-red-400 animate-entrance">
                  <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-bold">Submission Error</h5>
                    <p className="text-xs mt-0.5 opacity-80">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="name-input" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Your Name</label>
                    <input
                      id="name-input"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email-input" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                    <input
                      id="email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject-input" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Subject</label>
                  <input
                    id="subject-input"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief description of your query"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message-input" className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Message</label>
                  <textarea
                    id="message-input"
                    required
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your suggestions, pitches or queries here..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-shimmer w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground hover:opacity-92 hover:scale-[1.01] transition-all active:scale-95 disabled:opacity-50 shadow-[0_4px_16px_rgba(99,102,241,0.28)] cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      <VisitorFooter />
    </>
  );
}
