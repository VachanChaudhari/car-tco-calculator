// src/app/admin/login/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Successful login, token is saved in cookie via API response headers
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 font-extrabold text-xs tracking-wider uppercase px-3 py-1.5 rounded-full inline-block">
            Administrative Portal
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Enter your credentials to manage vehicle inventories, taxes, and fuel rates.</p>
        </div>

        {/* Card Panel */}
        <div className="glass-card p-8 rounded-3xl space-y-6 shadow-xl border border-slate-200/5">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/10 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={16} /> <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  placeholder="admin@cartco.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-850 border border-slate-200/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-850 border border-slate-200/10 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-extrabold text-xs uppercase tracking-wider transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5 cursor-pointer mt-6"
            >
              {loading ? "Authenticating Session..." : (
                <>
                  Enter Dashboard <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Info Box */}
        <div className="text-center">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Default Seed Admin: <span className="text-slate-700 dark:text-slate-350 select-all">admin@cartco.in</span> | Password: <span className="text-slate-700 dark:text-slate-350 select-all">adminpassindia</span>
          </p>
        </div>

      </div>
    </div>
  );
}
