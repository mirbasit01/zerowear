import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Event from "@/database/event.model";
import Booking from "@/database/booking.model";

// GET /api/stats - General analytics
export async function GET() {
  try {
    await connectToDatabase();
    
    const [
      totalEvents,
      totalBookings,
      upcomingEvents,
      eventsByMode,
      topTags,
      recentBookings
    ] = await Promise.all([
      Event.countDocuments({}),
      Booking.countDocuments({}),
      Event.countDocuments({ date: { $gte: new Date().toISOString().slice(0, 10) } }),
      Event.aggregate([
        { $group: { _id: "$mode", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Event.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Booking.find({}).sort({ createdAt: -1 }).limit(5).lean()
    ]);

    return NextResponse.json({
      overview: {
        totalEvents,
        totalBookings,
        upcomingEvents,
        pastEvents: totalEvents - upcomingEvents
      },
      eventsByMode,
      topTags,
      recentBookings
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch stats", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}