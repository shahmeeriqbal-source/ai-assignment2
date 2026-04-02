"use client";

import { createContext, useContext, useEffect, useState } from "react";

import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  login: (nextUser: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const storageKey = "courtlink-user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      setUser(JSON.parse(raw) as User);
    }
  }, []);

  const login = (nextUser: User) => {
    setUser(nextUser);
    window.localStorage.setItem(storageKey, JSON.stringify(nextUser));
  };

  const logout = () => {
    setUser(null);
    window.localStorage.removeItem(storageKey);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
