import connectToDatabase from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Event from "@/database/event.model";

// GET /api/categories - Get all unique tags/modes/locations
export async function GET() {
  try {
    await connectToDatabase();
    
    const [tags, modes, locations] = await Promise.all([
      Event.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", count: 1, _id: 0 } }
      ]),
      Event.aggregate([
        { $group: { _id: "$mode", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { name: "$_id", count: 1, _id: 0 } }
      ]),
      Event.aggregate([
        { $group: { _id: "$location", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 50 },
        { $project: { name: "$_id", count: 1, _id: 0 } }
      ])
    ]);

    return NextResponse.json({
      tags,
      modes,
      locations
    }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch categories", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}