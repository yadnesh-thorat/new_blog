"use client";

import React, { useState, useEffect } from "react";
import {
  Save,
  AlertCircle,
  CheckCircle2,
  Sliders,
  Info,
  Users,
  Globe,
} from "lucide-react";
import { dbService } from "@/lib/db";
import confetti from "canvas-confetti";

export default function SettingsManagerPage() {
  const [settings, setSettings] = useState(null);
  // Tab control
  const [activeTab, setActiveTab] = useState("general");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const url = await dbService.uploadImage(file);
      setSettings(prev => ({
        ...prev,
        logoImage: url
      }));
      setSuccessMsg("Website logo uploaded successfully!");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload logo image. Please try pasting a URL directly.");
    } finally {
      setUploadingLogo(false);
    }
  };

  useEffect(() => {
    async function loadSettings() {
      const data = await dbService.getSettings();
      setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!settings || submitting) return;

    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      await dbService.saveSettings(settings);
      setSuccessMsg("Global website configurations saved successfully!");
      confetti({
        particleCount: 50,
        spread: 40,
        origin: { y: 0.8 },
      });

      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      setErrorMsg(err?.message || "Failed to save website settings.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to deep update nested settings object values
  const updateGeneralSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const updateHeroSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      hero: {
        ...settings.hero,
        [field]: value,
      },
    });
  };

  const updateAboutSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      aboutContent: {
        ...settings.aboutContent,
        [field]: value,
      },
    });
  };

  const updateContactSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      contactInfo: {
        ...settings.contactInfo,
        [field]: value,
      },
    });
  };

  const updateSocialLinkSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      contactInfo: {
        ...settings.contactInfo,
        socialLinks: {
          ...settings.contactInfo.socialLinks,
          [field]: value,
        },
      },
    });
  };

  const updateSEOSetting = (field, value) => {
    if (!settings) return;
    setSettings({
      ...settings,
      seoDefaults: {
        ...settings.seoDefaults,
        [field]: value,
      },
    });
  };

  if (loading || !settings) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const tabs = [
    { id: "general", name: "General & Hero", icon: Sliders },
    { id: "about", name: "About Details", icon: Users },
    { id: "contact", name: "Contact & Info", icon: Info },
    { id: "seo", name: "Default SEO", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
          Website Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adjust website names, landing hero copy, mission statements, physical
          office contacts, and default search engine cards.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-4 rounded-xl text-sm font-semibold">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 p-4 rounded-xl text-sm font-semibold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Main settings tabs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Navigation tabs (Col 3) */}
        <div className="lg:col-span-3 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap lg:whitespace-normal ${
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Tab content panel (Col 9) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-9 rounded-2xl border border-border/40 bg-card p-6 space-y-6"
        >
          {activeTab === "general" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2">
                General Info
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-webname"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Website Name
                  </label>
                  <input
                    id="settings-webname"
                    type="text"
                    required
                    value={settings.websiteName}
                    onChange={(e) =>
                      updateGeneralSetting("websiteName", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-logo"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Header Logo Text
                  </label>
                  <input
                    id="settings-logo"
                    type="text"
                    required
                    value={settings.logo}
                    onChange={(e) =>
                      updateGeneralSetting("logo", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                  />
                </div>
              </div>

              {/* Website Logo Image (Upload / URL) */}
              <div className="space-y-1.5 border-t border-border/10 pt-4">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="settings-logo-img"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Website Logo Image (Optional)
                  </label>
                  <span className="text-[10px] text-muted-foreground font-semibold">
                    Upload image file or paste URL
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    id="settings-logo-img"
                    type="text"
                    value={settings.logoImage || ""}
                    onChange={(e) =>
                      updateGeneralSetting("logoImage", e.target.value)
                    }
                    placeholder="Paste logo URL (e.g. SVG or PNG)..."
                    className="flex-1 rounded-xl border border-border bg-background/50 px-3.5 py-2.5 text-sm text-foreground focus:outline-none placeholder:text-muted-foreground/50"
                  />
                  <label className="rounded-xl border border-border bg-muted/40 hover:bg-muted text-xs font-bold px-4 py-2.5 cursor-pointer shrink-0 flex items-center justify-center transition-all active:scale-95 text-foreground">
                    <span>{uploadingLogo ? "Uploading..." : "Upload"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      disabled={uploadingLogo}
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {settings.logoImage && (
                  <div className="mt-3 relative h-16 w-32 overflow-hidden rounded-xl border border-border bg-muted/20 flex items-center justify-center">
                    <img
                      src={settings.logoImage}
                      alt="Logo Preview"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-footer"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Copyright Footer Text
                </label>
                <input
                  id="settings-footer"
                  type="text"
                  required
                  value={settings.footerText}
                  onChange={(e) =>
                    updateGeneralSetting("footerText", e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2 pt-4">
                Landing Hero Banner
              </h3>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-herotitle"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Hero Title Copy
                </label>
                <input
                  id="settings-herotitle"
                  type="text"
                  required
                  value={settings.hero.title}
                  onChange={(e) => updateHeroSetting("title", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-herosubtitle"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Hero Subtitle Copy
                </label>
                <textarea
                  id="settings-herosubtitle"
                  required
                  rows={3}
                  value={settings.hero.subtitle}
                  onChange={(e) =>
                    updateHeroSetting("subtitle", e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-ctatext"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    CTA Action Text
                  </label>
                  <input
                    id="settings-ctatext"
                    type="text"
                    required
                    value={settings.hero.ctaText}
                    onChange={(e) =>
                      updateHeroSetting("ctaText", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-ctalink"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    CTA Anchor Link
                  </label>
                  <input
                    id="settings-ctalink"
                    type="text"
                    required
                    value={settings.hero.ctaLink}
                    onChange={(e) =>
                      updateHeroSetting("ctaLink", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "about" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2">
                About Section Details
              </h3>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-abouttitle"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Page Title
                </label>
                <input
                  id="settings-abouttitle"
                  type="text"
                  required
                  value={settings.aboutContent.title}
                  onChange={(e) => updateAboutSetting("title", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-abouttext"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Introduction Copy
                </label>
                <textarea
                  id="settings-abouttext"
                  required
                  rows={4}
                  value={settings.aboutContent.text}
                  onChange={(e) => updateAboutSetting("text", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-mission"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Mission Statement
                  </label>
                  <textarea
                    id="settings-mission"
                    required
                    rows={3}
                    value={settings.aboutContent.mission}
                    onChange={(e) =>
                      updateAboutSetting("mission", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  ></textarea>
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-vision"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Vision Statement
                  </label>
                  <textarea
                    id="settings-vision"
                    required
                    rows={3}
                    value={settings.aboutContent.vision}
                    onChange={(e) =>
                      updateAboutSetting("vision", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  ></textarea>
                </div>
              </div>

              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground pt-4">
                Statistical Highlights
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {settings.aboutContent.stats.map((st, idx) => (
                  <div
                    key={idx}
                    className="space-y-1 rounded-lg border border-border/40 p-3 bg-muted/10"
                  >
                    <label
                      htmlFor={`stat-label-${idx}`}
                      className="text-[10px] uppercase font-bold text-muted-foreground"
                    >
                      Label
                    </label>
                    <input
                      id={`stat-label-${idx}`}
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const newStats = [...settings.aboutContent.stats];
                        newStats[idx].label = e.target.value;
                        updateAboutSetting("stats", newStats);
                      }}
                      className="w-full rounded bg-background border border-border px-2 py-0.5 text-xs"
                    />

                    <label
                      htmlFor={`stat-value-${idx}`}
                      className="text-[10px] uppercase font-bold text-muted-foreground block mt-1"
                    >
                      Value
                    </label>
                    <input
                      id={`stat-value-${idx}`}
                      type="text"
                      value={st.value}
                      onChange={(e) => {
                        const newStats = [...settings.aboutContent.stats];
                        newStats[idx].value = e.target.value;
                        updateAboutSetting("stats", newStats);
                      }}
                      className="w-full rounded bg-background border border-border px-2 py-0.5 text-xs font-bold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2">
                Direct Contacts
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-email"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Support Email
                  </label>
                  <input
                    id="settings-email"
                    type="email"
                    required
                    value={settings.contactInfo.email}
                    onChange={(e) =>
                      updateContactSetting("email", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-phone"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Phone Support
                  </label>
                  <input
                    id="settings-phone"
                    type="text"
                    required
                    value={settings.contactInfo.phone}
                    onChange={(e) =>
                      updateContactSetting("phone", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-address"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Physical HQ Address
                </label>
                <input
                  id="settings-address"
                  type="text"
                  required
                  value={settings.contactInfo.address}
                  onChange={(e) =>
                    updateContactSetting("address", e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-maps"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Google Maps Embed Source Link
                </label>
                <input
                  id="settings-maps"
                  type="text"
                  required
                  value={settings.contactInfo.mapsEmbed}
                  onChange={(e) =>
                    updateContactSetting("mapsEmbed", e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2 pt-4">
                Social Network Overrides
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-twitter"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    Twitter URL
                  </label>
                  <input
                    id="settings-twitter"
                    type="text"
                    value={settings.contactInfo.socialLinks.twitter || ""}
                    onChange={(e) =>
                      updateSocialLinkSetting("twitter", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-github"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    GitHub URL
                  </label>
                  <input
                    id="settings-github"
                    type="text"
                    value={settings.contactInfo.socialLinks.github || ""}
                    onChange={(e) =>
                      updateSocialLinkSetting("github", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-linkedin"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    LinkedIn URL
                  </label>
                  <input
                    id="settings-linkedin"
                    type="text"
                    value={settings.contactInfo.socialLinks.linkedin || ""}
                    onChange={(e) =>
                      updateSocialLinkSetting("linkedin", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div className="space-y-1.5">
                  <label
                    htmlFor="settings-youtube"
                    className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                  >
                    YouTube URL
                  </label>
                  <input
                    id="settings-youtube"
                    type="text"
                    value={settings.contactInfo.socialLinks.youtube || ""}
                    onChange={(e) =>
                      updateSocialLinkSetting("youtube", e.target.value)
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-4">
              <h3 className="text-base font-bold font-geist-sans text-foreground border-b border-border/20 pb-2">
                Global Metadata Cards
              </h3>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-seotitle"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Default Page Title (Tab name)
                </label>
                <input
                  id="settings-seotitle"
                  type="text"
                  required
                  value={settings.seoDefaults.title}
                  onChange={(e) => updateSEOSetting("title", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-seodesc"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Default Meta Description
                </label>
                <textarea
                  id="settings-seodesc"
                  required
                  rows={4}
                  value={settings.seoDefaults.description}
                  onChange={(e) =>
                    updateSEOSetting("description", e.target.value)
                  }
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="settings-seoimage"
                  className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                >
                  Open Graph Image (Social preview cards)
                </label>
                <input
                  id="settings-seoimage"
                  type="text"
                  required
                  value={settings.seoDefaults.ogImage}
                  onChange={(e) => updateSEOSetting("ogImage", e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground"
                />

                {settings.seoDefaults.ogImage && (
                  <img
                    src={settings.seoDefaults.ogImage}
                    alt="Social Preview OG Card"
                    className="mt-2 h-40 w-full object-cover rounded-xl border border-border"
                  />
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              <Save className="h-4 w-4" />
              {submitting ? "Saving..." : "Save Website Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
