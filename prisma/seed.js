// prisma/seed.js
const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function sha256(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Seeding database...");

  // 1. Seed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || "admin@cartco.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "adminpassindia";
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Admin User",
      passwordHash: sha256(adminPassword),
      role: "ADMIN",
    },
  });
  console.log("✔ Seeded admin user:", adminEmail);

  // 2. Seed State Fuel Prices
  const fuelPricesData = [
    { state: "Delhi", petrol: 94.72, diesel: 87.62, cng: 75.59, electricity: 6.00 },
    { state: "Maharashtra", petrol: 104.21, diesel: 92.15, cng: 85.00, electricity: 8.50 },
    { state: "Karnataka", petrol: 102.84, diesel: 88.95, cng: 82.00, electricity: 7.00 },
    { state: "Tamil Nadu", petrol: 100.75, diesel: 92.34, cng: 80.00, electricity: 8.00 },
    { state: "Haryana", petrol: 95.12, diesel: 87.98, cng: 79.50, electricity: 6.20 },
    { state: "Gujarat", petrol: 96.42, diesel: 92.17, cng: 76.50, electricity: 6.50 },
    { state: "Uttar Pradesh", petrol: 94.50, diesel: 87.60, cng: 80.00, electricity: 6.50 },
  ];

  for (const fp of fuelPricesData) {
    await prisma.fuelPrices.upsert({
      where: { state: fp.state },
      update: fp,
      create: fp,
    });
  }
  console.log("✔ Seeded fuel prices for states");

  // 3. Seed State Road Taxes and Registration Fees
  const stateTaxesData = [
    { state: "Delhi", roadTaxPetrolPercent: 10.0, roadTaxDieselPercent: 12.5, roadTaxEvPercent: 0.0, roadTaxCngPercent: 7.0, registrationFeeFlat: 600 },
    { state: "Maharashtra", roadTaxPetrolPercent: 11.0, roadTaxDieselPercent: 13.0, roadTaxEvPercent: 6.0, roadTaxCngPercent: 7.0, registrationFeeFlat: 800 },
    { state: "Karnataka", roadTaxPetrolPercent: 14.0, roadTaxDieselPercent: 14.0, roadTaxEvPercent: 4.0, roadTaxCngPercent: 10.0, registrationFeeFlat: 1000 },
    { state: "Tamil Nadu", roadTaxPetrolPercent: 10.0, roadTaxDieselPercent: 12.0, roadTaxEvPercent: 5.0, roadTaxCngPercent: 8.0, registrationFeeFlat: 700 },
    { state: "Haryana", roadTaxPetrolPercent: 8.0, roadTaxDieselPercent: 10.0, roadTaxEvPercent: 0.0, roadTaxCngPercent: 6.0, registrationFeeFlat: 600 },
    { state: "Gujarat", roadTaxPetrolPercent: 6.0, roadTaxDieselPercent: 8.0, roadTaxEvPercent: 0.0, roadTaxCngPercent: 5.0, registrationFeeFlat: 500 },
    { state: "Uttar Pradesh", roadTaxPetrolPercent: 8.0, roadTaxDieselPercent: 10.0, roadTaxEvPercent: 2.0, roadTaxCngPercent: 6.0, registrationFeeFlat: 650 },
  ];

  for (const st of stateTaxesData) {
    await prisma.stateTaxes.upsert({
      where: { state: st.state },
      update: st,
      create: st,
    });
  }
  console.log("✔ Seeded state taxes and registration fees");

  // 4. Seed Depreciation Curves
  const depCurves = [
    {
      segment: "Entry",
      year1: 85.0, year2: 75.0, year3: 67.0, year4: 60.0, year5: 53.0, year6: 47.0, year7: 42.0, year8: 37.0,
      year9: 32.0, year10: 27.0, year11: 23.0, year12: 19.0, year13: 15.0, year14: 12.0, year15: 10.0
    },
    {
      segment: "Mid",
      year1: 80.0, year2: 70.0, year3: 62.0, year4: 55.0, year5: 48.0, year6: 42.0, year7: 37.0, year8: 32.0,
      year9: 28.0, year10: 24.0, year11: 20.0, year12: 16.0, year13: 13.0, year14: 10.0, year15: 8.0
    },
    {
      segment: "Premium",
      year1: 78.0, year2: 67.0, year3: 58.0, year4: 50.0, year5: 43.0, year6: 37.0, year7: 32.0, year8: 27.0,
      year9: 23.0, year10: 19.0, year11: 15.0, year12: 12.0, year13: 9.0, year14: 7.0, year15: 5.0
    },
    {
      segment: "Luxury",
      year1: 72.0, year2: 60.0, year3: 50.0, year4: 42.0, year5: 35.0, year6: 30.0, year7: 25.0, year8: 20.0,
      year9: 16.0, year10: 13.0, year11: 10.0, year12: 8.0, year13: 6.0, year14: 4.0, year15: 3.0
    },
    {
      segment: "EV",
      year1: 75.0, year2: 63.0, year3: 53.0, year4: 45.0, year5: 38.0, year6: 32.0, year7: 27.0, year8: 22.0,
      year9: 17.0, year10: 13.0, year11: 10.0, year12: 8.0, year13: 6.0, year14: 4.0, year15: 3.0
    }
  ];

  for (const dc of depCurves) {
    await prisma.depreciationCurve.upsert({
      where: { segment: dc.segment },
      update: dc,
      create: dc,
    });
  }
  console.log("✔ Seeded depreciation curves");

  // 5. Seed Service Costs
  const serviceCosts = [
    { segment: "Entry", year1: 2500, year2: 3500, year3: 4000, year4: 4500, year5: 5000, year6: 5500, year7: 6000, year8: 6500, year9: 7000, year10: 7500 },
    { segment: "Mid", year1: 4500, year2: 5500, year3: 6500, year4: 7500, year5: 8500, year6: 9500, year7: 10500, year8: 11500, year9: 12500, year10: 13500 },
    { segment: "Premium", year1: 8000, year2: 9500, year3: 11000, year4: 13000, year5: 15000, year6: 17000, year7: 19000, year8: 21000, year9: 23000, year10: 25000 },
    { segment: "Luxury", year1: 18000, year2: 22000, year3: 26000, year4: 30000, year5: 35000, year6: 40000, year7: 45000, year8: 50000, year9: 55000, year10: 60000 },
  ];

  for (const sc of serviceCosts) {
    await prisma.serviceCost.upsert({
      where: { segment: sc.segment },
      update: sc,
      create: sc,
    });
  }
  console.log("✔ Seeded service costs by segment");

  // 6. Seed Brands, Models, and Variants
  const brandsData = [
    {
      name: "Maruti Suzuki",
      models: [
        {
          name: "Swift",
          bodyType: "Hatchback",
          segment: "Entry",
          safetyRating: 3.0,
          variants: [
            {
              name: "LXI MT",
              exShowroomPrice: 649000,
              fuelType: "Petrol",
              transmission: "Manual",
              mileageArai: 24.8,
              realWorldMileage: 18.5,
              engineCc: 1197,
              powerBhp: 81.5,
              torqueNm: 112.0,
              fuelTankCapacity: 37,
              annualServiceCost: 3000,
              resalePercent: 0, // Fallback to segment curve
              registrationCharges: 35000,
              roadTax: 52000,
              insurancePremium: 28000,
              fastagCategory: "Class 4",
              tyreSize: "165/80 R14",
              tyreReplacementCost: 12000,
              batteryReplacementCost: 4500,
              brakePadsCost: 1500,
              engineOilCost: 1800,
            },
            {
              name: "ZXI+ AMT",
              exShowroomPrice: 899000,
              fuelType: "Petrol",
              transmission: "Automatic",
              mileageArai: 25.75,
              realWorldMileage: 19.0,
              engineCc: 1197,
              powerBhp: 81.5,
              torqueNm: 112.0,
              fuelTankCapacity: 37,
              annualServiceCost: 3500,
              resalePercent: 0,
              registrationCharges: 45000,
              roadTax: 72000,
              insurancePremium: 34000,
              fastagCategory: "Class 4",
              tyreSize: "185/65 R15",
              tyreReplacementCost: 14000,
              batteryReplacementCost: 4500,
              brakePadsCost: 1800,
              engineOilCost: 1800,
            }
          ]
        },
        {
          name: "Ertiga",
          bodyType: "MUV",
          segment: "Mid",
          safetyRating: 3.0,
          variants: [
            {
              name: "VXI CNG MT",
              exShowroomPrice: 1078000,
              fuelType: "CNG",
              transmission: "Manual",
              mileageArai: 26.1, // km/kg
              realWorldMileage: 20.0,
              engineCc: 1462,
              powerBhp: 87.0,
              torqueNm: 121.5,
              fuelTankCapacity: 45, // Petrol tank size
              annualServiceCost: 5500,
              resalePercent: 0,
              registrationCharges: 55000,
              roadTax: 86000,
              insurancePremium: 38000,
              fastagCategory: "Class 4",
              tyreSize: "185/65 R15",
              tyreReplacementCost: 15000,
              batteryReplacementCost: 5000,
              brakePadsCost: 2000,
              engineOilCost: 2200,
            }
          ]
        }
      ]
    },
    {
      name: "Tata Motors",
      models: [
        {
          name: "Nexon",
          bodyType: "SUV",
          segment: "Mid",
          safetyRating: 5.0,
          variants: [
            {
              name: "Creative Plus Petrol MT",
              exShowroomPrice: 1170000,
              fuelType: "Petrol",
              transmission: "Manual",
              mileageArai: 17.44,
              realWorldMileage: 12.5,
              engineCc: 1199,
              powerBhp: 118.0,
              torqueNm: 170.0,
              fuelTankCapacity: 44,
              annualServiceCost: 6000,
              resalePercent: 0,
              registrationCharges: 60000,
              roadTax: 93600,
              insurancePremium: 42000,
              fastagCategory: "Class 4",
              tyreSize: "215/60 R16",
              tyreReplacementCost: 24000,
              batteryReplacementCost: 5500,
              brakePadsCost: 2500,
              engineOilCost: 2500,
            }
          ]
        },
        {
          name: "Nexon EV",
          bodyType: "SUV",
          segment: "EV",
          safetyRating: 5.0,
          variants: [
            {
              name: "Empowered Plus LR (40.5kWh)",
              exShowroomPrice: 1699000,
              fuelType: "EV",
              transmission: "Automatic",
              mileageArai: 11.5, // Wh/km equivalent (approx 465km / 40.5kWh)
              realWorldMileage: 7.4, // approx 300km range / 40.5kWh (7.4 km per kWh)
              engineCc: null,
              powerBhp: 142.6,
              torqueNm: 215.0,
              fuelTankCapacity: null,
              batteryCapacity: 40.5,
              claimedRange: 465.0,
              realRange: 300.0,
              annualServiceCost: 2500,
              resalePercent: 0,
              registrationCharges: 25000,
              roadTax: 0, // Often zero tax or very low for EV in Delhi
              insurancePremium: 58000,
              fastagCategory: "Class 4",
              tyreSize: "215/60 R16",
              tyreReplacementCost: 24000,
              batteryReplacementCost: 600000, // 8-year battery warranty, but standard replacement is 6L
              brakePadsCost: 2500,
              engineOilCost: 0,
            }
          ]
        }
      ]
    },
    {
      name: "Hyundai",
      models: [
        {
          name: "Creta",
          bodyType: "SUV",
          segment: "Mid",
          safetyRating: 5.0,
          variants: [
            {
              name: "SX Tech Diesel AT",
              exShowroomPrice: 1870000,
              fuelType: "Diesel",
              transmission: "Automatic",
              mileageArai: 19.1,
              realWorldMileage: 14.5,
              engineCc: 1493,
              powerBhp: 114.0,
              torqueNm: 250.0,
              fuelTankCapacity: 50,
              annualServiceCost: 7500,
              resalePercent: 0,
              registrationCharges: 75000,
              roadTax: 243100, // Diesel road tax is higher (e.g. 13% in Maharashtra)
              insurancePremium: 68000,
              fastagCategory: "Class 4",
              tyreSize: "215/60 R17",
              tyreReplacementCost: 28000,
              batteryReplacementCost: 7500,
              brakePadsCost: 3000,
              engineOilCost: 3500,
            }
          ]
        }
      ]
    },
    {
      name: "Toyota",
      models: [
        {
          name: "Innova Hycross",
          bodyType: "MUV",
          segment: "Premium",
          safetyRating: 5.0,
          variants: [
            {
              name: "ZX (O) Hybrid AT",
              exShowroomPrice: 3098000,
              fuelType: "Hybrid", // Strong Hybrid
              transmission: "Automatic",
              mileageArai: 23.24,
              realWorldMileage: 18.0,
              engineCc: 1987,
              powerBhp: 184.0,
              torqueNm: 206.0,
              fuelTankCapacity: 52,
              annualServiceCost: 9000,
              resalePercent: 0,
              registrationCharges: 110000,
              roadTax: 371760, // e.g. 12% in Maharashtra
              insurancePremium: 115000,
              fastagCategory: "Class 4",
              tyreSize: "225/50 R18",
              tyreReplacementCost: 40000,
              batteryReplacementCost: 150000, // Hybrid battery
              brakePadsCost: 4000,
              engineOilCost: 4500,
            }
          ]
        }
      ]
    },
    {
      name: "BMW",
      models: [
        {
          name: "3 Series Gran Limousine",
          bodyType: "Sedan",
          segment: "Luxury",
          safetyRating: 5.0,
          variants: [
            {
              name: "330Li M Sport Petrol AT",
              exShowroomPrice: 6060000,
              fuelType: "Petrol",
              transmission: "Automatic",
              mileageArai: 15.39,
              realWorldMileage: 10.5,
              engineCc: 1998,
              powerBhp: 258.0,
              torqueNm: 400.0,
              fuelTankCapacity: 59,
              annualServiceCost: 22000,
              resalePercent: 0,
              registrationCharges: 210000,
              roadTax: 727200, // 12% road tax
              insurancePremium: 225000,
              fastagCategory: "Class 4",
              tyreSize: "225/45 R18",
              tyreReplacementCost: 80000,
              batteryReplacementCost: 18000,
              brakePadsCost: 12000,
              engineOilCost: 10000,
            }
          ]
        }
      ]
    }
  ];

  for (const brandData of brandsData) {
    const brand = await prisma.brand.upsert({
      where: { name: brandData.name },
      update: {},
      create: { name: brandData.name },
    });

    for (const modelData of brandData.models) {
      const model = await prisma.model.upsert({
        where: {
          brandId_name: {
            brandId: brand.id,
            name: modelData.name,
          },
        },
        update: {
          bodyType: modelData.bodyType,
          segment: modelData.segment,
          safetyRating: modelData.safetyRating,
        },
        create: {
          brandId: brand.id,
          name: modelData.name,
          bodyType: modelData.bodyType,
          segment: modelData.segment,
          safetyRating: modelData.safetyRating,
        },
      });

      for (const variantData of modelData.variants) {
        await prisma.variant.upsert({
          where: {
            modelId_name: {
              modelId: model.id,
              name: variantData.name,
            },
          },
          update: variantData,
          create: {
            modelId: model.id,
            ...variantData,
          },
        });
      }
    }
  }
  console.log("✔ Seeded brands, models, and variants successfully");

  console.log("Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
