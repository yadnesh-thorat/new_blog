"use client";

import React, { useState, useEffect } from "react";
import { Mail, Trash2, ChevronRight, X, User } from "lucide-react";
import { dbService } from "@/lib/db";

export default function ContactsManagerPage() {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    const list = await dbService.getContacts();
    setMessages(list);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleOpenDetail = async (msg) => {
    setSelectedMessage(msg);
    if (!msg.read) {
      await dbService.markContactAsRead(msg.id);
      await loadMessages();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    try {
      await dbService.deleteContact(id);
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      await loadMessages();
    } catch (err) {
      console.error(err);
    }
  };

  const handleClose = () => {
    setSelectedMessage(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border/40 pb-4">
        <h1 className="text-3xl font-extrabold font-geist-sans tracking-tight">
          Contact Inbox
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review partnership inquiries, technical suggestions, and comments
          uploaded by the contact portal.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Messages List (Col 7 / 12) */}
        <div className="lg:col-span-7 space-y-3.5">
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleOpenDetail(msg)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                    selectedMessage?.id === msg.id
                      ? "bg-primary text-primary-foreground border-primary shadow"
                      : msg.read
                        ? "bg-card border-border/30 hover:border-foreground/20 text-foreground"
                        : "bg-card border-l-4 border-l-indigo-600 border-y-border/30 border-r-border/30 font-semibold text-foreground shadow-sm hover:border-foreground/20"
                  }`}
                >
                  <div className="space-y-1 truncate pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs truncate max-w-[120px] font-bold">
                        {msg.name}
                      </span>
                      <span className={`text-[9px] font-medium opacity-60`}>
                        {new Date(msg.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    <p
                      className={`text-xs truncate font-geist-sans ${
                        selectedMessage?.id === msg.id
                          ? "text-primary-foreground/90"
                          : "text-foreground"
                      }`}
                    >
                      {msg.subject}
                    </p>
                    <p
                      className={`text-[10px] truncate ${
                        selectedMessage?.id === msg.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {msg.message}
                    </p>
                  </div>
                  <ChevronRight className="h-4.5 w-4.5 shrink-0 opacity-70" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-border/40 rounded-2xl bg-card">
              <Mail className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm font-semibold text-foreground">
                Inbox Empty
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                No contact messages have been logged yet.
              </p>
            </div>
          )}
        </div>

        {/* Message Details (Col 5 / 12) */}
        <div className="lg:col-span-5">
          {selectedMessage ? (
            <div className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow animate-slide-up sticky top-24">
              <div className="flex justify-between items-start border-b border-border/20 pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Message detail
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Sent: {new Date(selectedMessage.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Sender Info
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-semibold text-foreground">
                      {selectedMessage.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({selectedMessage.email})
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Subject Line
                  </p>
                  <p className="text-sm font-bold text-foreground mt-0.5">
                    {selectedMessage.subject}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                    Message
                  </p>
                  <div className="p-3 rounded-lg bg-muted/40 text-xs sm:text-sm leading-relaxed text-muted-foreground mt-1 border border-border/20 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-border/20">
                <button
                  onClick={() => handleDelete(selectedMessage.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-red-500/20 text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete message
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/40 p-12 text-center text-xs text-muted-foreground sticky top-24">
              Select an inbox item from the list to preview sender info,
              subject, and message details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
