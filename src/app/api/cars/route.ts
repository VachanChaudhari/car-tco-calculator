// src/app/api/cars/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "dropdowns") {
      // Returns high-level structures for brand/model selectors
      const brands = await prisma.brand.findMany({
        include: {
          models: {
            include: {
              variants: {
                select: {
                  id: true,
                  name: true,
                  fuelType: true,
                  transmission: true,
                  exShowroomPrice: true,
                },
              },
            },
          },
        },
        orderBy: { name: "asc" },
      });
      return NextResponse.json(brands);
    }

    // Default: return all variants with brand/model details
    const variants = await prisma.variant.findMany({
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
      orderBy: {
        model: {
          brand: {
            name: "asc",
          },
        },
      },
    });

    return NextResponse.json(variants);
  } catch (error: any) {
    console.error("GET Cars Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      brandName,
      modelName,
      bodyType,
      segment,
      safetyRating,
      variantName,
      exShowroomPrice,
      fuelType,
      transmission,
      mileageArai,
      realWorldMileage,
      engineCc,
      powerBhp,
      torqueNm,
      fuelTankCapacity,
      batteryCapacity,
      claimedRange,
      realRange,
      annualServiceCost,
      resalePercent,
      registrationCharges,
      roadTax,
      insurancePremium,
      fastagCategory,
      tyreSize,
      tyreReplacementCost,
      batteryReplacementCost,
      brakePadsCost,
      engineOilCost,
      serviceIntervalMonths,
      serviceIntervalKm,
    } = body;

    if (!brandName || !modelName || !variantName || !exShowroomPrice || !fuelType || !transmission) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Create or Find Brand
    const brand = await prisma.brand.upsert({
      where: { name: brandName },
      update: {},
      create: { name: brandName },
    });

    // 2. Create or Find Model
    const model = await prisma.model.upsert({
      where: {
        brandId_name: {
          brandId: brand.id,
          name: modelName,
        },
      },
      update: {
        bodyType: bodyType || "SUV",
        segment: segment || "Mid",
        safetyRating: safetyRating ? parseFloat(safetyRating) : null,
      },
      create: {
        brandId: brand.id,
        name: modelName,
        bodyType: bodyType || "SUV",
        segment: segment || "Mid",
        safetyRating: safetyRating ? parseFloat(safetyRating) : null,
      },
    });

    // 3. Create Variant
    const variant = await prisma.variant.create({
      data: {
        modelId: model.id,
        name: variantName,
        exShowroomPrice: parseFloat(exShowroomPrice),
        fuelType,
        transmission,
        mileageArai: parseFloat(mileageArai || 0),
        realWorldMileage: parseFloat(realWorldMileage || 0),
        engineCc: engineCc ? parseInt(engineCc) : null,
        powerBhp: powerBhp ? parseFloat(powerBhp) : null,
        torqueNm: torqueNm ? parseFloat(torqueNm) : null,
        fuelTankCapacity: fuelTankCapacity ? parseFloat(fuelTankCapacity) : null,
        batteryCapacity: batteryCapacity ? parseFloat(batteryCapacity) : null,
        claimedRange: claimedRange ? parseFloat(claimedRange) : null,
        realRange: realRange ? parseFloat(realRange) : null,
        annualServiceCost: parseFloat(annualServiceCost || 0),
        resalePercent: parseFloat(resalePercent || 0),
        registrationCharges: parseFloat(registrationCharges || 0),
        roadTax: parseFloat(roadTax || 0),
        insurancePremium: parseFloat(insurancePremium || 0),
        fastagCategory: fastagCategory || "Class 4",
        tyreSize: tyreSize || "185/65 R15",
        tyreReplacementCost: parseFloat(tyreReplacementCost || 0),
        batteryReplacementCost: parseFloat(batteryReplacementCost || 0),
        brakePadsCost: parseFloat(brakePadsCost || 0),
        engineOilCost: parseFloat(engineOilCost || 0),
        serviceIntervalMonths: parseInt(serviceIntervalMonths || 12),
        serviceIntervalKm: parseInt(serviceIntervalKm || 10000),
      },
    });

    return NextResponse.json({ success: true, variant });
  } catch (error: any) {
    console.error("POST Car Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
