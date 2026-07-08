"use client";

import React, { useState, useEffect } from "react";
import { Users, Trash2, Download, Search, CheckCircle2 } from "lucide-react";
import { dbService } from "@/lib/db";

export default function NewsletterManagerPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [feedback, setFeedback] = useState("");

  const loadSubscribers = async () => {
    const list = await dbService.getNewsletterSubscribers();
    setSubscribers(list);
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to remove this subscriber from the mailing list?",
      )
    )
      return;
    try {
      await dbService.deleteSubscriber(id);
      await loadSubscribers();
      setFeedback("Subscriber removed.");
      setTimeout(() => setFeedback(""), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  // Export CSV Helper
  const handleExportCSV = () => {
    if (subscribers.length === 0) return;

    // Header row
    let csvContent = "ID,Email,SubscribedAt\n";
    // Rows
    subscribers.forEach((s) => {
      csvContent += `"${s.id}","${s.email}","${s.subscribedAt}"\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `newsletter_subscribers_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setFeedback("CSV file download triggered successfully.");
    setTimeout(() => setFeedback(""), 4000);
  };

  // Filter list
  const filteredSubscribers = subscribers.filter((s) =>
    s.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Mailing list directory. Export members to CSV for third-party
            newsletter delivery integrations.
          </p>
        </div>

        {subscribers.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted/80 shadow-sm transition-all"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        )}
      </div>

      {feedback && (
        <div className="flex items-center gap-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 p-3 rounded-lg text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4" />
          {feedback}
        </div>
      )}

      {/* Filter and List Card */}
      <div className="space-y-4">
        <div className="flex rounded-xl border border-border bg-card max-w-xs items-center px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
          <Search className="h-4 w-4 text-muted-foreground mr-1.5" />
          <input
            type="text"
            placeholder="Search email list..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs w-full focus:outline-none text-foreground py-0.5"
          />
        </div>

        {filteredSubscribers.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop view: Table */}
            <div className="hidden sm:block overflow-hidden rounded-2xl border border-border/40 bg-card">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/40 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <th className="p-4">Subscriber Email</th>
                    <th className="p-4">Date Joined</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30 text-foreground">
                  {filteredSubscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-muted/15 transition-colors"
                    >
                      <td className="p-4 font-semibold text-xs sm:text-sm">
                        {sub.email}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(sub.subscribedAt).toLocaleString()}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-500/10 cursor-pointer"
                          title="Delete subscriber"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view: Card stack */}
            <div className="sm:hidden flex flex-col gap-3">
              {filteredSubscribers.map((sub) => (
                <div
                  key={sub.id}
                  className="rounded-2xl border border-border/30 bg-card p-4 flex flex-col gap-3 shadow-sm hover:border-foreground/10 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">
                        {sub.email}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-semibold">
                        Joined: {new Date(sub.subscribedAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(sub.id)}
                      className="p-2 rounded-xl text-red-600 hover:bg-red-500/10 border border-red-500/10 cursor-pointer shrink-0"
                      title="Delete subscriber"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-card">
            <Users className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-semibold text-foreground">
              No subscribers registered
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Mailing list is currently empty.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
