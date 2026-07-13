// src/lib/tcoCalculator.ts

export interface TcoInput {
  ownershipDuration: number; // 1 - 15 years
  annualRunning: number;     // KM per year
  downPayment: number;       // INR
  loanInterestRate: number;  // % per annum
  loanTenure: number;        // Years
  state: string;             // e.g. "Delhi", "Maharashtra"
  fuelPricesOverride?: {
    petrol?: number;
    diesel?: number;
    cng?: number;
    electricity?: number;
  };
  insuranceInflation: number;   // % annual
  fuelInflation: number;        // % annual
  maintenanceInflation: number;  // % annual
  resaleDepreciationOverride?: number; // % annual resale depreciation if custom
  accessoriesCost: number;       // INR
  extendedWarrantyCost: number;  // INR
}

export interface YearCostBreakdown {
  year: number;
  fuelCost: number;
  serviceCost: number;
  tyreCost: number;
  brakePadsCost: number;
  engineOilCost: number;
  batteryCost: number;
  unexpectedRepairs: number;
  insurancePremium: number;
  otherCosts: number; // FASTag, PUC, Cleaning
  emiPaid: number;
  interestPaid: number;
  depreciation: number;
  resaleValue: number;
  outstandingLoan: number;
  cumulativeCost: number;
}

export interface TcoResult {
  // Upfront Costs
  exShowroomPrice: number;
  roadTax: number;
  registration: number;
  initialInsurance: number;
  accessories: number;
  extendedWarranty: number;
  totalUpfrontCost: number; // On-road price

  // Finance Details
  loanAmount: number;
  monthlyEmi: number;
  totalInterestPaid: number;
  totalLoanCost: number;

  // Running & Maintenance Costs (Cumulative)
  totalFuelCost: number;
  totalMaintenanceCost: number; // Sum of services, tyres, brake pads, engine oil, battery, unexpected
  totalServiceCost: number;
  totalTyresCost: number;
  totalBrakePadsCost: number;
  totalEngineOilCost: number;
  totalBatteryReplacementCost: number;
  totalUnexpectedRepairsCost: number;
  totalInsuranceRenewals: number;
  totalOtherCosts: number; // FASTag, PUC, Cleaning

  // Resale & Net Metrics
  resaleValue: number;
  outstandingLoanBalance: number;
  netResaleValue: number; // Resale Value - Outstanding Loan Balance
  totalCostWithoutResale: number;
  netOwnershipCost: number; // Total Cost - Resale Value

  // Unit Metrics
  costPerYear: number;
  costPerMonth: number;
  costPerDay: number;
  costPerKm: number;

  // Timeline
  yearlyBreakdown: YearCostBreakdown[];
}

