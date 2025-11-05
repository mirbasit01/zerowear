import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";

// GET /api/events/search?q=react&location=&mode=&tag=&limit=20
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || "";
    const location = searchParams.get("location") || "";
    const mode = searchParams.get("mode") || "";
    const tag = searchParams.get("tag") || "";
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * Math.min(limit, 100); // Max 100 per page

    // Build search query
    const query: Record<string, unknown> = {};
    
    // Text search across title, description, overview
    if (q.trim()) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { overview: { $regex: q, $options: "i" } },
        { organizer: { $regex: q, $options: "i" } }
      ];
    }
    
    // Location filter
    if (location.trim()) {
      query.location = { $regex: location, $options: "i" };
    }
    
    // Mode filter (exact match)
    if (mode.trim()) {
      query.mode = mode.toLowerCase();
    }
    
    // Tag filter
    if (tag.trim()) {
      query.tags = { $in: [new RegExp(tag, "i")] };
    }

    // Date range filters (optional)
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    if (dateFrom || dateTo) {
      const dateQuery: Record<string, unknown> = {};
      if (dateFrom) dateQuery.$gte = dateFrom;
      if (dateTo) dateQuery.$lte = dateTo;
      query.date = dateQuery;
    }

    const [events, total] = await Promise.all([
      Event.find(query)
        .sort({ date: 1, createdAt: -1 })
        .limit(Math.min(limit, 100))
        .skip(skip)
        .lean(),
      Event.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / Math.min(limit, 100));

    return NextResponse.json({
      events,
      pagination: {
        page,
        limit: Math.min(limit, 100),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { message: "Search failed", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}