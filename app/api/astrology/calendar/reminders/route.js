import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/server/security/authGuard";

export async function GET(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const reminders = await prisma.userObservanceReminder.findMany({
      where: { userId: user.id },
      include: {
        festival: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameHi: true,
          },
        },
      },
      orderBy: { eventDate: "asc" },
    });

    return NextResponse.json({
      success: true,
      reminders,
    });
  } catch (error) {
    console.error("Festival reminders GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reminders" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const body = await request.json();
    const {
      festivalSlug,
      festivalId,
      eventDate,
      reminderType = "FESTIVAL_DAY",
      reminderTime = "06:00",
      timezone = "Asia/Kolkata",
      notificationTitle,
      notificationBody,
    } = body;

    if (!eventDate) {
      return NextResponse.json(
        { success: false, error: "eventDate (YYYY-MM-DD) is required" },
        { status: 400 }
      );
    }

    const festival = await prisma.vedicFestival.findFirst({
      where: {
        OR: [
          ...(festivalId ? [{ id: festivalId }] : []),
          ...(festivalSlug ? [{ slug: festivalSlug }] : []),
        ],
      },
    });

    if (!festival) {
      return NextResponse.json(
        { success: false, error: "Festival not found" },
        { status: 404 }
      );
    }

    // Check for existing reminder on same date & type to prevent duplicates
    const existing = await prisma.userObservanceReminder.findFirst({
      where: {
        userId: user.id,
        festivalId: festival.id,
        eventDate,
        reminderType,
      },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        reminder: existing,
        message: "Reminder already scheduled for this date and observance.",
      });
    }

    const title = notificationTitle || `Reminder: ${festival.name}`;
    const desc =
      notificationBody ||
      `Upcoming observance of ${festival.name} on ${eventDate}. Plan your morning Puja and Vrata.`;

    const reminder = await prisma.userObservanceReminder.create({
      data: {
        userId: user.id,
        festivalId: festival.id,
        eventDate,
        reminderType,
        reminderTime,
        timezone,
        status: "SCHEDULED",
        notificationTitle: title,
        notificationBody: desc,
      },
      include: {
        festival: {
          select: {
            id: true,
            slug: true,
            name: true,
            nameHi: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      reminder,
    });
  } catch (error) {
    console.error("Festival reminders POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to schedule reminder" },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const auth = await requireAuth(request);
    if (auth.errorResponse) {
      return auth.errorResponse;
    }
    const user = auth.user;

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Reminder ID required" }, { status: 400 });
    }

    await prisma.userObservanceReminder.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, message: "Reminder cancelled" });
  } catch (error) {
    console.error("Festival reminders DELETE error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete reminder" },
      { status: 500 }
    );
  }
}