export function calculateTCO(
  variant: any,
  stateTax: any,
  fuelPrices: any,
  serviceCurve: any,
  depreciationCurve: any,
  input: TcoInput
): TcoResult {
  const {
    ownershipDuration,
    annualRunning,
    downPayment,
    loanInterestRate,
    loanTenure,
    state,
    insuranceInflation = 5,
    fuelInflation = 6,
    maintenanceInflation = 5,
    accessoriesCost = 15000,
    extendedWarrantyCost = 10000,
  } = input;

  // 1. Resolve State Taxes
  let roadTaxPercent = 10;
  let regFee = 600;
  if (stateTax) {
    regFee = stateTax.registrationFeeFlat;
    const fType = variant.fuelType.toLowerCase();
    if (fType.includes("petrol")) {
      roadTaxPercent = stateTax.roadTaxPetrolPercent;
    } else if (fType.includes("diesel")) {
      roadTaxPercent = stateTax.roadTaxDieselPercent;
    } else if (fType.includes("ev") || fType.includes("electric")) {
      roadTaxPercent = stateTax.roadTaxEvPercent;
    } else if (fType.includes("cng")) {
      roadTaxPercent = stateTax.roadTaxCngPercent;
    } else if (fType.includes("hybrid")) {
      // Hybrids are often taxed similar to petrol, or slightly subsidized. Let's use petrol - 1%
      roadTaxPercent = Math.max(2, stateTax.roadTaxPetrolPercent - 1);
    }
  }

  const exShowroomPrice = variant.exShowroomPrice;
  const roadTax = exShowroomPrice * (roadTaxPercent / 100);
  const registration = regFee;
  const initialInsurance = variant.insurancePremium || (exShowroomPrice * 0.045); // default 4.5% if not provided

  const totalUpfrontCost = exShowroomPrice + roadTax + registration + initialInsurance + accessoriesCost + extendedWarrantyCost;

  // 2. Finance Calculation
  const loanAmount = Math.max(0, totalUpfrontCost - downPayment);
  let monthlyEmi = 0;
  let totalInterestPaid = 0;
  let totalLoanCost = loanAmount;

  if (loanAmount > 0 && loanInterestRate > 0 && loanTenure > 0) {
    const monthlyRate = loanInterestRate / (12 * 100);
    const totalMonths = loanTenure * 12;
    monthlyEmi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                 (Math.pow(1 + monthlyRate, totalMonths) - 1);
    
    if (isNaN(monthlyEmi) || !isFinite(monthlyEmi)) {
      monthlyEmi = loanAmount / totalMonths;
    }
    totalLoanCost = monthlyEmi * totalMonths;
    totalInterestPaid = totalLoanCost - loanAmount;
  }

  // 3. Resolve Fuel Price
  let initialFuelPrice = 95;
  if (fuelPrices) {
    const fType = variant.fuelType.toLowerCase();
    if (fType.includes("petrol") || fType.includes("hybrid")) {
      initialFuelPrice = input.fuelPricesOverride?.petrol || fuelPrices.petrol;
    } else if (fType.includes("diesel")) {
      initialFuelPrice = input.fuelPricesOverride?.diesel || fuelPrices.diesel;
    } else if (fType.includes("cng")) {
      initialFuelPrice = input.fuelPricesOverride?.cng || fuelPrices.cng;
    } else if (fType.includes("ev") || fType.includes("electric")) {
      initialFuelPrice = input.fuelPricesOverride?.electricity || fuelPrices.electricity;
    }
  }

  // 4. Yearly Timeline Calculations
  const yearlyBreakdown: YearCostBreakdown[] = [];
  let cumulativeCost = totalUpfrontCost; // Starts with On-road price
  
  let totalFuelCost = 0;
  let totalServiceCost = 0;
  let totalTyresCost = 0;
  let totalBrakePadsCost = 0;
  let totalEngineOilCost = 0;
  let totalBatteryReplacementCost = 0;
  let totalUnexpectedRepairsCost = 0;
  let totalInsuranceRenewals = 0;
  let totalOtherCosts = 0;
  
  // Track parts replacements
  let cumulativeKm = 0;
  let lastTyreChangeKm = 0;
  let lastBrakePadChangeKm = 0;

  for (let y = 1; y <= ownershipDuration; y++) {
    cumulativeKm += annualRunning;
    
    // A. Fuel/Electricity Cost
    // Formula: (annualRunning / realWorldMileage) * FuelPrice(y)
    const fuelPriceCurrent = initialFuelPrice * Math.pow(1 + fuelInflation / 100, y - 1);
    const fuelCost = (annualRunning / variant.realWorldMileage) * fuelPriceCurrent;
    totalFuelCost += fuelCost;

    // B. Service Cost (segment curve or default)
    let serviceCost = variant.annualServiceCost;
    if (serviceCurve) {
      const yearKey = `year${Math.min(10, y)}`;
      serviceCost = serviceCurve[yearKey] || variant.annualServiceCost;
    }
    // Adjust for custom maintenance inflation
    serviceCost = serviceCost * Math.pow(1 + maintenanceInflation / 100, y - 1);
    totalServiceCost += serviceCost;

    // C. Tyres replacement (every 40,000 km)
    let tyreCost = 0;
    if (cumulativeKm - lastTyreChangeKm >= 40000) {
      tyreCost = variant.tyreReplacementCost * Math.pow(1 + maintenanceInflation / 100, y - 1);
      lastTyreChangeKm += 40000;
      totalTyresCost += tyreCost;
    }

    // D. Brake Pads replacement (every 20,000 km)
    let brakePadsCost = 0;
    if (cumulativeKm - lastBrakePadChangeKm >= 20000) {
      brakePadsCost = variant.brakePadsCost * Math.pow(1 + maintenanceInflation / 100, y - 1);
      lastBrakePadChangeKm += 20000;
      totalBrakePadsCost += brakePadsCost;
    }

    // E. Engine Oil change (every year for ICE/Hybrid)
    let engineOilCost = 0;
    const isICEorHybrid = !variant.fuelType.toLowerCase().includes("ev") && !variant.fuelType.toLowerCase().includes("electric");
    if (isICEorHybrid && variant.engineOilCost > 0) {
      engineOilCost = variant.engineOilCost * Math.pow(1 + maintenanceInflation / 100, y - 1);
      totalEngineOilCost += engineOilCost;
    }

    // F. Battery replacement
    let batteryCost = 0;
    if (variant.fuelType.toLowerCase().includes("ev") || variant.fuelType.toLowerCase().includes("electric")) {
      // EV Battery replacement potential check (if warranty expires - typically 8 years / 1,60,000 km)
      // We list battery cost at year 8 if it exceeds warranty or user keeps it.
      if (y === 8 && variant.batteryReplacementCost > 0) {
        batteryCost = variant.batteryReplacementCost; // Show battery cost in Year 8
        totalBatteryReplacementCost += batteryCost;
      }
    } else {
      // ICE/Hybrid auxiliary battery replaced every 4 years
      if (y % 4 === 0) {
        batteryCost = (variant.batteryReplacementCost || 5000) * Math.pow(1 + maintenanceInflation / 100, y - 1);
        totalBatteryReplacementCost += batteryCost;
      }
    }

    // G. Unexpected repairs (starts at 0.5% of ex-showroom, grows older)
    const wearFactor = 1 + (y - 1) * 0.15; // grows 15% older every year
    const unexpectedRepairs = (exShowroomPrice * 0.005) * wearFactor * Math.pow(1 + maintenanceInflation / 100, y - 1);
    totalUnexpectedRepairsCost += unexpectedRepairs;

    // H. Insurance Renewal Cost (based on depreciated IDV)
    // IDV = Ex-showroom * DepreciationCurve(y)
    let idvFactor = 0.95; // Year 1 IDV
    if (depreciationCurve) {
      const yearKey = `year${Math.min(15, y)}`;
      idvFactor = (depreciationCurve[yearKey] || 50) / 100;
    } else {
      // simple linear fallback
      idvFactor = Math.max(0.1, 0.95 - (y - 1) * 0.1);
    }
    const currentIdv = exShowroomPrice * idvFactor;
    // Premium is roughly 3.2% of IDV (comprehensive) + Third Party flat + inflation
    const insurancePremium = (currentIdv * 0.03 + 3000) * Math.pow(1 + insuranceInflation / 100, y - 1);
    totalInsuranceRenewals += insurancePremium;

    // I. Other costs: FASTag (1200/yr), PUC (300/yr for ICE, 0 for EV), Cleaning (6000/yr)
    const pucAnnual = isICEorHybrid ? 300 : 0;
    const otherCosts = (1200 + pucAnnual + 6000) * Math.pow(1 + maintenanceInflation / 100, y - 1);
    totalOtherCosts += otherCosts;

    // J. Loan Payment for the year
    let emiPaidThisYear = 0;
    let interestPaidThisYear = 0;
    let outstandingLoan = 0;

    if (y <= loanTenure) {
      emiPaidThisYear = monthlyEmi * 12;
      
      // Calculate interest portion for this year
      // Approximate using outstanding balances
      const monthlyRate = loanInterestRate / (12 * 100);
      const totalMonths = loanTenure * 12;
      
      // Outstanding balance at start of year y (month = (y-1)*12)
      const mStart = (y - 1) * 12;
      const balanceStart = loanAmount * ((Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, mStart)) / 
                           (Math.pow(1 + monthlyRate, totalMonths) - 1));
                           
      // Outstanding balance at end of year y (month = y*12)
      const mEnd = y * 12;
      const balanceEnd = loanAmount * ((Math.pow(1 + monthlyRate, totalMonths) - Math.pow(1 + monthlyRate, mEnd)) / 
                         (Math.pow(1 + monthlyRate, totalMonths) - 1));
      
      outstandingLoan = Math.max(0, balanceEnd);
      interestPaidThisYear = emiPaidThisYear - (balanceStart - balanceEnd);
    } else {
      outstandingLoan = 0;
    }

    // K. Depreciation & Resale Value at end of year
    let resalePercent = 50;
    if (depreciationCurve) {
      const yearKey = `year${Math.min(15, y)}`;
      resalePercent = depreciationCurve[yearKey] || 20;
    } else {
      // standard linear curve
      resalePercent = Math.max(5, 100 - y * 10);
    }
    const resaleValue = exShowroomPrice * (resalePercent / 100);
    const depreciation = y === 1 
      ? exShowroomPrice - resaleValue 
      : (exShowroomPrice * ((depreciationCurve[`year${y-1}`] || 100) / 100)) - resaleValue;

    // L. Cumulative cost tracking
    const yearlyRunningExpenses = fuelCost + serviceCost + tyreCost + brakePadsCost + engineOilCost + batteryCost + unexpectedRepairs + insurancePremium + otherCosts;
    // Note: Upfront cost already includes initial insurance + registration + road tax + down payment.
    // If we take loan, we pay EMI. If we don't, we paid everything upfront.
    const capitalCostAddedThisYear = loanAmount > 0 ? emiPaidThisYear : 0;
    
    cumulativeCost += yearlyRunningExpenses + capitalCostAddedThisYear;

    yearlyBreakdown.push({
      year: y,
      fuelCost: Math.round(fuelCost),
      serviceCost: Math.round(serviceCost),
      tyreCost: Math.round(tyreCost),
      brakePadsCost: Math.round(brakePadsCost),
      engineOilCost: Math.round(engineOilCost),
      batteryCost: Math.round(batteryCost),
      unexpectedRepairs: Math.round(unexpectedRepairs),
      insurancePremium: Math.round(insurancePremium),
      otherCosts: Math.round(otherCosts),
      emiPaid: Math.round(emiPaidThisYear),
      interestPaid: Math.round(interestPaidThisYear),
      depreciation: Math.round(depreciation),
      resaleValue: Math.round(resaleValue),
      outstandingLoan: Math.round(outstandingLoan),
      cumulativeCost: Math.round(cumulativeCost),
    });
  }

  // 5. Finalize Resale Value and Loan Outstanding
  const lastYearBreakdown = yearlyBreakdown[ownershipDuration - 1];
  const resaleValue = lastYearBreakdown.resaleValue;
  const outstandingLoanBalance = lastYearBreakdown.outstandingLoan;
  
  // Net Resale Value is what the user pocketed (or paid if loan was higher than car value)
  const netResaleValue = resaleValue - outstandingLoanBalance;

  // Total Cumulative Cost (without accounting for resale)
  // If user paid cash: On-Road Price + running expenses (insurance renewals + fuel + service etc.)
  // If user took loan: Down Payment + EMIs + running expenses
  const totalCostWithoutResale = loanAmount > 0 
    ? (downPayment + (monthlyEmi * 12 * Math.min(ownershipDuration, loanTenure)) + 
       totalFuelCost + totalMaintenanceCostSum() + totalInsuranceRenewals + totalOtherCosts)
    : (totalUpfrontCost + totalFuelCost + totalMaintenanceCostSum() + totalInsuranceRenewals + totalOtherCosts);

  // Net Ownership Cost is the actual loss/expense after selling the car
  const netOwnershipCost = totalCostWithoutResale - resaleValue + outstandingLoanBalance;

  // Helper to calculate total maintenance sum
  function totalMaintenanceCostSum() {
    return totalServiceCost + totalTyresCost + totalBrakePadsCost + totalEngineOilCost + totalBatteryReplacementCost + totalUnexpectedRepairsCost;
  }

  // Unit Metrics
  const costPerYear = netOwnershipCost / ownershipDuration;
  const costPerMonth = costPerYear / 12;
  const costPerDay = costPerYear / 365;
  const costPerKm = netOwnershipCost / (annualRunning * ownershipDuration);

  return {
    exShowroomPrice,
    roadTax: Math.round(roadTax),
    registration: Math.round(registration),
    initialInsurance: Math.round(initialInsurance),
    accessories: accessoriesCost,
    extendedWarranty: extendedWarrantyCost,
    totalUpfrontCost: Math.round(totalUpfrontCost),

    loanAmount: Math.round(loanAmount),
    monthlyEmi: Math.round(monthlyEmi),
    totalInterestPaid: Math.round(totalInterestPaid),
    totalLoanCost: Math.round(totalLoanCost),

    totalFuelCost: Math.round(totalFuelCost),
    totalMaintenanceCost: Math.round(totalMaintenanceCostSum()),
    totalServiceCost: Math.round(totalServiceCost),
    totalTyresCost: Math.round(totalTyresCost),
    totalBrakePadsCost: Math.round(totalBrakePadsCost),
    totalEngineOilCost: Math.round(totalEngineOilCost),
    totalBatteryReplacementCost: Math.round(totalBatteryReplacementCost),
    totalUnexpectedRepairsCost: Math.round(totalUnexpectedRepairsCost),
    totalInsuranceRenewals: Math.round(totalInsuranceRenewals),
    totalOtherCosts: Math.round(totalOtherCosts),

    resaleValue: Math.round(resaleValue),
    outstandingLoanBalance: Math.round(outstandingLoanBalance),
    netResaleValue: Math.round(netResaleValue),
    totalCostWithoutResale: Math.round(totalCostWithoutResale),
    netOwnershipCost: Math.round(netOwnershipCost),

    costPerYear: Math.round(costPerYear),
    costPerMonth: Math.round(costPerMonth),
    costPerDay: Math.round(costPerDay),
    costPerKm: parseFloat(costPerKm.toFixed(2)),

    yearlyBreakdown,
  };
}
