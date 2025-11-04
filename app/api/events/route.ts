import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { resolve } from "path";
import { v2 as cloudinary } from "cloudinary";

// Handle GET /api/events
export async function GET() {
    try {
        await connectToDatabase();
        const items = await Event.find({}).sort({ createdAt: -1 }).limit(100).lean();
        return NextResponse.json({ events: items }, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to fetch events", error: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}

// Handle POST /api/events
export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();

        // Support both JSON and form-data bodies
        let payload: Record<string, unknown> = {};
        const contentType = req.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            payload = await req.json();
        } else if (contentType.includes("form")) {
            const formData = await req.formData();
            payload = Object.fromEntries(formData.entries());
        } else {
            return NextResponse.json({ message: "Unsupported Content-Type" }, { status: 415 });
        }

        const file = formData.get("image") as File | null;
        if (!file) {
            return NextResponse.json({ message: "Image file is required" }, { status: 400 });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: "image", folder: "events" }, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }).end(buffer);

        })
        payload.image = (uploadResult as {secure_url: string}).secure_url;
        const created = await Event.create(payload);
        return NextResponse.json({ message: "Event created successfully", event: created }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: "Failed to create event", error: error instanceof Error ? error.message : "Unknown" },
            { status: 500 }
        );
    }
}
