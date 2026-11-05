import { NextResponse } from "next/server";
import { computeAshtakootaMatching } from "@/server/astrology/kundliMatching";
import { calculateBirthChart } from "@/server/astrology/engine";
import prisma from "@/lib/prisma";

// POST /api/astrology/matching
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      groomChart,
      brideChart,
      groomProfileId,
      brideProfileId,
      groomInput,
      brideInput,
      language = "en",
    } = body;

    let finalGroomChart = groomChart;
    let finalBrideChart = brideChart;

    // Retrieve by Profile IDs if provided
    if (!finalGroomChart && groomProfileId) {
      const gProfile = await prisma.birthProfile.findUnique({
        where: { id: groomProfileId },
        include: { birthChart: true },
      });
      if (gProfile?.birthChart?.chartData) {
        finalGroomChart = gProfile.birthChart.chartData;
      }
    }

    if (!finalBrideChart && brideProfileId) {
      const bProfile = await prisma.birthProfile.findUnique({
        where: { id: brideProfileId },
        include: { birthChart: true },
      });
      if (bProfile?.birthChart?.chartData) {
        finalBrideChart = bProfile.birthChart.chartData;
      }
    }

    // Calculate deterministically from raw inputs if provided
    if (!finalGroomChart && groomInput) {
      finalGroomChart = calculateBirthChart(groomInput);
    }
    if (!finalBrideChart && brideInput) {
      finalBrideChart = calculateBirthChart(brideInput);
    }

    if (!finalGroomChart || !finalBrideChart) {
      return NextResponse.json(
        { error: "Both groom and bride birth chart details are required for Ashtakoota matching." },
        { status: 400 }
      );
    }

    const result = computeAshtakootaMatching(finalGroomChart, finalBrideChart, language);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("POST /api/astrology/matching error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to calculate Ashtakoota compatibility." },
      { status: 500 }
    );
  }
}
