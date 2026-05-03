// src/hooks/useAuth.ts
"use client";

import {
  useState,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, logout as doLogout } from "@/lib/auth";
import type { AuthUser } from "@/types";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

// Export context for Provider
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refresh: async () => {},
});

export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}

// Hook for route protection — use inside pages
export function useRequireAuth(requiredRole?: "admin" | "user") {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login");
        return;
      }
      if (requiredRole === "admin" && user.role !== "admin") {
        router.replace("/dashboard");
      }
    }
  }, [user, isLoading, router, requiredRole]);

  return { user, isLoading };
}
