"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";
import { dbService } from "./db";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is configured, hook up standard listener
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const sessionUser = {
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "Admin User",
            isAdmin: true, // All authenticated dashboard users are admins here
          };
          setUser(sessionUser);

          // Ensure this user exists in the admin list
          try {
            const list = await dbService.getAdmins();
            const exists = list.some((a) => a.email.toLowerCase() === fbUser.email.toLowerCase());
            if (!exists) {
              await dbService.addAdmin({
                email: fbUser.email,
                displayName: fbUser.displayName || "Admin User",
                role: "Administrator",
              });
            }
          } catch (e) {
            console.error("Auto-register admin error:", e);
          }
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return unsubscribe;
    } else {
      // Local session simulation
      const session = localStorage.getItem("aether_admin_session");
      if (session) {
        setUser(JSON.parse(session));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      await signInWithEmailAndPassword(auth, email, password);
      // Listener will set user state
    } else {
      // Load fallback local admins list
      let localAdmins = [];
      try {
        const stored = localStorage.getItem("aether_admins_v2");
        if (stored) {
          localAdmins = JSON.parse(stored);
        }
      } catch (err) {
        console.error(err);
      }

      // Seed default admin if list is empty
      if (localAdmins.length === 0) {
        localAdmins.push({
          id: "admin-primary",
          email: "admin@aether-blog.com",
          password: "admin123",
          displayName: "Primary Admin",
          role: "Administrator",
          createdAt: new Date("2026-07-01").toISOString()
        });
        localStorage.setItem("aether_admins_v2", JSON.stringify(localAdmins));
      }

      const matchedAdmin = localAdmins.find(
        (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
      );

      if (matchedAdmin) {
        const sessionUser = {
          uid: matchedAdmin.id,
          email: matchedAdmin.email,
          displayName: matchedAdmin.displayName || "Administrator",
          isAdmin: true,
        };
        setUser(sessionUser);
        localStorage.setItem("aether_admin_session", JSON.stringify(sessionUser));
      } else {
        throw new Error(
          "Invalid admin credentials. Please enter a registered administrator email and password."
        );
      }
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    } else {
      setUser(null);
      localStorage.removeItem("aether_admin_session");
    }
  };

  const updateUserSession = (data) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      if (!isFirebaseConfigured || !auth) {
        localStorage.setItem("aether_admin_session", JSON.stringify(updated));
      }
      return updated;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUserSession,
        isFirebaseActive: !!isFirebaseConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
