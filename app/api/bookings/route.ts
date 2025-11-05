import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Booking from "@/database/booking.model";

// GET /api/bookings?eventId=...
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    const query: Record<string, unknown> = {};
    if (eventId) query.eventId = eventId;

    const items = await Booking.find(query).sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ bookings: items }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch bookings", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// POST /api/bookings
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const body = await req.json();

    const created = await Booking.create(body);
    return NextResponse.json({ message: "Booking created", booking: created }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to create booking", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
