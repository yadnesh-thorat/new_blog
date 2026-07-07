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
    { icon: Phone, label: "Phone Support", value: contactInfo.phone, href: `tel:${contactInfo.phone}`, color: "from-emerald-500/20 to-emerald-500/5", iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white" },
    { icon: MapPin, label: "Office Headquarters", value: contactInfo.address, href: null, color: "from-amber-500/20 to-amber-500/5", iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 group-hover:bg-amber-500 group-hover:text-white" },
  ];

  return (
    <>
      <VisitorNavbar />

      <main className="flex-grow transition-colors duration-300">

        {/* Page Hero */}
        <section className="relative overflow-hidden py-20 lg:py-28 border-b border-border/30">
          <div className="absolute top-[-100px] right-[10%] w-[400px] h-[400px] bg-primary/8 rounded-full blur-[120px] pointer-events-none -z-10 animate-float-slower" />
          <div className="absolute bottom-[-80px] left-[8%] w-[300px] h-[300px] bg-indigo-500/6 rounded-full blur-[100px] pointer-events-none -z-10 animate-float-slow" />

          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center space-y-6 animate-entrance">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/8 border border-primary/20 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary shadow-[0_0_12px_rgba(99,102,241,0.15)]">
              <MessageSquare className="h-3 w-3" />
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black font-geist-sans tracking-tight text-foreground leading-[1.08]">
              Contact <span className="text-gradient">Aether</span>
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Have questions, editorial pitches, or sponsorship proposals? Fill out the form or reach us via our direct channels.
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

              {/* Map */}
              {contactInfo.mapsEmbed && (
                <div className="overflow-hidden rounded-3xl border border-border/40 h-56 bg-card shadow-sm">
                  <iframe
                    title="office-location-map"
                    src={contactInfo.mapsEmbed}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                  />
                </div>
              )}
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
