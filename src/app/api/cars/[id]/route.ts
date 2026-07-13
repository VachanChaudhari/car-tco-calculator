// src/app/api/cars/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const variant = await prisma.variant.findUnique({
      where: { id },
      include: {
        model: {
          include: {
            brand: true,
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    return NextResponse.json(variant);
  } catch (error: any) {
    console.error("GET Car Details Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
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

    const updatedVariant = await prisma.variant.update({
      where: { id },
      data: {
        name,
        exShowroomPrice: parseFloat(exShowroomPrice),
        fuelType,
        transmission,
        mileageArai: parseFloat(mileageArai),
        realWorldMileage: parseFloat(realWorldMileage),
        engineCc: engineCc ? parseInt(engineCc) : null,
        powerBhp: powerBhp ? parseFloat(powerBhp) : null,
        torqueNm: torqueNm ? parseFloat(torqueNm) : null,
        fuelTankCapacity: fuelTankCapacity ? parseFloat(fuelTankCapacity) : null,
        batteryCapacity: batteryCapacity ? parseFloat(batteryCapacity) : null,
        claimedRange: claimedRange ? parseFloat(claimedRange) : null,
        realRange: realRange ? parseFloat(realRange) : null,
        annualServiceCost: parseFloat(annualServiceCost),
        resalePercent: parseFloat(resalePercent),
        registrationCharges: parseFloat(registrationCharges),
        roadTax: parseFloat(roadTax),
        insurancePremium: parseFloat(insurancePremium),
        fastagCategory,
        tyreSize,
        tyreReplacementCost: parseFloat(tyreReplacementCost),
        batteryReplacementCost: parseFloat(batteryReplacementCost),
        brakePadsCost: parseFloat(brakePadsCost),
        engineOilCost: parseFloat(engineOilCost),
        serviceIntervalMonths: parseInt(serviceIntervalMonths),
        serviceIntervalKm: parseInt(serviceIntervalKm),
      },
    });

    return NextResponse.json({ success: true, variant: updatedVariant });
  } catch (error: any) {
    console.error("PUT Car Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = await verifyAdmin(request);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.variant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Variant deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Car Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
