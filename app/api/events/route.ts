import connectToDatabase from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

// Configure cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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

        const contentType = req.headers.get("content-type") || "";
        let payload: Record<string, unknown> = {};
        let formData: FormData | null = null;

        if (contentType.includes("multipart/form-data")) {
            formData = await req.formData();
            
            // Process form data
            for (const [key, value] of formData.entries()) {
                if (key === 'agenda' || key === 'tags') {
                    try {
                        payload[key] = JSON.parse(value as string);
                    } catch {
                        payload[key] = (value as string).split(',').map(item => item.trim()).filter(Boolean);
                    }
                } else if (key !== 'image') {
                    payload[key] = value;
                }
            }
        } else {
            return NextResponse.json({ message: "Content-Type must be multipart/form-data" }, { status: 415 });
        }

        const file = formData?.get("image") as File | null;
        if (!file || file.size === 0) {
            return NextResponse.json({ message: "Image file is required" }, { status: 400 });
        }

        // Upload image to cloudinary
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                { resource_type: "image", folder: "events" },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            ).end(buffer);
        });

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
