import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET /api/events/[slug] - Get single event by slug
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();
    const event = await Event.findOne({ slug: params.slug }).lean();
    
    if (!event) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }
    
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch event", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// PUT /api/events/[slug] - Update event by slug
export async function PUT(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();
    
    const contentType = (req.headers.get("content-type") || "").toLowerCase();
    let payload: Record<string, unknown> = {};
    let imageUrl: string | null = null;

    if (contentType.includes("application/json")) {
      payload = await req.json();
      const img = (payload as any).image;
      if (img && typeof img === "string" && img.startsWith("http")) {
        imageUrl = img;
      }
    } else if (
      contentType.includes("multipart/form-data") ||
      contentType.includes("application/x-www-form-urlencoded")
    ) {
      const formData = await req.formData();
      payload = Object.fromEntries(formData.entries());

      const file = formData.get("image") as File | null;
      if (file) {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "image", folder: "events" }, (error, result) => {
              if (error || !result) return reject(error || new Error("Upload failed"));
              resolve(result as { secure_url: string });
            })
            .end(buffer);
        });
        imageUrl = uploadResult.secure_url;
      }
    } else {
      return NextResponse.json({ message: "Unsupported Content-Type" }, { status: 415 });
    }

    // Normalize array fields if sent as comma-separated strings
    const normalizeCSV = (v: unknown) =>
      typeof v === "string" ? v.split(",").map(s => s.trim()).filter(Boolean) : v;
    if ((payload as any).agenda) (payload as any).agenda = normalizeCSV((payload as any).agenda);
    if ((payload as any).tags) (payload as any).tags = normalizeCSV((payload as any).tags);

    if (imageUrl) payload.image = imageUrl;

    const updated = await Event.findOneAndUpdate(
      { slug: params.slug },
      payload,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event updated successfully", event: updated }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update event", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}

// DELETE /api/events/[slug] - Delete event by slug
export async function DELETE(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    await connectToDatabase();
    
    const deleted = await Event.findOneAndDelete({ slug: params.slug });
    
    if (!deleted) {
      return NextResponse.json({ message: "Event not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to delete event", error: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}