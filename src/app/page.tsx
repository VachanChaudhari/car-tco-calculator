// src/app/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { calculateTCO, TcoInput, TcoResult } from "@/lib/tcoCalculator";
import ComparisonCharts from "@/components/ComparisonCharts";
import { 
  Car, 
  IndianRupee, 
  HelpCircle, 
  Share2, 
  Printer, 
  Download, 
  Plus, 
  X, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb
} from "lucide-react";
import confetti from "canvas-confetti";

const CAR_COLORS = ["#3b82f6", "#f97316", "#10b981"]; // Blue, Orange, Emerald

export default function TcoCalculatorPage() {
  // 1. Data States (from API)
  const [brandsData, setBrandsData] = useState<any[]>([]);
  const [stateTaxes, setStateTaxes] = useState<any[]>([]);
  const [fuelPrices, setFuelPrices] = useState<any[]>([]);
  const [serviceCurves, setServiceCurves] = useState<any[]>([]);
  const [depreciationCurves, setDepreciationCurves] = useState<any[]>([]);
  const [dbError, setDbError] = useState("");
  const [loading, setLoading] = useState(true);

  // 2. Selection States
  // Each selection is: { brandId, modelId, variantId }
  const [selA, setSelA] = useState({ brandId: "", modelId: "", variantId: "" });
  const [selB, setSelB] = useState({ brandId: "", modelId: "", variantId: "" });
  const [selC, setSelC] = useState({ brandId: "", modelId: "", variantId: "" });
  const [showCarC, setShowCarC] = useState(false);

  // 3. User Parameters Inputs
  const [duration, setDuration] = useState(5); // 1 - 15 years
  const [annualRunning, setAnnualRunning] = useState(10000); // km/yr
  const [state, setState] = useState("Delhi");
  
  // Financing
  const [downPayPercent, setDownPayPercent] = useState(20); // 20% default
  const [interestRate, setInterestRate] = useState(8.5); // %
  const [loanTenure, setLoanTenure] = useState(5); // years

  // Inflation & Extras
  const [fuelInflation, setFuelInflation] = useState(6); // %
  const [insuranceInflation, setInsuranceInflation] = useState(5); // %
  const [maintenanceInflation, setMaintenanceInflation] = useState(5); // %
  const [accessoriesCost, setAccessoriesCost] = useState(15000);
  const [extendedWarrantyCost, setExtendedWarrantyCost] = useState(10000);

  // Local state for state-specific fuel prices overrides
  const [fuelPetrol, setFuelPetrol] = useState(94.72);
  const [fuelDiesel, setFuelDiesel] = useState(87.62);
  const [fuelCng, setFuelCng] = useState(75.59);
  const [fuelElectricity, setFuelElectricity] = useState(6.00);

  // Share comparison popup status
  const [shareUrl, setShareUrl] = useState("");
  const [showSharePopup, setShowSharePopup] = useState(false);

  // 4. Fetch initialization data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setDbError("");
        // Fetch drop downs & settings
        const [dropRes, configRes] = await Promise.all([
          fetch("/api/cars?action=dropdowns"),
          fetch("/api/settings"),
        ]);
        
        if (!dropRes.ok || !configRes.ok) {
          throw new Error("Database connection failed. Please verify that you configured the DATABASE_URL environment variable on Vercel and executed the schema push command.");
        }

        const dropdowns = await dropRes.json();
        const config = await configRes.json();
        
        if (Array.isArray(dropdowns)) {
          setBrandsData(dropdowns);
        } else {
          throw new Error("Invalid vehicle database structure. Please seed the database.");
        }

        setStateTaxes(config.taxes || []);
        setFuelPrices(config.fuel || []);
        setDepreciationCurves(config.depreciation || []);
        setServiceCurves(config.service || []);

        // Preset initial selections if available
        if (dropdowns.length > 0) {
          const brand1 = dropdowns[0];
          const model1 = brand1.models[0];
          const variant1 = model1?.variants[0];

          const brand2 = dropdowns[1] || dropdowns[0];
          const model2 = brand2.models[0];
          const variant2 = model2?.variants[0];

          if (brand1 && model1 && variant1) {
            setSelA({ brandId: brand1.id, modelId: model1.id, variantId: variant1.id });
          }
          if (brand2 && model2 && variant2) {
            setSelB({ brandId: brand2.id, modelId: model2.id, variantId: variant2.id });
          }
        }

        // Apply URL parameters if sharing link is clicked
        const urlParams = new URLSearchParams(window.location.search);
        const urlCompId = urlParams.get("id");
        const urlCompare = urlParams.get("compare");

        if (urlCompId) {
          const compRes = await fetch(`/api/comparisons?id=${urlCompId}`);
          if (compRes.ok) {
            const data = await compRes.json();
            loadVariantsFromIds(data.carIds.split(","), dropdowns);
          }
        } else if (urlCompare) {
          loadVariantsFromIds(urlCompare.split(","), dropdowns);
        }

      } catch (err: any) {
        console.error("Error loading data:", err);
        setDbError(err.message || "Failed to load database config. Please verify connection.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // helper to parse variant ids from shared link and load selections
  const loadVariantsFromIds = (ids: string[], dropdowns: any[]) => {
    if (ids.length >= 2) {
      const vA = findVariantInTree(ids[0], dropdowns);
      if (vA) setSelA(vA);
      
      const vB = findVariantInTree(ids[1], dropdowns);
      if (vB) setSelB(vB);

      if (ids.length >= 3) {
        const vC = findVariantInTree(ids[2], dropdowns);
        if (vC) {
          setSelC(vC);
          setShowCarC(true);
        }
      }
    }
  };

  const findVariantInTree = (vId: string, tree: any[]) => {
    for (const brand of tree) {
      for (const model of brand.models) {
        for (const variant of model.variants) {
          if (variant.id === vId) {
            return { brandId: brand.id, modelId: model.id, variantId: variant.id };
          }
        }
      }
    }
    return null;
  };

  // 5. Update state fuel prices when state selection changes
  useEffect(() => {
    const selectedStateFuel = fuelPrices.find(f => f.state === state);
    if (selectedStateFuel) {
      setFuelPetrol(selectedStateFuel.petrol);
      setFuelDiesel(selectedStateFuel.diesel);
      setFuelCng(selectedStateFuel.cng);
      setFuelElectricity(selectedStateFuel.electricity);
    }
  }, [state, fuelPrices]);

  // 6. Find details from selections
  const variantA = useMemo(() => findVariantDetails(selA.variantId), [selA.variantId, brandsData]);
  const variantB = useMemo(() => findVariantDetails(selB.variantId), [selB.variantId, brandsData]);
  const variantC = useMemo(() => findVariantDetails(selC.variantId), [selC.variantId, brandsData]);

  function findVariantDetails(vId: string) {
    if (!vId) return null;
    for (const brand of brandsData) {
      for (const model of brand.models) {
        for (const variant of model.variants) {
          if (variant.id === vId) {
            return { ...variant, modelName: model.name, brandName: brand.name, segment: model.segment };
          }
        }
      }
    }
    return null;
  }

  // 7. Calculate TCO for each selected car
  const results = useMemo(() => {
    const list: { id: string; brand: string; model: string; variant: string; tco: TcoResult }[] = [];
    
    const calculateForVariant = (variant: any, indexLabel: string) => {
      if (!variant) return;
      const taxConfig = stateTaxes.find(t => t.state === state);
      const fuelConfig = { petrol: fuelPetrol, diesel: fuelDiesel, cng: fuelCng, electricity: fuelElectricity };
      const serviceConfig = serviceCurves.find(s => s.segment === variant.segment);
      const depConfig = depreciationCurves.find(d => {
        if (variant.fuelType.toLowerCase() === "ev" && d.segment === "EV") return true;
        return d.segment === variant.segment;
      });

      // Down payment calculations: Down payment = exShowroomPrice * percent
      const dynamicDownPayment = Math.round((variant.exShowroomPrice * downPayPercent) / 100);

      const tcoInput: TcoInput = {
        ownershipDuration: duration,
        annualRunning,
        downPayment: dynamicDownPayment,
        loanInterestRate: interestRate,
        loanTenure,
        state,
        fuelPricesOverride: fuelConfig,
        fuelInflation,
        insuranceInflation,
        maintenanceInflation,
        accessoriesCost,
        extendedWarrantyCost
      };

      const tco = calculateTCO(variant, taxConfig, fuelConfig, serviceConfig, depConfig, tcoInput);
      
      list.push({
        id: variant.id,
        brand: variant.brandName,
        model: variant.modelName,
        variant: variant.name,
        tco
      });
    };

    calculateForVariant(variantA, "A");
    calculateForVariant(variantB, "B");
    if (showCarC && variantC) {
      calculateForVariant(variantC, "C");
    }

    return list;
  }, [
    variantA, variantB, variantC, showCarC, 
    duration, annualRunning, state, downPayPercent, 
    interestRate, loanTenure, fuelPetrol, fuelDiesel, 
    fuelCng, fuelElectricity, fuelInflation, 
    insuranceInflation, maintenanceInflation, 
    accessoriesCost, extendedWarrantyCost,
    stateTaxes, fuelPrices, serviceCurves, depreciationCurves
  ]);

  // 8. Financial Insight Badges (Highlights)
  const highlights = useMemo(() => {
    if (results.length < 2) return { lowestTcoId: "", bestValueId: "", lowestRunningId: "" };
    
    let lowestTcoId = results[0].id;
    let lowestTcoVal = results[0].tco.netOwnershipCost;

    let lowestRunningId = results[0].id;
    let lowestRunningVal = results[0].tco.totalFuelCost + results[0].tco.totalMaintenanceCost;

    let bestValueId = results[0].id;
    // Value score: (Ex-Showroom price - Net TCO) / Ex-Showroom price (higher is better)
    let bestValueScore = (results[0].tco.exShowroomPrice - results[0].tco.netOwnershipCost) / results[0].tco.exShowroomPrice;

    results.forEach(r => {
      if (r.tco.netOwnershipCost < lowestTcoVal) {
        lowestTcoVal = r.tco.netOwnershipCost;
        lowestTcoId = r.id;
      }
      
      const runningVal = r.tco.totalFuelCost + r.tco.totalMaintenanceCost;
      if (runningVal < lowestRunningVal) {
        lowestRunningVal = runningVal;
        lowestRunningId = r.id;
      }

      const valScore = (r.tco.exShowroomPrice - r.tco.netOwnershipCost) / r.tco.exShowroomPrice;
      if (valScore > bestValueScore) {
        bestValueScore = valScore;
        bestValueId = r.id;
      }
    });

    return { lowestTcoId, bestValueId, lowestRunningId };
  }, [results]);

  // Trigger celebration on best value identification
  useEffect(() => {
    if (results.length >= 2) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.8 }
      });
    }
  }, [selA.variantId, selB.variantId, selC.variantId]);

  // 9. Handlers
  const handleSaveAndShare = async () => {
    try {
      const carIds = results.map(r => r.id).join(",");
      const res = await fetch("/api/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carIds, title: `Car TCO Comparison: ${results.map(r => r.model).join(" vs ")}` })
      });
      if (res.ok) {
        const data = await res.json();
        const shareLink = `${window.location.origin}/?id=${data.id}`;
        setShareUrl(shareLink);
        setShowSharePopup(true);
        navigator.clipboard.writeText(shareLink);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const exportCsv = () => {
    if (results.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric," + results.map(r => `"${r.brand} ${r.model} (${r.variant})"`).join(",") + "\n";
    
    const rows = [
      ["Ex-Showroom Price (INR)", results.map(r => r.tco.exShowroomPrice)],
      ["On-Road Price (INR)", results.map(r => r.tco.totalUpfrontCost)],
      ["Financing Principal (INR)", results.map(r => r.tco.loanAmount)],
      ["Monthly EMI (INR)", results.map(r => r.tco.monthlyEmi)],
      ["Total Interest Paid (INR)", results.map(r => r.tco.totalInterestPaid)],
      ["Cumulative Fuel Cost (INR)", results.map(r => r.tco.totalFuelCost)],
      ["Cumulative Maintenance (INR)", results.map(r => r.tco.totalMaintenanceCost)],
      ["Insurance Renewals (INR)", results.map(r => r.tco.totalInsuranceRenewals)],
      ["Resale Value (INR)", results.map(r => r.tco.resaleValue)],
      ["Total Cost without Resale (INR)", results.map(r => r.tco.totalCostWithoutResale)],
      ["Net Cost after Resale (INR)", results.map(r => r.tco.netOwnershipCost)],
      ["Cost Per KM (INR)", results.map(r => r.tco.costPerKm)],
      ["Cost Per Day (INR)", results.map(r => r.tco.costPerDay)],
    ];

    rows.forEach(row => {
      csvContent += `"${row[0]}",` + (row[1] as any[]).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Car_TCO_Comparison_${duration}_Years.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper functions for options matching
  const getModelsForBrand = (brandId: string) => {
    const brand = brandsData.find(b => b.id === brandId);
    return brand ? brand.models : [];
  };

  const getVariantsForModel = (brandId: string, modelId: string) => {
    const models = getModelsForBrand(brandId);
    const model = models.find((m: any) => m.id === modelId);
    return model ? model.variants : [];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Database Connection Error Notice */}
      {dbError && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-red-500/20 bg-red-500/5 space-y-4 max-w-3xl mx-auto my-6 text-slate-800 dark:text-slate-200">
          <div className="flex items-start gap-3">
            <span className="bg-red-500 text-white p-2.5 rounded-2xl shadow-lg shadow-red-500/10">
              <AlertTriangle size={20} />
            </span>
            <div className="space-y-1.5 flex-grow">
              <h3 className="text-lg font-black tracking-tight text-red-650 dark:text-red-400">Database Connection Pending</h3>
              <p className="text-xs font-semibold leading-relaxed text-slate-650 dark:text-slate-350">{dbError}</p>
            </div>
          </div>
          <div className="border-t border-red-500/10 pt-4 space-y-2 text-xs text-slate-650 dark:text-slate-400">
            <p className="font-extrabold uppercase text-[10px] text-red-500 tracking-wider">Quick Troubleshooting Steps:</p>
            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed font-semibold">
              <li>Go to your **Vercel Project Dashboard** ➔ **Settings** ➔ **Environment Variables**.</li>
              <li>Verify that you have added `DATABASE_URL` pointing to your hosted PostgreSQL database.</li>
              <li>Ensure you have run database table initializations from your local terminal:
                <code className="block bg-slate-200/50 dark:bg-slate-800/50 p-2.5 rounded-xl font-mono mt-1.5 select-all text-[11px] leading-normal">
                  npx prisma db push<br />
                  node prisma/seed.js
                </code>
              </li>
            </ol>
          </div>
        </div>
      )}

      {/* 1. Header / Hero section */}
      <section className="text-center space-y-3 max-w-3xl mx-auto py-4">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
          True Cost of Car Ownership <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-400 dark:to-purple-500">
            Compare Wisely in India
          </span>
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base font-medium max-w-2xl mx-auto leading-relaxed">
          Nearly every site compares specifications. We compare **financial intelligence**. Calculate depreciation, 
          state-wise registration, road taxes, service schedules, tyres, and resale value over 1–15 years.
        </p>
      </section>

      {/* 2. Car Selection Dropdowns */}
      <section className="glass-card p-6 md:p-8 rounded-3xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Car A */}
          <div className="space-y-4 border border-slate-200/5 p-5 rounded-2xl bg-slate-500/5">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-wider text-blue-500">Car A (Baseline)</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Manufacturer</label>
                <select
                  value={selA.brandId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const models = getModelsForBrand(bId);
                    const mId = models[0]?.id || "";
                    const variants = getVariantsForModel(bId, mId);
                    const vId = variants[0]?.id || "";
                    setSelA({ brandId: bId, modelId: mId, variantId: vId });
                  }}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select Brand</option>
                  {brandsData.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Model</label>
                <select
                  value={selA.modelId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    const variants = getVariantsForModel(selA.brandId, mId);
                    const vId = variants[0]?.id || "";
                    setSelA({ ...selA, modelId: mId, variantId: vId });
                  }}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                >
                  <option value="" disabled>Select Model</option>
                  {getModelsForBrand(selA.brandId).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Variant</label>
                <select
                  value={selA.variantId}
                  onChange={(e) => setSelA({ ...selA, variantId: e.target.value })}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                >
                  <option value="" disabled>Select Variant</option>
                  {getVariantsForModel(selA.brandId, selA.modelId).map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.fuelType} {v.transmission} - ₹{(v.exShowroomPrice / 100000).toFixed(1)}L)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Car B */}
          <div className="space-y-4 border border-slate-200/5 p-5 rounded-2xl bg-slate-500/5">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-xs uppercase tracking-wider text-orange-500">Car B</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Manufacturer</label>
                <select
                  value={selB.brandId}
                  onChange={(e) => {
                    const bId = e.target.value;
                    const models = getModelsForBrand(bId);
                    const mId = models[0]?.id || "";
                    const variants = getVariantsForModel(bId, mId);
                    const vId = variants[0]?.id || "";
                    setSelB({ brandId: bId, modelId: mId, variantId: vId });
                  }}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>Select Brand</option>
                  {brandsData.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Model</label>
                <select
                  value={selB.modelId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    const variants = getVariantsForModel(selB.brandId, mId);
                    const vId = variants[0]?.id || "";
                    setSelB({ ...selB, modelId: mId, variantId: vId });
                  }}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                >
                  <option value="" disabled>Select Model</option>
                  {getModelsForBrand(selB.brandId).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Variant</label>
                <select
                  value={selB.variantId}
                  onChange={(e) => setSelB({ ...selB, variantId: e.target.value })}
                  className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                >
                  <option value="" disabled>Select Variant</option>
                  {getVariantsForModel(selB.brandId, selB.modelId).map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.fuelType} {v.transmission} - ₹{(v.exShowroomPrice / 100000).toFixed(1)}L)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Car C Toggle / Block */}
          {!showCarC ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 min-h-[220px]">
              <button
                onClick={() => {
                  setShowCarC(true);
                  if (brandsData.length > 0) {
                    const brand = brandsData[2] || brandsData[0];
                    const model = brand.models[0];
                    const variant = model?.variants[0];
                    if (brand && model && variant) {
                      setSelC({ brandId: brand.id, modelId: model.id, variantId: variant.id });
                    }
                  }
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold transition shadow-sm text-sm"
              >
                <Plus size={16} /> Compare 3rd Car
              </button>
            </div>
          ) : (
            <div className="space-y-4 border border-slate-200/5 p-5 rounded-2xl bg-slate-500/5 relative">
              <button
                onClick={() => setShowCarC(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-200/40 text-slate-400 hover:text-red-500 transition"
              >
                <X size={16} />
              </button>
              <div className="flex justify-between items-center">
                <span className="font-extrabold text-xs uppercase tracking-wider text-emerald-500">Car C</span>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Manufacturer</label>
                  <select
                    value={selC.brandId}
                    onChange={(e) => {
                      const bId = e.target.value;
                      const models = getModelsForBrand(bId);
                      const mId = models[0]?.id || "";
                      const variants = getVariantsForModel(bId, mId);
                      const vId = variants[0]?.id || "";
                      setSelC({ brandId: bId, modelId: mId, variantId: vId });
                    }}
                    className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>Select Brand</option>
                    {brandsData.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Model</label>
                  <select
                    value={selC.modelId}
                    onChange={(e) => {
                      const mId = e.target.value;
                      const variants = getVariantsForModel(selC.brandId, mId);
                      const vId = variants[0]?.id || "";
                      setSelC({ ...selC, modelId: mId, variantId: vId });
                    }}
                    className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                  >
                    <option value="" disabled>Select Model</option>
                    {getModelsForBrand(selC.brandId).map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Variant</label>
                  <select
                    value={selC.variantId}
                    onChange={(e) => setSelC({ ...selC, variantId: e.target.value })}
                    className="w-full text-sm font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-3 border border-slate-200/10"
                  >
                    <option value="" disabled>Select Variant</option>
                    {getVariantsForModel(selC.brandId, selC.modelId).map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.fuelType} {v.transmission} - ₹{(v.exShowroomPrice / 100000).toFixed(1)}L)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. Main Dashboard Workspace (Side panel inputs + Results) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Input Sidebar Panel */}
        <section className="lg:col-span-1 space-y-6 input-sidebar no-print">
          <div className="glass-card p-6 rounded-3xl space-y-6">
            <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 border-b border-slate-200/10 pb-3">Parameters</h2>
            
            {/* Section A: Usage Profile */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Usage & State</h3>
              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Duration</span>
                  <span className="font-extrabold text-blue-500">{duration} Years</span>
                </label>
                <input
                  type="range" min="1" max="15" value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Annual Running</span>
                  <span className="font-extrabold text-blue-500">{annualRunning.toLocaleString()} KM</span>
                </label>
                <select
                  value={annualRunning}
                  onChange={(e) => setAnnualRunning(parseInt(e.target.value))}
                  className="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 border border-slate-200/10"
                >
                  <option value={5000}>5,000 KM</option>
                  <option value={10000}>10,000 KM</option>
                  <option value={15000}>15,000 KM</option>
                  <option value={20000}>20,000 KM</option>
                  <option value={25000}>25,000 KM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">State (Road Tax Rules)</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 p-2.5 border border-slate-200/10"
                >
                  {stateTaxes.map(s => <option key={s.id} value={s.state}>{s.state}</option>)}
                </select>
              </div>
            </div>

            {/* Section B: Finance Rules */}
            <div className="space-y-4 border-t border-slate-200/10 pt-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Financing</h3>
              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Down Payment %</span>
                  <span className="font-extrabold text-blue-500">{downPayPercent}%</span>
                </label>
                <input
                  type="range" min="0" max="90" step="5" value={downPayPercent}
                  onChange={(e) => setDownPayPercent(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Interest Rate</span>
                  <span className="font-extrabold text-blue-500">{interestRate}% P.A.</span>
                </label>
                <input
                  type="range" min="5" max="18" step="0.1" value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Loan Tenure</span>
                  <span className="font-extrabold text-blue-500">{loanTenure} Years</span>
                </label>
                <input
                  type="range" min="1" max="10" value={loanTenure}
                  onChange={(e) => setLoanTenure(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Section C: Inflation & Costs */}
            <div className="space-y-4 border-t border-slate-200/10 pt-4">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Inflation & Rates</h3>
              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Fuel Price (Petrol)</span>
                  <span className="font-extrabold">₹{fuelPetrol}/L</span>
                </label>
                <input
                  type="number" step="0.1" value={fuelPetrol}
                  onChange={(e) => setFuelPetrol(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 p-2 border border-slate-200/10"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Electricity Rate</span>
                  <span className="font-extrabold">₹{fuelElectricity}/kWh</span>
                </label>
                <input
                  type="number" step="0.1" value={fuelElectricity}
                  onChange={(e) => setFuelElectricity(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 p-2 border border-slate-200/10"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Fuel Inflation</span>
                  <span className="font-extrabold">{fuelInflation}%</span>
                </label>
                <input
                  type="range" min="0" max="15" value={fuelInflation}
                  onChange={(e) => setFuelInflation(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <label className="flex justify-between text-xs font-semibold mb-1">
                  <span>Service Inflation</span>
                  <span className="font-extrabold">{maintenanceInflation}%</span>
                </label>
                <input
                  type="range" min="0" max="15" value={maintenanceInflation}
                  onChange={(e) => setMaintenanceInflation(parseInt(e.target.value))}
                  className="w-full accent-blue-500 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right Dashboard Contents */}
        <section className="lg:col-span-3 space-y-10 print-container">
          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 glass-card rounded-3xl min-h-[350px]">
              <Car size={48} className="text-slate-400 mb-4 animate-bounce" />
              <h3 className="text-lg font-bold">No Car Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs text-center mt-1">Please select variants at the top of the page to compare cost results.</p>
            </div>
          ) : (
            <>
              {/* Actions Header Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 no-print border-b border-slate-200/10 pb-4">
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-bold text-slate-500">Live Recalculations Engaged</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={handleSaveAndShare}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition"
                  >
                    <Share2 size={14} /> Share Link
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold transition"
                  >
                    <Printer size={14} /> Print PDF
                  </button>
                  <button
                    onClick={exportCsv}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                </div>
              </div>

              {/* Share link popup */}
              {showSharePopup && (
                <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-blue-500/5 relative flex items-center justify-between gap-4 animate-fade-in no-print">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase text-blue-500 tracking-wider">Comparison Link Copied!</h4>
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Share this direct link with anyone to display the exact same comparison state:</p>
                    <code className="text-[10px] bg-slate-200 dark:bg-slate-800 p-1.5 rounded block max-w-md overflow-x-auto select-all">{shareUrl}</code>
                  </div>
                  <button
                    onClick={() => setShowSharePopup(false)}
                    className="p-1 rounded-lg hover:bg-slate-200/40 text-slate-400 hover:text-slate-800 transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              {/* Financial Highlight Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results.map((r, index) => {
                  const isLowestTco = highlights.lowestTcoId === r.id;
                  const isLowestRunning = highlights.lowestRunningId === r.id;
                  const isBestValue = highlights.bestValueId === r.id;

                  return (
                    <div key={r.id} className={`glass-card p-5 rounded-2xl flex flex-col justify-between border relative overflow-hidden ${
                      isLowestTco ? "border-blue-500/20 shadow-blue-500/5" : 
                      isBestValue ? "border-purple-500/20 shadow-purple-500/5" : "border-slate-200/5"
                    }`}>
                      {/* Badge ribbons */}
                      <div className="absolute top-0 right-0 flex flex-col gap-1 pr-4 pt-3 items-end">
                        {isLowestTco && (
                          <span className="flex items-center gap-1 bg-blue-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                            <TrendingUp size={10} /> Lowest Cost
                          </span>
                        )}
                        {isBestValue && (
                          <span className="flex items-center gap-1 bg-purple-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                            <Flame size={10} /> Best Value
                          </span>
                        )}
                        {isLowestRunning && (
                          <span className="flex items-center gap-1 bg-emerald-500 text-white font-black text-[9px] uppercase px-2 py-0.5 rounded-full shadow-sm">
                            <CheckCircle2 size={10} /> Low Running
                          </span>
                        )}
                      </div>

                      <div className="space-y-3">
                        <span className={`w-3.5 h-3.5 rounded-full inline-block`} style={{ backgroundColor: CAR_COLORS[index] }}></span>
                        <div>
                          <h4 className="font-extrabold text-base tracking-tight text-slate-800 dark:text-slate-100">{r.brand} {r.model}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{r.variant}</p>
                        </div>

                        <div className="space-y-1.5 border-t border-slate-200/5 pt-3">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Net Cost (After Resale)</p>
                          <p className="text-3xl font-black tracking-tight">
                            ₹{(r.tco.netOwnershipCost / 100000).toFixed(2)}L
                          </p>
                          <div className="flex justify-between text-xs font-semibold text-slate-500">
                            <span>Cost/KM: <strong>₹{r.tco.costPerKm}</strong></span>
                            <span>Cost/Day: <strong>₹{r.tco.costPerDay}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Advanced Comparison Cost Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((r, index) => (
                  <div key={r.id} className="glass-card p-6 rounded-3xl space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CAR_COLORS[index] }}></span>
                      {r.brand} {r.model} Specs
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-semibold border-b border-slate-200/5 pb-4">
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Ex-Showroom</span>
                        <span className="text-slate-800 dark:text-slate-200">₹{(r.tco.exShowroomPrice / 100000).toFixed(1)}L</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">On-Road Cost</span>
                        <span className="text-slate-800 dark:text-slate-200">₹{(r.tco.totalUpfrontCost / 100000).toFixed(1)}L</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Fuel / Battery</span>
                        <span className="text-slate-800 dark:text-slate-200">{variantA.fuelType}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500 font-bold uppercase mb-0.5">Real Mileage</span>
                        <span className="text-slate-800 dark:text-slate-200">{r.tco.yearlyBreakdown[0]?.fuelCost ? `${(annualRunning / (r.tco.yearlyBreakdown[0].fuelCost / fuelPetrol)).toFixed(1)} km/L` : "N/A"}</span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">TCO Component Totals</h4>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Total Fuel Cost:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{r.tco.totalFuelCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Total Maintenance:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{r.tco.totalMaintenanceCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Insurance Renewals:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{r.tco.totalInsuranceRenewals.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-semibold">Loan Interest:</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">₹{r.tco.totalInterestPaid.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200/5 pt-2">
                        <span className="text-slate-500 font-bold">Depreciation Loss:</span>
                        <span className="font-bold text-red-500">₹{(r.tco.exShowroomPrice - r.tco.resaleValue).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 font-bold">Est. Resale Value:</span>
                        <span className="font-bold text-emerald-500">₹{r.tco.resaleValue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Graphs */}
              <section className="space-y-6">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Financial Visualizations</h3>
                <ComparisonCharts cars={results} />
              </section>

              {/* Detailed Cost Table Grid */}
              <section className="space-y-4">
                <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100">Granular TCO Cost Table</h3>
                <div className="glass-card rounded-3xl overflow-x-auto shadow-md">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200/10 bg-slate-500/5 font-extrabold text-slate-600 dark:text-slate-400">
                        <th className="p-4 font-black">Line Item Component (INR)</th>
                        {results.map((r, idx) => (
                          <th key={r.id} className="p-4" style={{ color: CAR_COLORS[idx] }}>
                            {r.brand} {r.model} ({r.variant})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/5 font-medium text-slate-700 dark:text-slate-300">
                      <tr>
                        <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">Ex-Showroom Price</td>
                        {results.map(r => <td key={r.id} className="p-4 font-bold">₹{r.tco.exShowroomPrice.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Road Tax Charges ({state})</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.roadTax.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Registration & Plates</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.registration.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Initial Insurance (Year 1)</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.initialInsurance.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Accessories Cost</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.accessories.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Extended Warranty</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.extendedWarranty.toLocaleString()}</td>)}
                      </tr>
                      <tr className="bg-slate-500/5 font-extrabold text-slate-900 dark:text-slate-100">
                        <td className="p-4">On-Road Capital Price</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalUpfrontCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Loan Monthly EMI</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.monthlyEmi.toLocaleString()} / mo</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Total Interest Paid</td>
                        {results.map(r => <td key={r.id} className="p-4 text-red-500">₹{r.tco.totalInterestPaid.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Cumulative Fuel Expenses</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalFuelCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Cumulative Periodic Services</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalServiceCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Tyres & Brake Pads Replacement</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{(r.tco.totalTyresCost + r.tco.totalBrakePadsCost).toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">EV Battery / ICE Battery renewals</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalBatteryReplacementCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Engine Oil changes</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalEngineOilCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Unexpected repairs & spares</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalUnexpectedRepairsCost.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Insurance Renewals (Years 2-{duration})</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalInsuranceRenewals.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Other (FASTag, PUC, Cleaning)</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalOtherCosts.toLocaleString()}</td>)}
                      </tr>
                      <tr className="bg-slate-500/5 font-extrabold text-slate-900 dark:text-slate-100">
                        <td className="p-4">Gross Expenses Paid (Total TCO)</td>
                        {results.map(r => <td key={r.id} className="p-4">₹{r.tco.totalCostWithoutResale.toLocaleString()}</td>)}
                      </tr>
                      <tr className="text-emerald-500">
                        <td className="p-4 font-bold">Estimated Resale Value</td>
                        {results.map(r => <td key={r.id} className="p-4 font-bold">₹{r.tco.resaleValue.toLocaleString()}</td>)}
                      </tr>
                      <tr>
                        <td className="p-4 text-slate-500">Outstanding Loan Balance</td>
                        {results.map(r => <td key={r.id} className="p-4 text-red-500">₹{r.tco.outstandingLoanBalance.toLocaleString()}</td>)}
                      </tr>
                      <tr className="bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5 font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                        <td className="p-4 font-black">Net Ownership Cost (TCO - Resale)</td>
                        {results.map(r => <td key={r.id} className="p-4 text-blue-600 dark:text-blue-400 font-extrabold">₹{r.tco.netOwnershipCost.toLocaleString()}</td>)}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* Financial Tip/Recommendation Section */}
              <section className="glass-card p-6 rounded-3xl border border-blue-500/10 bg-blue-500/5 flex gap-4 items-start no-print">
                <span className="bg-blue-500 text-white p-2.5 rounded-2xl shadow-md shadow-blue-500/10">
                  <Lightbulb size={20} />
                </span>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">Financial Insight Tip</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">
                    EVs usually have higher upfront costs, but notice how the running fuel expense gap widens over 7 to 10 years, 
                    overcoming the EV battery depreciation factor. Hybrid cars offer a sweet spot, retaining high resale value while 
                    reducing fuel costs by 30-40% compared to standard petrol models.
                  </p>
                </div>
              </section>
            </>
          )}
        </section>

      </div>

    </div>
  );
}
