"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useToast } from "@/lib/contexts/ToastContext";
import { User, LogOut, Loader2 } from "lucide-react";

interface HeaderProps {
  title?: string;
  showUserInfo?: boolean;
}

export default function Header({ title, showUserInfo = true }: HeaderProps) {
  const router = useRouter();
  const { success, error: showError } = useToast();
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();

  async function handleLogout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      success("Logged out successfully", "See you next time!");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
      showError("Logout Failed", "Please try again");
    } finally {
      setBusy(false);
    }
  }

  if (!showUserInfo && !title) return null;

  return (
    <header className="flex items-center justify-between">
      {title && (
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      )}
      
      {showUserInfo && (
        <div className="flex items-center gap-4">
          {loading ? (
            <div className="flex items-center gap-2 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading...</span>
            </div>
          ) : user ? (
            <>
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">
                    {user.username || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                disabled={busy}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Logout"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="hidden sm:inline">Logging out...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span className="hidden sm:inline">Logout</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-sm text-slate-600">Not logged in</div>
          )}
        </div>
      )}
    </header>
  );
}
