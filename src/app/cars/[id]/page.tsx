// src/app/cars/[id]/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ShieldCheck, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle, 
  CheckCircle, 
  DollarSign, 
  Calendar,
  Layers,
  Sparkles
} from "lucide-react";
import { calculateTCO } from "@/lib/tcoCalculator";

export default function CarDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [variant, setVariant] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCar() {
      try {
        setLoading(true);
        const res = await fetch(`/api/cars/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setVariant(data);
        } else {
          router.push("/explore");
        }
      } catch (err) {
        console.error("Error loading car details:", err);
        router.push("/explore");
      } finally {
        setLoading(false);
      }
    }
    if (params.id) {
      loadCar();
    }
  }, [params.id]);

  // Generate dynamic pros, cons, and features based on fuel type, exshowroom price, and body segment
  const editorial = useMemo(() => {
    if (!variant) return null;
    const isEv = variant.fuelType.toLowerCase() === "ev" || variant.fuelType.toLowerCase() === "electric";
    const isHybrid = variant.fuelType.toLowerCase() === "hybrid";
    const isDiesel = variant.fuelType.toLowerCase() === "diesel";
    const isLuxury = variant.model.segment.toLowerCase() === "luxury";
    const price = variant.exShowroomPrice;

    const pros = [
      "Excellent build quality and structural integrity.",
      "High real-world mileage efficiency compared to segment averages."
    ];
    const cons = [
      "Initial registration fees and dealer overhead add upfront premium.",
      "Depreciation is steep during the first 3 years of ownership."
    ];
    const features = [
      "Anti-lock Braking System (ABS) with Electronic Brake-force Distribution (EBD).",
      "Touchscreen infotainment system with smartphone integration.",
      "Automatic climate control with rear vents.",
      "Engine start/stop button with keyless entry."
    ];

    if (isEv) {
      pros.unshift("Zero tailpipe emissions and minimal carbon footprint.");
      pros.push("Low running costs (approx. ₹1.2 - ₹1.5 per kilometer).");
      cons.unshift("High replacement cost for battery packs out of warranty.");
      cons.push("Limited public fast-charging network coverage outside metros.");
      features.push("Regenerative braking system with multi-mode settings.");
      features.push("Smart charging management and battery pre-heating.");
    } else if (isHybrid) {
      pros.unshift("Smooth hybrid power transition and silent city driving.");
      pros.push("Outstanding fuel efficiency in heavy stop-and-go traffic.");
      cons.push("Double drivetrain components increase long-term complexity.");
      features.push("Dual-zone climate control with smart heat pump.");
    } else if (isDiesel) {
      pros.unshift("Strong torque pull suitable for highway cruising and load-hauling.");
      cons.push("10-year limit in Delhi-NCR (NGT rules) severely impacts resale value.");
      features.push("Variable Geometry Turbocharger (VGT) engine tuning.");
    }

    if (isLuxury) {
      pros.unshift("Premium interior cabin with high-end leather and soundproofing.");
      cons.unshift("Superior horsepower and suspension control.");
      cons.push("Extremely high periodic maintenance and insurance renewal premiums.");
      features.push("Adaptive cruise control and driver assistance systems (ADAS).");
      features.push("Premium multi-speaker audio system.");
    }

    return { pros, cons, features };
  }, [variant]);

  // Run a default 5-year, 10,000 km Delhi TCO calculation for snapshot preview
  const defaultTco = useMemo(() => {
    if (!variant) return null;
    
    // Fallback configurations for preview
    const taxConfig = { registrationFeeFlat: 600, roadTaxPetrolPercent: 10.0, roadTaxDieselPercent: 12.5, roadTaxEvPercent: 0.0, roadTaxCngPercent: 7.0 };
    const fuelConfig = { petrol: 94.72, diesel: 87.62, cng: 75.59, electricity: 6.0 };
    
    return calculateTCO(variant, taxConfig, fuelConfig, null, null, {
      ownershipDuration: 5,
      annualRunning: 10000,
      downPayment: Math.round(variant.exShowroomPrice * 0.2), // 20% down
      loanInterestRate: 8.5,
      loanTenure: 5,
      state: "Delhi",
      accessoriesCost: 15000,
      extendedWarrantyCost: 10000,
      fuelInflation: 6,
      insuranceInflation: 5,
      maintenanceInflation: 5
    });
  }, [variant]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-blue-500 animate-spin"></div>
        <p className="text-xs font-bold text-slate-500 mt-4">Loading vehicle data...</p>
      </div>
    );
  }

  if (!variant) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button */}
      <div>
        <Link
          href="/explore"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-500 transition"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      {/* Main Spec Title */}
      <section className="glass-card p-6 md:p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-8 items-center border border-slate-200/5">
        
        {/* Spec image placeholder / Details */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <span className="text-xs font-black uppercase text-blue-500 tracking-wider block">{variant.model.brand.name}</span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">
              {variant.model.name}
            </h1>
            <p className="text-sm font-semibold text-slate-500 mt-0.5">Variant: <strong className="text-slate-700 dark:text-slate-350">{variant.name}</strong></p>
          </div>

          <div className="flex flex-wrap gap-3.5 text-xs font-bold">
            <span className="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">{variant.fuelType}</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">{variant.transmission}</span>
            <span className="bg-slate-100 dark:bg-slate-800 px-3.5 py-2 rounded-xl">{variant.model.bodyType}</span>
            {variant.model.safetyRating && (
              <span className="bg-amber-500/10 text-amber-500 border border-amber-500/10 px-3.5 py-2 rounded-xl flex items-center gap-1">
                <ShieldCheck size={14} /> {variant.model.safetyRating} Star NCAP
              </span>
            )}
          </div>

          <div className="pt-2">
            <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ex-Showroom Price</span>
            <span className="text-3xl font-black text-slate-900 dark:text-slate-100">
              ₹{(variant.exShowroomPrice / 100000).toFixed(2)} Lakhs
            </span>
          </div>
        </div>

        {/* Call to TCO dashboard Compare */}
        <div className="bg-gradient-to-br from-indigo-500/5 via-blue-500/5 to-purple-500/5 border border-slate-200/10 rounded-2xl p-6 space-y-4 flex flex-col justify-between h-full">
          <div className="space-y-1">
            <h3 className="text-xs font-black uppercase text-indigo-500 tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="animate-pulse" /> Ownership Cost Profile
            </h3>
            <p className="text-xs font-semibold text-slate-500">Analyze full financing, running depreciation, and insurance breakdown for this car.</p>
          </div>
          <Link
            href={`/?compare=${variant.id}`}
            className="w-full text-center py-3.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-md shadow-blue-500/20 text-sm"
          >
            Open in TCO Calculator
          </Link>
        </div>
      </section>

      {/* Spec details grid & TCO preview split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Specs Details */}
        <section className="lg:col-span-2 space-y-8">
          
          {/* Specifications Table */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-200/10 pb-2">Technical Specifications</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Engine Displacement</span>
                <span>{variant.engineCc ? `${variant.engineCc} cc` : "Electric Motor"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Power</span>
                <span>{variant.powerBhp ? `${variant.powerBhp} bhp` : "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Max Torque</span>
                <span>{variant.torqueNm ? `${variant.torqueNm} Nm` : "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">ARAI claimed mileage</span>
                <span>{variant.mileageArai} {variant.fuelType.toLowerCase() === "ev" ? "km/kWh" : "km/L"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Real world mileage</span>
                <span>{variant.realWorldMileage} {variant.fuelType.toLowerCase() === "ev" ? "km/kWh" : "km/L"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Fuel Tank Capacity</span>
                <span>{variant.fuelTankCapacity ? `${variant.fuelTankCapacity} L` : "N/A"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tyre Size Spec</span>
                <span>{variant.tyreSize}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Service Interval</span>
                <span>{variant.serviceIntervalMonths} Mo / {variant.serviceIntervalKm.toLocaleString()} KM</span>
              </div>
            </div>
          </div>

          {/* Pros & Cons Editorial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Pros */}
            <div className="glass-card p-6 rounded-3xl space-y-4 border border-emerald-500/10">
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <ThumbsUp size={18} /> Positives (Pros)
              </h3>
              <ul className="space-y-2 text-xs font-semibold leading-relaxed">
                {editorial?.pros.map((p, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-500 mt-0.5">•</span> <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="glass-card p-6 rounded-3xl space-y-4 border border-red-500/10">
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                <ThumbsDown size={18} /> Negatives (Cons)
              </h3>
              <ul className="space-y-2 text-xs font-semibold leading-relaxed">
                {editorial?.cons.map((c, idx) => (
                  <li key={idx} className="flex gap-2 items-start text-slate-700 dark:text-slate-300">
                    <span className="text-red-500 mt-0.5">•</span> <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Key Features List */}
          <div className="glass-card p-6 rounded-3xl space-y-4">
            <h3 className="text-lg font-bold border-b border-slate-200/10 pb-2">Key Highlights & Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-semibold">
              {editorial?.features.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle size={14} className="text-blue-500" /> <span>{f}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

        {/* TCO Summary Panel (Right side) */}
        <section className="lg:col-span-1 space-y-6">
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <div className="border-b border-slate-200/10 pb-3">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Estimated 5-Year TCO</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Based on Delhi Rates (10K km/yr)</p>
            </div>

            {defaultTco && (
              <div className="space-y-5 text-xs font-semibold">
                
                {/* Net Cost card */}
                <div className="bg-slate-500/5 p-4 rounded-2xl space-y-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Net TCO (Cost - Resale)</span>
                  <span className="text-3xl font-black block tracking-tight">₹{(defaultTco.netOwnershipCost / 100000).toFixed(2)}L</span>
                </div>

                <div className="space-y-2 border-b border-slate-200/10 pb-3">
                  <div className="flex justify-between text-slate-500">
                    <span>On-Road Capital Price</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{(defaultTco.totalUpfrontCost / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Cumulative Running Cost</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{( (defaultTco.totalFuelCost + defaultTco.totalMaintenanceCost) / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Insurance Renewals</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">₹{defaultTco.totalInsuranceRenewals.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Est. Resale (5 Years)</span>
                    <span className="font-bold text-emerald-500">₹{(defaultTco.resaleValue / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Key indicators */}
                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center bg-slate-500/5 p-3 rounded-xl">
                    <span className="flex items-center gap-1.5 text-slate-500"><Calendar size={14} /> Cost Per Year</span>
                    <span className="font-bold text-slate-850 dark:text-slate-100">₹{defaultTco.costPerYear.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center bg-slate-500/5 p-3 rounded-xl">
                    <span className="flex items-center gap-1.5 text-slate-500"><DollarSign size={14} /> Cost Per KM</span>
                    <span className="font-bold text-slate-850 dark:text-slate-100">₹{defaultTco.costPerKm}</span>
                  </div>
                </div>

              </div>
            )}
          </div>
        </section>

      </div>

    </div>
  );
}
