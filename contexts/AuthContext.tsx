"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  GoogleAuthProvider,
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  notAllowed: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notAllowed, setNotAllowed] = useState(false);

  useEffect(() => {
    getRedirectResult(auth).catch((err) => console.error("Redirect sign-in error:", err));

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      if (u && ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes((u.email ?? "").toLowerCase())) {
        setNotAllowed(true);
        await signOut(auth);
        setUser(null);
        setLoading(false);
        return;
      }
      setNotAllowed(false);
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = async () => {
    await signInWithRedirect(auth, new GoogleAuthProvider());
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, notAllowed, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
