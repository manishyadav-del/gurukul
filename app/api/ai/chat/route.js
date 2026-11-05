import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { retrieveRelevantPassages } from "@/server/ai/retrieval";
import { generateAstrologyInterpretation } from "@/server/ai/interpreter";
import {
  checkRateLimit,
  validateAndSanitizeQuery,
  verifyChartOwnership,
  withTimeout,
} from "@/server/ai/security";

// POST /api/ai/chat
export async function POST(request) {
  try {
    const user = await getAuthenticatedUser(request);
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
    const rateLimitKey = user?.id || ip;

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(rateLimitKey);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please wait a moment before sending another query." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rateCheck.resetMs / 1000)) } }
      );
    }

    const body = await request.json();

    // 2. Input Validation and Prompt Injection Defense
    const validation = validateAndSanitizeQuery(body.message);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const message = validation.sanitized;

    const language = body.language || "en";
    let chart = body.chart || null;
    let birthProfileId = body.profileId || null;

    // Resolve birthProfileId from familyMemberId if authorized
    if (!birthProfileId && body.familyMemberId && user?.id) {
      const famMember = await prisma.familyMember.findUnique({
        where: { id: body.familyMemberId },
        select: { id: true, ownerId: true, linkedUserId: true, birthProfileId: true, name: true, relationship: true },
      });
      if (famMember && (famMember.ownerId === user.id || famMember.linkedUserId === user.id)) {
        birthProfileId = famMember.birthProfileId;
      }
    }

    // 3. User Chart Authorization Check
    if (birthProfileId) {
      const isAuthorized = await verifyChartOwnership(birthProfileId, user);
      if (!isAuthorized) {
        return NextResponse.json(
          { error: "Unauthorized access to private birth profile." },
          { status: 403 }
        );
      }
    }

    // 4. Fetch birth chart from database if profileId or chartId provided
    if (!chart && (body.chartId || body.profileId)) {
      const where = body.chartId
        ? { id: body.chartId }
        : { birthProfileId: body.profileId };

      const chartRecord = await prisma.birthChart.findFirst({
        where,
        include: {
          planets: true,
          birthProfile: true,
        },
      });

      if (chartRecord) {
        chart = chartRecord.chartData || {
          ascendant: {
            sign: chartRecord.lagnaSign,
            degree: chartRecord.lagnaDegree,
            nakshatra: chartRecord.moonNakshatra,
          },
          moon: {
            sign: chartRecord.moonSign,
            nakshatra: chartRecord.moonNakshatra,
            pada: chartRecord.moonPada,
          },
          dasha: {
            currentMahadasha: chartRecord.currentDasha,
            balanceText: chartRecord.dashaBalance,
          },
          planets: chartRecord.planets,
        };
        birthProfileId = chartRecord.birthProfileId;
      }
    }

    // 5. Advanced Hybrid Retrieval with Concept Extraction
    const passages = await retrieveRelevantPassages({
      query: message,
      chart,
      limit: 5,
      language,
      user,
    });

    // 6. Generate Grounded AI Interpretation with Timeout Guard
    const interpretation = await withTimeout(
      generateAstrologyInterpretation({
        userQuery: message,
        chart,
        passages,
        language,
      }),
      15000,
      "AI interpretation generation timed out. Please try again."
    );

    // 7. Persist conversation and messages in PostgreSQL
    let targetUserId = user?.id;
    if (!targetUserId) {
      let guestUser = await prisma.user.findFirst({
        where: { email: "guest@gurukul.ai" },
      });
      if (!guestUser) {
        guestUser = await prisma.user.create({
          data: {
            email: "guest@gurukul.ai",
            name: "Gurukul Guest",
            role: "USER",
          },
        });
      }
      targetUserId = guestUser.id;
    }

    let conversation = null;
    if (body.conversationId) {
      conversation = await prisma.aIConversation.findUnique({
        where: { id: body.conversationId },
      });
    }

    if (!conversation) {
      const title = message.length > 40 ? `${message.slice(0, 40)}...` : message;
      conversation = await prisma.aIConversation.create({
        data: {
          userId: targetUserId,
          birthProfileId: birthProfileId || null,
          title,
          language,
        },
      });
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: message,
      },
    });

    // Save assistant message with AISource citations
    const assistantMessage = await prisma.aIMessage.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: interpretation.content,
        metadata: {
          provider: interpretation.provider,
          chartFactorsUsed: Boolean(chart),
          hasSufficientEvidence: interpretation.hasSufficientEvidence,
          searchMethod: passages.searchMethod || "HYBRID",
        },
        sources: {
          create: passages.map((p) => ({
            passageId: p.passageId || null,
            bookTitle: p.bookTitle,
            chapterTitle: p.chapterTitle,
            pageNumber: p.sourcePage,
            citationText: p.text.slice(0, 500),
            readerUrl: p.readerUrl,
            relevance: p.relevance,
          })),
        },
      },
      include: {
        sources: true,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: conversation.id,
      messageId: assistantMessage.id,
      role: "assistant",
      content: interpretation.content,
      provider: interpretation.provider,
      sources: passages,
      sourceComparison: interpretation.sourceComparison || passages.sourceComparison || null,
      hasSufficientEvidence: interpretation.hasSufficientEvidence,
      searchMethod: passages.searchMethod || "HYBRID",
    });
  } catch (error) {
    console.error("POST /api/ai/chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI chat request" },
      { status: 500 }
    );
  }
}
