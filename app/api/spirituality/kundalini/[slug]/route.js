/**
 * GET /api/spirituality/kundalini/[slug]
 * 
 * Returns full details of a specific Kundalini educational module or Chakra guide.
 */

import { NextResponse } from "next/server.js";
import prisma from "../../../../../lib/prisma.js";
import { getAuthenticatedUser } from "../../../../../server/security/authGuard.js";
import { INITIAL_KUNDALINI_MODULES } from "../../../../../server/astrology/seedRemediesAndKundalini.js";
import { getChakraBySlug } from "../../../../../server/spirituality/chakraKnowledge.js";

export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const authUser = await getAuthenticatedUser(request);
    const userId = authUser?.id || null;

    let moduleItem = await prisma.kundaliniModule.findUnique({
      where: { slug },
    });

    if (!moduleItem) {
      moduleItem = INITIAL_KUNDALINI_MODULES.find((m) => m.slug === slug);
    }

    const chakraItem = getChakraBySlug(slug);

    if (!moduleItem && !chakraItem) {
      return NextResponse.json({ error: "Kundalini or Chakra item not found" }, { status: 404 });
    }

    let progress = null;
    let savedNote = null;
    if (userId) {
      if (moduleItem?.id) {
        progress = await prisma.userKundaliniProgress.findUnique({
          where: {
            userId_moduleId: {
              userId,
              moduleId: moduleItem.id,
            },
          },
        });
      }

      savedNote = await prisma.userSavedConcept.findUnique({
        where: {
          userId_conceptKey: {
            userId,
            conceptKey: `chakra-reflection-${slug}`
          }
        }
      });
    }

    const payload = chakraItem
      ? {
          type: "CHAKRA",
          chakra: chakraItem,
          dbModule: moduleItem || null,
          isCompleted: Boolean(progress?.completed),
          isBookmarked: Boolean(progress?.bookmarked),
          completedAt: progress?.completedAt || null,
          userReflectionNote: savedNote?.notes || "",
        }
      : {
          type: "MODULE",
          module: {
            ...moduleItem,
            isCompleted: Boolean(progress?.completed),
            isBookmarked: Boolean(progress?.bookmarked),
            completedAt: progress?.completedAt || null,
            userReflectionNote: savedNote?.notes || "",
          },
        };

    return NextResponse.json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error("GET /api/spirituality/kundalini/[slug] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch module details", details: error.message },
      { status: 500 }
    );
  }
}
