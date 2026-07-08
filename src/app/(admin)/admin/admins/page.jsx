"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck, Plus, Trash2, Mail, User, ShieldAlert, Key, HelpCircle } from "lucide-react";
import { dbService } from "@/lib/db";
import { useAuth } from "@/lib/auth";

export default function AdminsManagerPage() {
  const { user } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Create Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("Administrator");
  const [submitting, setSubmitting] = useState(false);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const list = await dbService.getAdmins();
      setAdmins(list);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch admin users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setError("");
    setSuccess("");
    setSubmitting(true);

    // Validate email duplication
    const duplicate = admins.some((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (duplicate) {
      setError("This email address is already registered as an administrator.");
      setSubmitting(false);
      return;
    }

    try {
      await dbService.addAdmin({
        email: email.trim().toLowerCase(),
        password,
        displayName: displayName.trim(),
        role,
      });

      setSuccess(`Admin member "${displayName}" created successfully.`);
      setEmail("");
      setDisplayName("");
      setPassword("");
      setRole("Administrator");
      setShowCreateForm(false);
      await loadAdmins();
    } catch (err) {
      setError(err?.message || "Failed to create administrator.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (adminId, adminEmail) => {
    if (user?.email?.toLowerCase() === adminEmail.toLowerCase()) {
      alert("You cannot delete your own administrative account while logged in.");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${adminEmail} from administrators?`)) return;

    try {
      setError("");
      setSuccess("");
      await dbService.deleteAdmin(adminId);
      setSuccess("Administrator removed successfully.");
      await loadAdmins();
    } catch (err) {
      console.error(err);
      setError("Failed to delete administrator.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
            Manage Admins
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Grant dashboard access, add team members, and manage console roles.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 shadow-md transition-opacity self-start sm:self-auto cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" />
          {showCreateForm ? "View Administrators" : "Add Admin Member"}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 p-4 border border-red-500/20 text-red-700 dark:text-red-400 animate-entrance text-xs font-semibold">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 animate-entrance text-xs font-semibold">
          <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {showCreateForm ? (
        /* Create Admin Form */
        <div className="rounded-2xl border border-border/40 bg-card p-6 max-w-xl mx-auto shadow space-y-5 animate-slide-up">
          <div className="border-b border-border/20 pb-3">
            <h3 className="text-base font-bold text-foreground font-geist-sans">
              Add New Administrator
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter user profile credentials. This user will have full access to modify blogs and configurations.
            </p>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Display Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
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
                  placeholder="e.g. john@domain.com"
                  className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Password
              </label>
              <div className="relative flex items-center">
                <Key className="absolute left-3.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-border bg-background/50 pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Administrative Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 cursor-pointer"
              >
                <option value="Administrator">Administrator</option>
                <option value="Editor">Editor</option>
                <option value="Viewer">Viewer</option>
              </select>
            </div>

            <div className="p-3 bg-muted/40 rounded-xl border border-border/20 flex gap-2.5 items-start">
              <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
              <p className="text-[11px] leading-normal text-muted-foreground">
                <strong>Deployment Note</strong>: If your Firebase storage/authentication rules are strictly enabled in production, new administrators must also register using these identical credentials on the Firebase Auth console tab.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-95 shadow-md active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Creating admin account..." : "Save Admin Member"}
            </button>
          </form>
        </div>
      ) : (
        /* Admins List Table */
        <div className="rounded-2xl border border-border/40 bg-card overflow-hidden shadow">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-12 text-center text-xs text-muted-foreground font-semibold">
                Loading administrator list...
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground select-none">
                    <th className="p-4 pl-6">Profile / Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Created Date</th>
                    <th className="p-4 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-4 pl-6 font-semibold text-foreground flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px] border border-primary/20">
                          {admin.displayName ? admin.displayName.slice(0, 2).toUpperCase() : "AD"}
                        </div>
                        <span>{admin.displayName || "N/A"}</span>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{admin.email}</td>
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          {admin.role || "Administrator"}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {admin.createdAt
                          ? new Date(admin.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDelete(admin.id, admin.email)}
                          disabled={user?.email?.toLowerCase() === admin.email.toLowerCase()}
                          className={`p-1.5 rounded-lg border transition-all ${
                            user?.email?.toLowerCase() === admin.email.toLowerCase()
                              ? "opacity-35 cursor-not-allowed border-border/30 text-muted-foreground"
                              : "border-red-500/10 text-red-600 hover:bg-red-500/10 cursor-pointer"
                          }`}
                          title={
                            user?.email?.toLowerCase() === admin.email.toLowerCase()
                              ? "You are logged in with this account"
                              : "Delete admin member"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
