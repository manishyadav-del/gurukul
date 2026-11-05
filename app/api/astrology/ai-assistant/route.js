import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthenticatedUser } from "@/server/security/authGuard";
import { calculateBirthChart } from "@/server/astrology/engine";
import { retrieveRelevantPassages } from "@/server/ai/retrieval";
import {
  extractTargetedAstrologyContext,
  synthesizePersonalizedAnswer,
} from "@/server/astrology/personalizedContextEngine";

// POST /api/astrology/ai-assistant
export async function POST(request) {
  try {
    const authUser = await getAuthenticatedUser(request);
    const body = await request.json();
    const { query, language = "en" } = body;
    let { chart, profileId, conversationId } = body;

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "A question or query is required." },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();

    // 1. Resolve Chart and Profile for authenticated user if not provided in body
    let profile = null;
    if (!chart && authUser?.id) {
      if (profileId) {
        profile = await prisma.birthProfile.findFirst({
          where: { id: profileId, userId: authUser.id },
          include: { birthChart: true },
        });
      } else {
        profile = await prisma.birthProfile.findFirst({
          where: { userId: authUser.id },
          include: { birthChart: true },
          orderBy: { updatedAt: "desc" },
        });
      }

      if (profile) {
        if (profile.birthChart?.chartData) {
          chart = profile.birthChart.chartData;
        } else {
          try {
            chart = calculateBirthChart({
              name: profile.name,
              birthDate: profile.birthDate.toISOString().split("T")[0],
              birthTime: profile.birthTime || "12:00",
              birthPlace: profile.birthPlace,
              latitude: profile.latitude,
              longitude: profile.longitude,
              timezone: profile.timezone || "Asia/Kolkata",
              language,
              gender: profile.gender,
            });
          } catch {
            chart = null;
          }
        }
      }
    }

    // 2. Targeted Context Extraction (Only retrieves pertinent subset to avoid token bloat)
    const targetedContext = extractTargetedAstrologyContext({
      query: cleanQuery,
      chart,
      profile,
      language,
    });

    // 3. Grounded RAG Retrieval from Gurukul Classical Library
    let passages = [];
    try {
      passages = await retrieveRelevantPassages({
        query: targetedContext.searchTerms.join(" "),
        chart,
        limit: 4,
        language,
        user: authUser,
      });
    } catch {
      passages = [];
    }

    // 4. Structured 6-tier Synthesis
    const synthesized = synthesizePersonalizedAnswer({
      query: cleanQuery,
      chart,
      profile,
      passages,
      language,
    });

    // Generate smart follow-up suggestions based on intent
    const isHi = language === "hi" || language === "hindi";
    const followUps = [];
    if (targetedContext.intent === "DASHA") {
      followUps.push(
        isHi ? "मेरी वर्तमान अंतर्दशा के अनुसार अनुकूल साधना क्या है?" : "What spiritual practices best harmonize my current Antardasha?",
        isHi ? "अगला दशा परिवर्तन कब होगा?" : "When is my next upcoming Dasha transition?"
      );
    } else if (targetedContext.intent === "TRANSIT") {
      followUps.push(
        isHi ? "शनि गोचर का मेरी चंद्र राशि पर क्या प्रभाव है?" : "How does Saturn's transit specifically impact my Moon sign?",
        isHi ? "गुरु के गोचर के शुभ प्रभाव को कैसे बढ़ाएं?" : "How can I maximize Jupiter's favorable transit influence?"
      );
    } else {
      followUps.push(
        isHi ? "मेरी कुंडली में सबसे सशक्त ग्रह कौन सा है?" : "Which is the strongest planet in my birth chart according to Shadbala?",
        isHi ? "वर्तमान गोचर और दशा का क्या संबंध है?" : "How do current transits interact with my active Mahadasha?"
      );
    }

    // 5. Persist Conversation in PostgreSQL if authenticated
    let currentConversationId = conversationId || null;
    let assistantMessageId = null;

    if (authUser?.id) {
      if (!currentConversationId) {
        const titleSnippet = cleanQuery.length > 40 ? `${cleanQuery.slice(0, 40)}...` : cleanQuery;
        const newConv = await prisma.aIConversation.create({
          data: {
            userId: authUser.id,
            birthProfileId: profile?.id || null,
            title: titleSnippet,
            language,
          },
        });
        currentConversationId = newConv.id;
      }

      // Save user message
      await prisma.aIMessage.create({
        data: {
          conversationId: currentConversationId,
          role: "user",
          content: cleanQuery,
        },
      });

      // Save assistant message with citation sources
      const savedAssistant = await prisma.aIMessage.create({
        data: {
          conversationId: currentConversationId,
          role: "assistant",
          content: synthesized.fullText,
          metadata: {
            intent: targetedContext.intent,
            summaryPills: targetedContext.summaryPills,
            hasSufficientEvidence: synthesized.hasSufficientEvidence,
          },
          sources: {
            create: passages.map((p) => ({
              passageId: p.passageId || null,
              bookTitle: p.bookTitle,
              chapterTitle: p.chapterTitle,
              pageNumber: p.sourcePage,
              citationText: (p.text || "").slice(0, 500),
              readerUrl: p.readerUrl,
              relevance: p.relevance || 0.8,
            })),
          },
        },
      });
      assistantMessageId = savedAssistant.id;
    }

    return NextResponse.json({
      success: true,
      conversationId: currentConversationId,
      messageId: assistantMessageId,
      role: "assistant",
      query: cleanQuery,
      intent: targetedContext.intent,
      summaryPills: targetedContext.summaryPills,
      directAnswer: synthesized.directAnswer,
      astronomyDataText: synthesized.astronomyDataText,
      classicalExplanation: synthesized.classicalExplanation,
      content: synthesized.fullText,
      sections: synthesized.sections,
      citations: synthesized.citations,
      sourceComparison: synthesized.sourceComparison,
      hasSufficientEvidence: synthesized.hasSufficientEvidence,
      followUpQuestions: followUps,
      disclaimer: synthesized.disclaimer,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("POST /api/astrology/ai-assistant error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process AI Jyotish Assistant inquiry." },
      { status: 500 }
    );
  }
}
