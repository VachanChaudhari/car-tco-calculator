// src/components/ComparisonCharts.tsx
"use client";

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { TcoResult } from "@/lib/tcoCalculator";

interface ComparisonChartsProps {
  cars: {
    id: string;
    brand: string;
    model: string;
    variant: string;
    tco: TcoResult;
  }[];
}

const CAR_COLORS = ["#3b82f6", "#f97316", "#10b981"]; // Blue, Orange, Emerald
const PIE_COLORS = ["#ef4444", "#eab308", "#3b82f6", "#a855f7", "#64748b"]; // Red, Yellow, Blue, Purple, Slate

export default function ComparisonCharts({ cars }: ComparisonChartsProps) {
  if (cars.length === 0) return null;

  // 1. Prepare Timeline Data (Cumulative Cost)
  const duration = cars[0]?.tco.yearlyBreakdown.length || 5;
  const timelineData = Array.from({ length: duration }, (_, i) => {
    const year = i + 1;
    const dataPoint: any = { name: `Year ${year}` };
    cars.forEach((car, index) => {
      const breakdown = car.tco.yearlyBreakdown[i];
      if (breakdown) {
        dataPoint[`car_${index}`] = Math.round(breakdown.cumulativeCost / 100000); // in Lakhs
      }
    });
    return dataPoint;
  });

  // 2. Prepare Resale Depreciation Data
  const depreciationData = Array.from({ length: duration }, (_, i) => {
    const year = i + 1;
    const dataPoint: any = { name: `Year ${year}` };
    cars.forEach((car, index) => {
      const breakdown = car.tco.yearlyBreakdown[i];
      if (breakdown) {
        dataPoint[`car_${index}`] = Math.round(breakdown.resaleValue / 100000); // in Lakhs
      }
    });
    return dataPoint;
  });

  // 3. Prepare Cost Component Breakdown Data
  const breakdownData = cars.map((car, index) => {
    const tco = car.tco;
    // We display components relative to the total cost without resale
    const totalFinance = tco.totalInterestPaid + (tco.totalUpfrontCost - tco.loanAmount);
    return {
      name: `${car.brand} ${car.model}`,
      "Depreciation (Loss)": Math.round((tco.exShowroomPrice - tco.resaleValue) / 100000),
      "Fuel Cost": Math.round(tco.totalFuelCost / 100000),
      "Service & Maintenance": Math.round(tco.totalMaintenanceCost / 100000),
      "Insurance Renewals": Math.round(tco.totalInsuranceRenewals / 100000),
      "Interest & Financing": Math.round(tco.totalInterestPaid / 100000),
    };
  });

  // Custom tooltips for premium feel
  const LakhTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3.5 rounded-xl border border-slate-200/10 text-xs shadow-md space-y-1.5">
          <p className="font-bold text-slate-800 dark:text-slate-100">{label}</p>
          {payload.map((p: any, idx: number) => {
            const carIdx = parseInt(p.dataKey.split("_")[1]);
            const car = cars[carIdx];
            return (
              <p key={idx} className="font-medium" style={{ color: p.color || CAR_COLORS[carIdx] }}>
                {car ? `${car.brand} ${car.model}` : "Car"}: ₹{p.value} Lakhs
              </p>
            );
          })}
        </div>
      );
    };
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Chart 1: Cost Timeline */}
      <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[380px]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Cumulative Cost Timeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total running expense + finance payments over years (in Lakhs)</p>
        </div>
        <div className="flex-grow w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" fontSize={11} />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" fontSize={11} unit="L" />
              <Tooltip content={<LakhTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {cars.map((car, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`car_${index}`}
                  name={`${car.brand} ${car.model} (${car.variant})`}
                  stroke={CAR_COLORS[index]}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 7 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Depreciation Curves */}
      <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[380px]">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Resale Value Decline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Projected vehicle valuation after depreciation (in Lakhs)</p>
        </div>
        <div className="flex-grow w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={depreciationData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" fontSize={11} />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" fontSize={11} unit="L" />
              <Tooltip content={<LakhTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              {cars.map((car, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={`car_${index}`}
                  name={`${car.brand} ${car.model}`}
                  stroke={CAR_COLORS[index]}
                  strokeWidth={3}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Cost Component Breakdown */}
      <div className="glass-card p-6 rounded-3xl flex flex-col min-h-[380px] lg:col-span-2">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">TCO Component Distribution</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Detailed breakdown of key ownership cost factors (in Lakhs)</p>
        </div>
        <div className="flex-grow w-full h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={breakdownData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.08)" />
              <XAxis dataKey="name" stroke="rgba(148, 163, 184, 0.5)" fontSize={11} />
              <YAxis stroke="rgba(148, 163, 184, 0.5)" fontSize={11} unit="L" />
              <Tooltip cursor={{ fill: "rgba(148, 163, 184, 0.05)" }} contentStyle={{ background: "var(--card-bg)", borderColor: "rgba(148, 163, 184, 0.15)", borderRadius: "12px", color: "var(--foreground)" }} />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="Depreciation (Loss)" stackId="a" fill={PIE_COLORS[0]} radius={[0, 0, 0, 0]} />
              <Bar dataKey="Fuel Cost" stackId="a" fill={PIE_COLORS[1]} />
              <Bar dataKey="Service & Maintenance" stackId="a" fill={PIE_COLORS[2]} />
              <Bar dataKey="Insurance Renewals" stackId="a" fill={PIE_COLORS[3]} />
              <Bar dataKey="Interest & Financing" stackId="a" fill={PIE_COLORS[4]} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
