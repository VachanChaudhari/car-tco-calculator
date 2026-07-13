// src/app/api/comparisons/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Comparison ID is required" }, { status: 400 });
    }

    const comparison = await prisma.comparison.findUnique({
      where: { id },
    });

    if (!comparison) {
      return NextResponse.json({ error: "Comparison not found" }, { status: 404 });
    }

    return NextResponse.json(comparison);
  } catch (error: any) {
    console.error("GET Comparison Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { carIds, title, description } = await request.json();

    if (!carIds) {
      return NextResponse.json({ error: "carIds is required" }, { status: 400 });
    }

    const comparison = await prisma.comparison.create({
      data: {
        carIds,
        title: title || "Car Comparison",
        description: description || "",
      },
    });

    return NextResponse.json({ success: true, id: comparison.id });
  } catch (error: any) {
    console.error("POST Comparison Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
