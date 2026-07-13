// src/components/ThemeWrapper.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sun, Moon, Car, BarChart3, Database, ShieldAlert, Menu, X } from "lucide-react";

interface ThemeContextType {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Initial theme check
    const isDark = localStorage.getItem("theme") === "dark" || 
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}

export default function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile menu on path change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "TCO Calculator", icon: BarChart3 },
    { href: "/explore", label: "Explore Cars", icon: Car },
    { href: "/admin/dashboard", label: "Admin Panel", icon: Database },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col transition-colors duration-300">
        {/* Header/Navbar */}
        <header className="sticky top-0 z-50 glass-card border-b border-slate-200/10 shadow-sm backdrop-blur-md no-print">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand Logo */}
              <div className="flex items-center gap-2">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-800 dark:text-slate-100">
                  <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-md shadow-indigo-500/20">
                    <Car size={20} className="animate-pulse" />
                  </span>
                  <span>
                    CarTCO<span className="text-blue-500 dark:text-blue-400 font-extrabold">.in</span>
                  </span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-slate-200/50 dark:bg-slate-800 text-blue-600 dark:text-blue-400"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <Icon size={16} />
                      {link.label}
                    </Link>
                  );
                })}
              </nav>

              {/* Action Utilities (Theme toggle & Mobile menu) */}
              <div className="flex items-center gap-3">
                <ThemeToggler />

                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
                >
                  {menuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Nav Menu */}
          {menuOpen && (
            <div className="md:hidden border-t border-slate-200/10 px-4 py-4 space-y-2 glass-card">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-500 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}
        </header>

        {/* Page Content */}
        <main className="flex-grow flex flex-col">{children}</main>

        {/* Footer */}
        <footer className="glass-card border-t border-slate-200/10 py-10 text-center text-sm text-slate-500 dark:text-slate-400 no-print mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex justify-center gap-6 text-xs font-semibold tracking-wide uppercase">
              <Link href="/" className="hover:text-blue-500 transition">TCO Calculator</Link>
              <Link href="/explore" className="hover:text-blue-500 transition">Explore Models</Link>
              <Link href="/admin/dashboard" className="hover:text-blue-500 transition">Data Panel</Link>
            </div>
            <p className="max-w-md mx-auto text-xs leading-relaxed opacity-75">
              Disclaimer: All calculations, fuel prices, and tax rates are estimates for comparison purposes. 
              Actual on-road prices, interest rates, and resale values may vary by dealer, state policies, and vehicle condition.
            </p>
            <div className="border-t border-slate-200/10 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <p>&copy; {new Date().getFullYear()} CarTCO.in India. Built with premium automotive insights.</p>
              <p className="flex items-center gap-1 opacity-75">
                <ShieldAlert size={14} className="text-amber-500" /> Verify final rates with local dealerships.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

function ThemeToggler() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [mounted, setMounted] = useState(false);

  // prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="w-9 h-9 rounded-xl bg-slate-200/30 dark:bg-slate-800/30 animate-pulse"></div>;

  return (
    <button
      onClick={toggleDarkMode}
      aria-label="Toggle Theme"
      className="p-2.5 rounded-xl border border-slate-200/10 bg-slate-200/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-800/80 transition shadow-sm"
    >
      {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
    </button>
  );
}
