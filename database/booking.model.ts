/*
  database/booking.model.ts
  Booking schema with strict typing, email validation, and pre-save reference check.
*/
import { Schema, model, models, type Model, type Document, type Types } from "mongoose";
import { connectToDatabase, getMongoose } from "@/lib/mongodb";
import { Event, type EventDocument } from "./event.model";

export interface BookingFields {
  eventId: Types.ObjectId; // Ref to Event
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingDocument extends Document, Omit<BookingFields, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export type BookingModel = Model<BookingDocument>;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "eventId is required"],
      index: true,
    },
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      validate: { validator: (v: string) => emailRegex.test(v), message: "email must be a valid address" },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Secondary index to speed up queries by event
BookingSchema.index({ eventId: 1 });

// Pre-save: ensure referenced Event exists and DB connection is ready
BookingSchema.pre<BookingDocument>("save", async function (next) {
  try {
    if (!getMongoose()) await connectToDatabase();

    const exists = await Event.exists({ _id: this.eventId } as Partial<EventDocument>);
    if (!exists) return next(new Error("Referenced eventId does not exist"));

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Booking: BookingModel =
  (models.Booking as BookingModel) || model<BookingDocument, BookingModel>("Booking", BookingSchema);

export default Booking;
