// src/app/explore/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowUpDown, Shield, Battery, Gauge, Eye } from "lucide-react";

export default function ExploreCarsPage() {
  const [variants, setVariants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [budget, setBudget] = useState(100); // Max ex-showroom budget in Lakhs
  const [fuelType, setFuelType] = useState("All");
  const [transmission, setTransmission] = useState("All");
  const [bodyType, setBodyType] = useState("All");
  const [minSafety, setMinSafety] = useState(0); // stars

  // Autocomplete state
  const [searchFocused, setSearchFocused] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadCars() {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await fetch("/api/cars");
        if (!res.ok) {
          throw new Error("Failed to load vehicle catalog. Database connection pending.");
        }
        const data = await res.json();
        if (Array.isArray(data)) {
          setVariants(data);
        } else {
          setVariants([]);
        }
      } catch (err: any) {
        console.error("Error loading explore cars:", err);
        setErrorMsg(err.message || "Failed to load catalog.");
      } finally {
        setLoading(false);
      }
    }
    loadCars();
  }, []);

  // Filter variants
  const filteredVariants = useMemo(() => {
    return variants.filter(v => {
      // 1. Search term match (Brand or Model or Variant name)
      const fullName = `${v.model.brand.name} ${v.model.name} ${v.name}`.toLowerCase();
      if (searchTerm && !fullName.includes(searchTerm.toLowerCase())) return false;

      // 2. Budget match (Convert price to Lakhs)
      const priceLakhs = v.exShowroomPrice / 100000;
      if (priceLakhs > budget) return false;

      // 3. Fuel type match
      if (fuelType !== "All" && v.fuelType !== fuelType) return false;

      // 4. Transmission match
      if (transmission !== "All" && v.transmission !== transmission) return false;

      // 5. Body type match
      if (bodyType !== "All" && v.model.bodyType !== bodyType) return false;

      // 6. Safety rating match
      const rating = v.model.safetyRating || 0;
      if (minSafety > 0 && rating < minSafety) return false;

      return true;
    });
  }, [variants, searchTerm, budget, fuelType, transmission, bodyType, minSafety]);

  // Autocomplete Suggestions
  const suggestions = useMemo(() => {
    if (!searchTerm) return [];
    const uniqueNames = new Set<string>();
    const matches: string[] = [];
    
    variants.forEach(v => {
      const name = `${v.model.brand.name} ${v.model.name}`;
      if (name.toLowerCase().includes(searchTerm.toLowerCase()) && !uniqueNames.has(name)) {
        uniqueNames.add(name);
        matches.push(name);
      }
    });

    return matches.slice(0, 5);
  }, [searchTerm, variants]);

  const bodyTypes = ["All", "Hatchback", "Sedan", "SUV", "MUV", "Luxury"];
  const fuelTypes = ["All", "Petrol", "Diesel", "CNG", "EV", "Hybrid"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title & Search Bar */}
      <section className="space-y-4 max-w-4xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Explore Vehicles Catalog</h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-semibold max-w-xl mx-auto">
          Search the database for cars in India and compare their initial parameters or read detailed specifications.
        </p>

        {/* Dynamic Search Box with Suggestions */}
        <div className="relative max-w-2xl mx-auto mt-6">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 pointer-events-none">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search Brand or Model (e.g. Maruti Swift, Nexon EV...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          {/* Autocomplete Suggestions Box */}
          {searchFocused && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200/10 rounded-2xl shadow-xl z-20 overflow-hidden text-left divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSearchTerm(s)}
                  className="w-full text-xs font-semibold px-4 py-3 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 flex items-center gap-2"
                >
                  <Search size={12} className="text-slate-400" /> {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main filter sidebar + Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-slate-200/10 pb-3">
              <SlidersHorizontal size={16} /> Filters
            </h3>

            {/* Budget filter */}
            <div>
              <label className="flex justify-between text-xs font-bold text-slate-500 mb-2.5">
                <span>Max Budget (Ex-Showroom)</span>
                <span className="text-blue-500 font-extrabold">₹{budget} Lakhs</span>
              </label>
              <input
                type="range" min="5" max="100" value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value))}
                className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Fuel Type</label>
              <div className="flex flex-wrap gap-2">
                {fuelTypes.map(f => (
                  <button
                    key={f}
                    onClick={() => setFuelType(f)}
                    className={`text-xs px-3 py-1.5 rounded-xl font-bold transition ${
                      fuelType === f 
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/10" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Transmission */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Transmission</label>
              <select
                value={transmission}
                onChange={(e) => setTransmission(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 border border-slate-200/10"
              >
                <option value="All">All Transmissions</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            {/* Body Type */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Body Type</label>
              <select
                value={bodyType}
                onChange={(e) => setBodyType(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 border border-slate-200/10"
              >
                {bodyTypes.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Safety Stars */}
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-2">Min Safety Rating</label>
              <div className="flex justify-between gap-1.5">
                {[0, 3, 4, 5].map(stars => (
                  <button
                    key={stars}
                    onClick={() => setMinSafety(stars)}
                    className={`flex-grow text-center text-xs py-2 rounded-xl font-bold transition ${
                      minSafety === stars
                        ? "bg-blue-500 text-white shadow-md shadow-blue-500/10"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    {stars === 0 ? "Any" : `${stars} ★`}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Cars List Grid */}
        <section className="lg:col-span-3">
          {errorMsg ? (
            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl min-h-[300px] border border-red-500/10 text-center">
              <h3 className="text-lg font-bold text-red-650 dark:text-red-400">Database Connection Pending</h3>
              <p className="text-xs text-slate-500 mt-2 font-semibold max-w-sm">{errorMsg}</p>
              <p className="text-xs text-slate-500 mt-4 font-semibold max-w-sm">
                Ensure you have set the `DATABASE_URL` environment variable on Vercel and pushed the database schema using `npx prisma db push` locally.
              </p>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="glass-card p-6 rounded-3xl h-[220px] animate-pulse space-y-4">
                  <div className="h-6 w-1/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                  <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : filteredVariants.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl min-h-[300px]">
              <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100">No Cars Match Your Filter</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs text-center">Try loosening your budget parameters, selecting another fuel type, or clearing safety filters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVariants.map(v => (
                <div key={v.id} className="glass-card p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.01] transition-all duration-200 shadow-sm border border-slate-200/5">
                  <div className="space-y-4">
                    {/* Header: Brand & Model */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">{v.model.brand.name}</span>
                        <h4 className="text-xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100">{v.model.name}</h4>
                        <p className="text-xs font-semibold text-slate-500">{v.name}</p>
                      </div>
                      <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200/10">
                        {v.model.bodyType}
                      </span>
                    </div>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/5 text-xs text-slate-600 dark:text-slate-400 font-semibold">
                      <span className="flex items-center gap-1.5"><Gauge size={14} /> {v.transmission}</span>
                      <span className="flex items-center gap-1.5"><Battery size={14} /> {v.fuelType}</span>
                      <span className="flex items-center gap-1.5">
                        <Shield size={14} className="text-amber-500" /> {v.model.safetyRating ? `${v.model.safetyRating} ★` : "Unrated"}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <div>
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Ex-Showroom Price</span>
                        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                          ₹{(v.exShowroomPrice / 100000).toFixed(2)} Lakhs
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 font-bold uppercase tracking-wide">Real Mileage</span>
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">
                          {v.realWorldMileage} {v.fuelType.toLowerCase() === "ev" ? "km/kWh" : "km/L"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <Link
                      href={`/cars/${v.id}`}
                      className="flex items-center justify-center gap-1.5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-black transition"
                    >
                      <Eye size={14} /> View Specs
                    </Link>
                    <Link
                      href={`/?compare=${v.id}`}
                      className="flex items-center justify-center py-3.5 rounded-2xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-black transition shadow-md shadow-blue-500/10"
                    >
                      Compare TCO
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>

    </div>
  );
}
