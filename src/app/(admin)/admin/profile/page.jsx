"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Shield, Key, FileText, Camera, ShieldCheck, AlertCircle } from "lucide-react";
import { dbService } from "@/lib/db";
import { useAuth } from "@/lib/auth";
import confetti from "canvas-confetti";

export default function AdminProfilePage() {
  const { user, updateUserSession } = useAuth();
  
  const [adminDetails, setAdminDetails] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Administrator");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        setLoading(true);
        let list = await dbService.getAdmins();
        let matched = list.find((a) => a.email.toLowerCase() === user.email.toLowerCase());
        
        // If the authenticated user doesn't exist in the list DB, register them immediately
        if (!matched) {
          matched = await dbService.addAdmin({
            email: user.email,
            displayName: user.displayName || "Admin User",
            role: "Administrator",
            createdAt: new Date().toISOString()
          });
          list = await dbService.getAdmins();
        }

        if (matched) {
          setAdminDetails(matched);
          setDisplayName(matched.displayName || user.displayName || "");
          setEmail(matched.email || user.email || "");
          setRole(matched.role || "Administrator");
          setAvatarUrl(matched.avatarUrl || "");
          setBio(matched.bio || "");
        }
      } catch (err) {
        console.error(err);
        setErrorMsg("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const url = await dbService.uploadImage(file);
      setAvatarUrl(url);
      setSuccessMsg("Profile photo uploaded. Save profile to apply changes!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to upload profile photo.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (submitting || !displayName.trim() || !email.trim()) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const updateData = {
        displayName: displayName.trim(),
        email: email.trim(),
        avatarUrl,
        bio: bio.trim(),
      };

      await dbService.updateAdminProfile(adminDetails.id, updateData);

      // Sync active session context
      updateUserSession({
        displayName: displayName.trim(),
        email: email.trim(),
        avatarUrl,
      });

      setSuccessMsg("Your profile profile information has been updated!");
      confetti({
        particleCount: 45,
        spread: 35,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to save profile changes.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
          My Profile
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal metadata, profile photo, and biography.
        </p>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-red-700 dark:text-red-400 animate-entrance text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 animate-entrance text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-4 rounded-2xl border border-border/40 bg-card p-6 flex flex-col items-center text-center space-y-4 shadow-sm">
          <div className="relative group">
            <div className="h-28 w-28 rounded-full overflow-hidden border-2 border-primary/25 bg-muted flex items-center justify-center relative shadow-inner">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-muted-foreground/45" />
              )}
              {uploadingAvatar && (
                <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-primary"></div>
                </div>
              )}
            </div>
            
            <label className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:opacity-90 active:scale-95 cursor-pointer transition-transform">
              <Camera className="h-4.5 w-4.5" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div>
            <h3 className="font-bold text-base text-foreground font-geist-sans">
              {displayName || "Admin Member"}
            </h3>
            <p className="text-xs text-muted-foreground font-semibold mt-0.5">
              {role}
            </p>
          </div>

          <div className="w-full border-t border-border/20 pt-3 text-[11px] text-muted-foreground leading-normal text-left font-medium">
            Authorized console access. Assigned to email: <span className="font-mono">{email}</span>
          </div>
        </div>

        {/* Right Side: Form details */}
        <form onSubmit={handleSave} className="md:col-span-8 rounded-2xl border border-border/40 bg-card p-6 shadow-sm space-y-5">
          <div className="border-b border-border/20 pb-3">
            <h3 className="text-base font-bold text-foreground font-geist-sans">
              Profile Configurations
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update details used for article authorship attributes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Display Name (Pen Name)
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Nicolas Tesla"
                  className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. email@example.com"
                  className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Role (Read-Only)
              </label>
              <div className="relative flex items-center">
                <Shield className="absolute left-3.5 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="text"
                  readOnly
                  value={role}
                  className="w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 py-2.5 text-sm text-muted-foreground/80 focus:outline-none cursor-not-allowed select-none"
                />
              </div>
            </div>
          </div>


          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Short Author Biography (Bio)
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="e.g. Technology writer specializing in Next.js development..."
              rows={4}
              className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 placeholder:text-muted-foreground/40 resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
          >
            {submitting ? "Saving profile changes..." : "Save Profile Details"}
          </button>
        </form>
      </div>
    </div>
  );
}
