// src/app/api/settings/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    if (type === "fuel") {
      const fuelPrices = await prisma.fuelPrices.findMany({
        orderBy: { state: "asc" },
      });
      return NextResponse.json(fuelPrices);
    }

    if (type === "taxes") {
      const stateTaxes = await prisma.stateTaxes.findMany({
        orderBy: { state: "asc" },
      });
      return NextResponse.json(stateTaxes);
    }

    if (type === "depreciation") {
      const curves = await prisma.depreciationCurve.findMany({
        orderBy: { segment: "asc" },
      });
      return NextResponse.json(curves);
    }

    if (type === "service") {
      const costs = await prisma.serviceCost.findMany({
        orderBy: { segment: "asc" },
      });
      return NextResponse.json(costs);
    }

    // Default: return everything in a combined config object
    const [fuel, taxes, depreciation, service] = await Promise.all([
      prisma.fuelPrices.findMany(),
      prisma.stateTaxes.findMany(),
      prisma.depreciationCurve.findMany(),
      prisma.serviceCost.findMany(),
    ]);

    return NextResponse.json({ fuel, taxes, depreciation, service });
  } catch (error: any) {
    console.error("GET Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const body = await request.json();

    if (type === "fuel") {
      const { id, state, petrol, diesel, cng, electricity } = body;
      const updated = await prisma.fuelPrices.upsert({
        where: { state },
        update: { petrol: parseFloat(petrol), diesel: parseFloat(diesel), cng: parseFloat(cng), electricity: parseFloat(electricity) },
        create: { state, petrol: parseFloat(petrol), diesel: parseFloat(diesel), cng: parseFloat(cng), electricity: parseFloat(electricity) },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (type === "taxes") {
      const { id, state, roadTaxPetrolPercent, roadTaxDieselPercent, roadTaxEvPercent, roadTaxCngPercent, registrationFeeFlat } = body;
      const updated = await prisma.stateTaxes.upsert({
        where: { state },
        update: {
          roadTaxPetrolPercent: parseFloat(roadTaxPetrolPercent),
          roadTaxDieselPercent: parseFloat(roadTaxDieselPercent),
          roadTaxEvPercent: parseFloat(roadTaxEvPercent),
          roadTaxCngPercent: parseFloat(roadTaxCngPercent),
          registrationFeeFlat: parseFloat(registrationFeeFlat),
        },
        create: {
          state,
          roadTaxPetrolPercent: parseFloat(roadTaxPetrolPercent),
          roadTaxDieselPercent: parseFloat(roadTaxDieselPercent),
          roadTaxEvPercent: parseFloat(roadTaxEvPercent),
          roadTaxCngPercent: parseFloat(roadTaxCngPercent),
          registrationFeeFlat: parseFloat(registrationFeeFlat),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (type === "depreciation") {
      const { segment, year1, year2, year3, year4, year5, year6, year7, year8, year9, year10, year11, year12, year13, year14, year15 } = body;
      const updated = await prisma.depreciationCurve.upsert({
        where: { segment },
        update: {
          year1: parseFloat(year1), year2: parseFloat(year2), year3: parseFloat(year3), year4: parseFloat(year4),
          year5: parseFloat(year5), year6: parseFloat(year6), year7: parseFloat(year7), year8: parseFloat(year8),
          year9: parseFloat(year9), year10: parseFloat(year10), year11: parseFloat(year11), year12: parseFloat(year12),
          year13: parseFloat(year13), year14: parseFloat(year14), year15: parseFloat(year15),
        },
        create: {
          segment,
          year1: parseFloat(year1), year2: parseFloat(year2), year3: parseFloat(year3), year4: parseFloat(year4),
          year5: parseFloat(year5), year6: parseFloat(year6), year7: parseFloat(year7), year8: parseFloat(year8),
          year9: parseFloat(year9), year10: parseFloat(year10), year11: parseFloat(year11), year12: parseFloat(year12),
          year13: parseFloat(year13), year14: parseFloat(year14), year15: parseFloat(year15),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (type === "service") {
      const { segment, year1, year2, year3, year4, year5, year6, year7, year8, year9, year10 } = body;
      const updated = await prisma.serviceCost.upsert({
        where: { segment },
        update: {
          year1: parseFloat(year1), year2: parseFloat(year2), year3: parseFloat(year3), year4: parseFloat(year4),
          year5: parseFloat(year5), year6: parseFloat(year6), year7: parseFloat(year7), year8: parseFloat(year8),
          year9: parseFloat(year9), year10: parseFloat(year10),
        },
        create: {
          segment,
          year1: parseFloat(year1), year2: parseFloat(year2), year3: parseFloat(year3), year4: parseFloat(year4),
          year5: parseFloat(year5), year6: parseFloat(year6), year7: parseFloat(year7), year8: parseFloat(year8),
          year9: parseFloat(year9), year10: parseFloat(year10),
        },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
  } catch (error: any) {
    console.error("POST Settings Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
