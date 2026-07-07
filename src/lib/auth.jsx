"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, isFirebaseConfigured } from "./firebase";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If Firebase is configured, hook up standard listener
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || "Admin User",
            isAdmin: true, // All authenticated dashboard users are admins here
          });
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
      // Mock Login Validation
      // Standard credentials: admin@aether-blog.com / admin123
      if (email === "admin@aether-blog.com" && password === "admin123") {
        const mockUser = {
          uid: "mock-admin-uid-12345",
          email: "admin@aether-blog.com",
          displayName: "Administrator",
          isAdmin: true,
        };
        setUser(mockUser);
        localStorage.setItem("aether_admin_session", JSON.stringify(mockUser));
      } else {
        throw new Error(
          "Invalid admin credentials. Use admin@aether-blog.com / admin123",
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

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
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
