// src/app/admin/dashboard/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Save, LogOut, CheckCircle, Database, Settings2, Sliders, DollarSign, Fuel, ShieldAlert, X } from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // Dashboard navigation tab
  const [activeTab, setActiveTab] = useState("cars"); // cars, fuel, taxes, curves
  
  // Data lists
  const [variants, setVariants] = useState<any[]>([]);
  const [fuelPrices, setFuelPrices] = useState<any[]>([]);
  const [stateTaxes, setStateTaxes] = useState<any[]>([]);
  const [depCurves, setDepCurves] = useState<any[]>([]);
  const [serviceCosts, setServiceCosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", isError: false });

  // Add / Edit Car Form modal state
  const [showCarModal, setShowCarModal] = useState(false);
  const [editingCarId, setEditingCarId] = useState<string | null>(null);
  
  // New/Edit Car State fields
  const [carForm, setCarForm] = useState({
    brandName: "", modelName: "", bodyType: "SUV", segment: "Mid", safetyRating: "5.0",
    variantName: "", exShowroomPrice: "", fuelType: "Petrol", transmission: "Manual",
    mileageArai: "", realWorldMileage: "", engineCc: "", powerBhp: "", torqueNm: "",
    fuelTankCapacity: "", batteryCapacity: "", claimedRange: "", realRange: "",
    annualServiceCost: "5000", resalePercent: "0", registrationCharges: "25000",
    roadTax: "80000", insurancePremium: "35000", fastagCategory: "Class 4",
    tyreSize: "185/65 R15", tyreReplacementCost: "16000", batteryReplacementCost: "5000",
    brakePadsCost: "2500", engineOilCost: "2000", serviceIntervalMonths: "12", serviceIntervalKm: "10000"
  });

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // Load cars
      const carsRes = await fetch("/api/cars");
      if (carsRes.status === 401) {
        router.push("/admin/login");
        return;
      }
      const carsData = await carsRes.json();
      setVariants(carsData);

      // Load settings
      const settingsRes = await fetch("/api/settings");
      const settingsData = await settingsRes.json();
      setFuelPrices(settingsData.fuel || []);
      setStateTaxes(settingsData.taxes || []);
      setDepCurves(settingsData.depreciation || []);
      setServiceCosts(settingsData.service || []);

    } catch (err) {
      console.error("Error loading admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleLogout = async () => {
    // Clear cookies by calling an empty auth request or client redirection
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    router.push("/admin/login");
  };

  const showToast = (text: string, isError = false) => {
    setMessage({ text, isError });
    setTimeout(() => setMessage({ text: "", isError: false }), 4000);
  };

  // CRUD handlers: Cars
  const handleCarSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCarId ? `/api/cars/${editingCarId}` : "/api/cars";
      const method = editingCarId ? "PUT" : "POST";
      
      // If editing, map keys correctly for PUT variant updating
      const payload = editingCarId 
        ? {
            name: carForm.variantName,
            exShowroomPrice: carForm.exShowroomPrice,
            fuelType: carForm.fuelType,
            transmission: carForm.transmission,
            mileageArai: carForm.mileageArai,
            realWorldMileage: carForm.realWorldMileage,
            engineCc: carForm.engineCc,
            powerBhp: carForm.powerBhp,
            torqueNm: carForm.torqueNm,
            fuelTankCapacity: carForm.fuelTankCapacity,
            batteryCapacity: carForm.batteryCapacity,
            claimedRange: carForm.claimedRange,
            realRange: carForm.realRange,
            annualServiceCost: carForm.annualServiceCost,
            resalePercent: carForm.resalePercent,
            registrationCharges: carForm.registrationCharges,
            roadTax: carForm.roadTax,
            insurancePremium: carForm.insurancePremium,
            fastagCategory: carForm.fastagCategory,
            tyreSize: carForm.tyreSize,
            tyreReplacementCost: carForm.tyreReplacementCost,
            batteryReplacementCost: carForm.batteryReplacementCost,
            brakePadsCost: carForm.brakePadsCost,
            engineOilCost: carForm.engineOilCost,
            serviceIntervalMonths: carForm.serviceIntervalMonths,
            serviceIntervalKm: carForm.serviceIntervalKm
          }
        : carForm;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast(editingCarId ? "Vehicle updated successfully" : "Vehicle created successfully");
        setShowCarModal(false);
        setEditingCarId(null);
        loadAllData();
      } else {
        const err = await res.json();
        showToast(err.error || "Save operation failed", true);
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred during save", true);
    }
  };

  const handleEditCarClick = (v: any) => {
    setEditingCarId(v.id);
    setCarForm({
      brandName: v.model.brand.name,
      modelName: v.model.name,
      bodyType: v.model.bodyType,
      segment: v.model.segment,
      safetyRating: String(v.model.safetyRating || "5.0"),
      variantName: v.name,
      exShowroomPrice: String(v.exShowroomPrice),
      fuelType: v.fuelType,
      transmission: v.transmission,
      mileageArai: String(v.mileageArai),
      realWorldMileage: String(v.realWorldMileage),
      engineCc: String(v.engineCc || ""),
      powerBhp: String(v.powerBhp || ""),
      torqueNm: String(v.torqueNm || ""),
      fuelTankCapacity: String(v.fuelTankCapacity || ""),
      batteryCapacity: String(v.batteryCapacity || ""),
      claimedRange: String(v.claimedRange || ""),
      realRange: String(v.realRange || ""),
      annualServiceCost: String(v.annualServiceCost),
      resalePercent: String(v.resalePercent),
      registrationCharges: String(v.registrationCharges),
      roadTax: String(v.roadTax),
      insurancePremium: String(v.insurancePremium),
      fastagCategory: v.fastagCategory,
      tyreSize: v.tyreSize,
      tyreReplacementCost: String(v.tyreReplacementCost),
      batteryReplacementCost: String(v.batteryReplacementCost),
      brakePadsCost: String(v.brakePadsCost),
      engineOilCost: String(v.engineOilCost),
      serviceIntervalMonths: String(v.serviceIntervalMonths),
      serviceIntervalKm: String(v.serviceIntervalKm)
    });
    setShowCarModal(true);
  };

  const handleDeleteCar = async (id: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;
    try {
      const res = await fetch(`/api/cars/${id}`, { method: "DELETE" });
      if (res.ok) {
        showToast("Variant deleted successfully");
        loadAllData();
      } else {
        showToast("Deletion failed", true);
      }
    } catch (err) {
      console.error(err);
      showToast("Deletion failed", true);
    }
  };

  // Update Settings: Fuel Prices
  const handleUpdateFuel = async (fuel: any) => {
    try {
      const res = await fetch("/api/settings?type=fuel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fuel),
      });
      if (res.ok) {
        showToast(`Fuel prices for ${fuel.state} updated!`);
      } else {
        showToast("Failed to update fuel prices", true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings: State Taxes
  const handleUpdateTaxes = async (tax: any) => {
    try {
      const res = await fetch("/api/settings?type=taxes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tax),
      });
      if (res.ok) {
        showToast(`Tax structure for ${tax.state} updated!`);
      } else {
        showToast("Failed to update taxes", true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Update Settings: Depreciation curves
  const handleUpdateCurve = async (curve: any) => {
    try {
      const res = await fetch("/api/settings?type=depreciation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(curve),
      });
      if (res.ok) {
        showToast(`Depreciation curve for ${curve.segment} updated!`);
      } else {
        showToast("Failed to update depreciation curve", true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Alert Banner */}
      {message.text && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-2 border text-xs font-semibold ${
          message.isError 
            ? "bg-red-500/10 border-red-500/10 text-red-600 dark:text-red-400" 
            : "bg-emerald-500/10 border-emerald-500/10 text-emerald-600 dark:text-emerald-450"
        }`}>
          <CheckCircle size={16} /> <span>{message.text}</span>
        </div>
      )}

      {/* Header Info */}
      <section className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200/10 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-850 dark:text-slate-100 flex items-center gap-2.5">
            <Database size={24} className="text-blue-500" /> Database Administration
          </h1>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage vehicles, segment specifications, tax structures, and live fuel prices.</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-450 text-xs font-bold transition cursor-pointer"
        >
          <LogOut size={14} /> End Session
        </button>
      </section>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200/10 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab("cars")}
          className={`pb-3 border-b-2 transition ${activeTab === "cars" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500"}`}
        >
          Vehicles Inventory
        </button>
        <button
          onClick={() => setActiveTab("fuel")}
          className={`pb-3 border-b-2 transition ${activeTab === "fuel" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500"}`}
        >
          Fuel Pricing
        </button>
        <button
          onClick={() => setActiveTab("taxes")}
          className={`pb-3 border-b-2 transition ${activeTab === "taxes" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500"}`}
        >
          Road Taxes & States
        </button>
        <button
          onClick={() => setActiveTab("curves")}
          className={`pb-3 border-b-2 transition ${activeTab === "curves" ? "border-blue-500 text-blue-500" : "border-transparent text-slate-500"}`}
        >
          Depreciation Curves
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-500">Retrieving configuration tables...</div>
      ) : (
        <>
          {/* Tab 1: Cars Inventory */}
          {activeTab === "cars" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold uppercase text-slate-500">{variants.length} Variants Available</span>
                <button
                  onClick={() => {
                    setEditingCarId(null);
                    setCarForm({
                      brandName: "", modelName: "", bodyType: "SUV", segment: "Mid", safetyRating: "5.0",
                      variantName: "", exShowroomPrice: "", fuelType: "Petrol", transmission: "Manual",
                      mileageArai: "", realWorldMileage: "", engineCc: "", powerBhp: "", torqueNm: "",
                      fuelTankCapacity: "", batteryCapacity: "", claimedRange: "", realRange: "",
                      annualServiceCost: "5000", resalePercent: "0", registrationCharges: "25000",
                      roadTax: "80000", insurancePremium: "35000", fastagCategory: "Class 4",
                      tyreSize: "185/65 R15", tyreReplacementCost: "16000", batteryReplacementCost: "5000",
                      brakePadsCost: "2500", engineOilCost: "2000", serviceIntervalMonths: "12", serviceIntervalKm: "10000"
                    });
                    setShowCarModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold transition cursor-pointer"
                >
                  <Plus size={14} /> Add New Variant
                </button>
              </div>

              {/* Cars Grid Table */}
              <div className="glass-card rounded-3xl overflow-hidden shadow-sm border border-slate-200/5">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/10 bg-slate-500/5 font-extrabold text-slate-650">
                      <th className="p-4">Brand & Model</th>
                      <th className="p-4">Variant</th>
                      <th className="p-4">Ex-Showroom</th>
                      <th className="p-4">Specs</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/5 font-medium text-slate-700 dark:text-slate-350">
                    {variants.map(v => (
                      <tr key={v.id} className="hover:bg-slate-500/5">
                        <td className="p-4">
                          <span className="font-extrabold text-slate-900 dark:text-slate-100 block">{v.model.brand.name} {v.model.name}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{v.model.bodyType} • {v.model.segment}</span>
                        </td>
                        <td className="p-4">{v.name}</td>
                        <td className="p-4 font-bold text-slate-900 dark:text-slate-100">₹{(v.exShowroomPrice / 100000).toFixed(2)}L</td>
                        <td className="p-4 space-y-0.5">
                          <div>{v.fuelType} ({v.transmission})</div>
                          <div className="text-[10px] text-slate-400">ARAI: {v.mileageArai} | Real: {v.realWorldMileage}</div>
                        </td>
                        <td className="p-4">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => handleEditCarClick(v)}
                              className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition cursor-pointer"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCar(v.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition cursor-pointer"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Fuel Pricing */}
          {activeTab === "fuel" && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Fuel size={18} /> State Fuel Rates</h3>
                <p className="text-xs text-slate-500">Live prices are re-saved instantly. Values populate default fuel rates in calculator.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {fuelPrices.map((fp, idx) => (
                    <div key={fp.id} className="p-4 border border-slate-200/10 rounded-2xl bg-slate-500/5 space-y-4">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 block">{fp.state}</span>
                      <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] mb-1">Petrol</label>
                          <input
                            type="number" step="0.01" value={fp.petrol}
                            onChange={(e) => {
                              const updated = [...fuelPrices];
                              updated[idx].petrol = parseFloat(e.target.value) || 0;
                              setFuelPrices(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Diesel</label>
                          <input
                            type="number" step="0.01" value={fp.diesel}
                            onChange={(e) => {
                              const updated = [...fuelPrices];
                              updated[idx].diesel = parseFloat(e.target.value) || 0;
                              setFuelPrices(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">CNG</label>
                          <input
                            type="number" step="0.01" value={fp.cng}
                            onChange={(e) => {
                              const updated = [...fuelPrices];
                              updated[idx].cng = parseFloat(e.target.value) || 0;
                              setFuelPrices(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Electricity</label>
                          <input
                            type="number" step="0.01" value={fp.electricity}
                            onChange={(e) => {
                              const updated = [...fuelPrices];
                              updated[idx].electricity = parseFloat(e.target.value) || 0;
                              setFuelPrices(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateFuel(fp)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Save size={12} /> Save Rates
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Road Taxes & States */}
          {activeTab === "taxes" && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign size={18} /> State Taxation structures</h3>
                <p className="text-xs text-slate-500">Edit percentage values for road tax relative to Fuel type, and flat registration fees.</p>
                <div className="space-y-4">
                  {stateTaxes.map((st, idx) => (
                    <div key={st.id} className="p-4 border border-slate-200/10 rounded-2xl bg-slate-500/5 grid grid-cols-1 md:grid-cols-6 gap-4 items-center">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{st.state}</span>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs font-semibold md:col-span-4">
                        <div>
                          <label className="block text-[10px] mb-1">Petrol %</label>
                          <input
                            type="number" value={st.roadTaxPetrolPercent}
                            onChange={(e) => {
                              const updated = [...stateTaxes];
                              updated[idx].roadTaxPetrolPercent = parseFloat(e.target.value) || 0;
                              setStateTaxes(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Diesel %</label>
                          <input
                            type="number" value={st.roadTaxDieselPercent}
                            onChange={(e) => {
                              const updated = [...stateTaxes];
                              updated[idx].roadTaxDieselPercent = parseFloat(e.target.value) || 0;
                              setStateTaxes(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">EV %</label>
                          <input
                            type="number" value={st.roadTaxEvPercent}
                            onChange={(e) => {
                              const updated = [...stateTaxes];
                              updated[idx].roadTaxEvPercent = parseFloat(e.target.value) || 0;
                              setStateTaxes(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">CNG %</label>
                          <input
                            type="number" value={st.roadTaxCngPercent}
                            onChange={(e) => {
                              const updated = [...stateTaxes];
                              updated[idx].roadTaxCngPercent = parseFloat(e.target.value) || 0;
                              setStateTaxes(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Flat Reg Fee</label>
                          <input
                            type="number" value={st.registrationFeeFlat}
                            onChange={(e) => {
                              const updated = [...stateTaxes];
                              updated[idx].registrationFeeFlat = parseFloat(e.target.value) || 0;
                              setStateTaxes(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateTaxes(st)}
                        className="flex items-center justify-center gap-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer md:w-auto w-full"
                      >
                        <Save size={12} /> Save
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Depreciation Curves */}
          {activeTab === "curves" && (
            <div className="space-y-6">
              <div className="glass-card p-6 rounded-3xl space-y-4">
                <h3 className="text-lg font-bold flex items-center gap-2"><Sliders size={18} /> Depreciation curve % retained value</h3>
                <p className="text-xs text-slate-500">Edit percent value retained for years 1, 3, 5, 7, 10, and 15 by segment.</p>
                <div className="space-y-4">
                  {depCurves.map((curve, idx) => (
                    <div key={curve.id} className="p-4 border border-slate-200/10 rounded-2xl bg-slate-500/5 space-y-4">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{curve.segment} Segment Curve</span>
                      <div className="grid grid-cols-6 gap-2 text-xs font-semibold">
                        <div>
                          <label className="block text-[10px] mb-1">Year 1 %</label>
                          <input
                            type="number" value={curve.year1}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year1 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Year 3 %</label>
                          <input
                            type="number" value={curve.year3}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year3 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Year 5 %</label>
                          <input
                            type="number" value={curve.year5}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year5 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Year 7 %</label>
                          <input
                            type="number" value={curve.year7}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year7 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Year 10 %</label>
                          <input
                            type="number" value={curve.year10}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year10 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] mb-1">Year 15 %</label>
                          <input
                            type="number" value={curve.year15}
                            onChange={(e) => {
                              const updated = [...depCurves];
                              updated[idx].year15 = parseFloat(e.target.value) || 0;
                              setDepCurves(updated);
                            }}
                            className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => handleUpdateCurve(curve)}
                        className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer"
                      >
                        <Save size={12} /> Save Curve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CRUD Modal: Add/Edit Car */}
          {showCarModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="glass-card p-6 md:p-8 rounded-3xl max-w-3xl w-full max-h-[85vh] overflow-y-auto space-y-6 relative border border-slate-200/10">
                <button
                  onClick={() => setShowCarModal(false)}
                  className="absolute top-6 right-6 p-1.5 rounded-lg hover:bg-slate-200/40 text-slate-400 hover:text-slate-800 transition"
                >
                  <X size={18} />
                </button>

                <div>
                  <h3 className="text-xl font-bold">{editingCarId ? "Edit Vehicle Variant" : "Add New Vehicle Variant"}</h3>
                  <p className="text-xs text-slate-500">Provide pricing, specs, segments, and standard service costs.</p>
                </div>

                <form onSubmit={handleCarSubmit} className="space-y-6 text-xs font-semibold">
                  
                  {/* Basic Specifications */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Classification & Identification</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block mb-1">Brand/Manufacturer</label>
                        <input
                          type="text" required placeholder="Maruti Suzuki" value={carForm.brandName}
                          disabled={!!editingCarId}
                          onChange={(e) => setCarForm({ ...carForm, brandName: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Model Name</label>
                        <input
                          type="text" required placeholder="Swift" value={carForm.modelName}
                          disabled={!!editingCarId}
                          onChange={(e) => setCarForm({ ...carForm, modelName: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Variant Name</label>
                        <input
                          type="text" required placeholder="ZXI+ AMT" value={carForm.variantName}
                          onChange={(e) => setCarForm({ ...carForm, variantName: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Segment classification</label>
                        <select
                          value={carForm.segment}
                          onChange={(e) => setCarForm({ ...carForm, segment: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        >
                          <option value="Entry">Entry (Hatchbacks)</option>
                          <option value="Mid">Mid (Sedans/SUVs)</option>
                          <option value="Premium">Premium (MUVs/Premium SUVs)</option>
                          <option value="Luxury">Luxury (Sedans/Luxury SUVs)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Body Type</label>
                        <select
                          value={carForm.bodyType}
                          onChange={(e) => setCarForm({ ...carForm, bodyType: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        >
                          <option value="Hatchback">Hatchback</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="MUV">MUV</option>
                          <option value="Luxury">Luxury</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Safety Rating NCAP (Stars)</label>
                        <input
                          type="number" step="0.1" min="0" max="5" value={carForm.safetyRating}
                          onChange={(e) => setCarForm({ ...carForm, safetyRating: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Fuel specifications */}
                  <div className="space-y-4 border-t border-slate-200/10 pt-4">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Pricing & Propulsion specs</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block mb-1">Ex-Showroom (INR)</label>
                        <input
                          type="number" required placeholder="899000" value={carForm.exShowroomPrice}
                          onChange={(e) => setCarForm({ ...carForm, exShowroomPrice: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Fuel Type</label>
                        <select
                          value={carForm.fuelType}
                          onChange={(e) => setCarForm({ ...carForm, fuelType: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="CNG">CNG</option>
                          <option value="EV">EV (Electric)</option>
                          <option value="Hybrid">Strong Hybrid</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">Transmission</label>
                        <select
                          value={carForm.transmission}
                          onChange={(e) => setCarForm({ ...carForm, transmission: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        >
                          <option value="Manual">Manual</option>
                          <option value="Automatic">Automatic</option>
                        </select>
                      </div>
                      <div>
                        <label className="block mb-1">ARAI Claimed Mileage</label>
                        <input
                          type="number" step="0.01" placeholder="25.75" value={carForm.mileageArai}
                          onChange={(e) => setCarForm({ ...carForm, mileageArai: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Real-world Mileage</label>
                        <input
                          type="number" step="0.01" placeholder="19.0" value={carForm.realWorldMileage}
                          onChange={(e) => setCarForm({ ...carForm, realWorldMileage: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Engine Size (cc)</label>
                        <input
                          type="number" placeholder="1197" value={carForm.engineCc}
                          onChange={(e) => setCarForm({ ...carForm, engineCc: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Power Output (bhp)</label>
                        <input
                          type="number" step="0.1" placeholder="81.5" value={carForm.powerBhp}
                          onChange={(e) => setCarForm({ ...carForm, powerBhp: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Torque output (Nm)</label>
                        <input
                          type="number" step="0.1" placeholder="113.0" value={carForm.torqueNm}
                          onChange={(e) => setCarForm({ ...carForm, torqueNm: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* EV specs only */}
                  {(carForm.fuelType === "EV" || carForm.fuelType === "Electric") && (
                    <div className="space-y-4 border-t border-slate-200/10 pt-4">
                      <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-wider">EV Battery & Range Specifications</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block mb-1">Battery Capacity (kWh)</label>
                          <input
                            type="number" step="0.1" placeholder="40.5" value={carForm.batteryCapacity}
                            onChange={(e) => setCarForm({ ...carForm, batteryCapacity: e.target.value })}
                            className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">Claimed Range (km)</label>
                          <input
                            type="number" placeholder="465" value={carForm.claimedRange}
                            onChange={(e) => setCarForm({ ...carForm, claimedRange: e.target.value })}
                            className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block mb-1">Real-world Range (km)</label>
                          <input
                            type="number" placeholder="300" value={carForm.realRange}
                            onChange={(e) => setCarForm({ ...carForm, realRange: e.target.value })}
                            className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upkeep and Part replacements */}
                  <div className="space-y-4 border-t border-slate-200/10 pt-4">
                    <h4 className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Service & Part Replacements</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block mb-1">Baseline Annual Service</label>
                        <input
                          type="number" value={carForm.annualServiceCost}
                          onChange={(e) => setCarForm({ ...carForm, annualServiceCost: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Tyre Set Replacement Cost</label>
                        <input
                          type="number" value={carForm.tyreReplacementCost}
                          onChange={(e) => setCarForm({ ...carForm, tyreReplacementCost: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Brake Pads renewal cost</label>
                        <input
                          type="number" value={carForm.brakePadsCost}
                          onChange={(e) => setCarForm({ ...carForm, brakePadsCost: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block mb-1">Engine Oil renewal cost</label>
                        <input
                          type="number" value={carForm.engineOilCost}
                          onChange={(e) => setCarForm({ ...carForm, engineOilCost: e.target.value })}
                          className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/10 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submission actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200/10">
                    <button
                      type="button"
                      onClick={() => setShowCarModal(false)}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition shadow-md shadow-blue-500/10 cursor-pointer"
                    >
                      Save Variant
                    </button>
                  </div>

                </form>
              </div>
            </div>
          )}
        </>
      )}

    </div>
  );
}
