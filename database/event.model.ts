/*
  database/event.model.ts
  Event schema with strict typing, unique slug, and pre-save normalization/validation.
*/
import { Schema, model, models, type Model, type Document } from "mongoose";

// Core Event fields stored in MongoDB
export interface EventFields {
  title: string;
  slug: string; // URL-friendly slug derived from title
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // ISO date string (YYYY-MM-DD)
  time: string; // 24h time string (HH:mm)
  mode: string; // e.g., online | offline | hybrid
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDocument extends Document, Omit<EventFields, "createdAt" | "updatedAt"> {
  createdAt: Date;
  updatedAt: Date;
}

export type EventModel = Model<EventDocument>;

// Helpers
const toSlug = (value: string): string =>
  value
    .normalize("NFKD")
    // Remove accents/diacritics
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    // Replace non-alphanumeric with single hyphen
    .replace(/[^a-z0-9]+/g, "-")
    // Trim leading/trailing hyphens
    .replace(/(^-|-$)+/g, "");

const toIsoDate = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) throw new Error("Invalid date; use a parseable date string");
  // Keep only the calendar part (YYYY-MM-DD)
  return d.toISOString().slice(0, 10);
};

const toHHmm = (value: string): string => {
  const v = value.trim();
  // 24h formats like 9:05 or 09:05 or 23:59
  const m24 = /^(?<h>[01]?\d|2[0-3]):(?<m>[0-5]\d)$/u.exec(v);
  if (m24?.groups) {
    const h = String(m24.groups.h).padStart(2, "0");
    const m = String(m24.groups.m).padStart(2, "0");
    return `${h}:${m}`;
  }
  // 12h formats like 9:05 AM/am/pm
  const m12 = /^(?<h>1[0-2]|0?\d):(?<m>[0-5]\d)\s*(?<p>[AaPp][Mm])$/u.exec(v);
  if (m12?.groups) {
    let h = parseInt(m12.groups.h, 10);
    const m = m12.groups.m;
    const period = m12.groups.p.toUpperCase();
    if (period === "AM") {
      if (h === 12) h = 0; // 12:xx AM -> 00:xx
    } else {
      if (h !== 12) h += 12; // PM -> add 12 except 12 PM
    }
    return `${String(h).padStart(2, "0")}:${m}`;
  }
  throw new Error("Invalid time; expected HH:mm or h:mm AM/PM");
};

// Schema definition
const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: {
      type: String,
      required: [true, "title is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "title cannot be empty" },
    },
    slug: {
      type: String,
      unique: true, // uniqueness enforced via index below
      index: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, "description is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "description cannot be empty" },
    },
    overview: {
      type: String,
      required: [true, "overview is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "overview cannot be empty" },
    },
    image: {
      type: String,
      required: [true, "image is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "image cannot be empty" },
    },
    venue: {
      type: String,
      required: [true, "venue is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "venue cannot be empty" },
    },
    location: {
      type: String,
      required: [true, "location is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "location cannot be empty" },
    },
    date: {
      type: String,
      required: [true, "date is required"],
      trim: true,
    },
    time: {
      type: String,
      required: [true, "time is required"],
      trim: true,
    },
    mode: {
      type: String,
      required: [true, "mode is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "mode cannot be empty" },
    },
    audience: {
      type: String,
      required: [true, "audience is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "audience cannot be empty" },
    },
    agenda: {
      type: [String],
      required: [true, "agenda is required"],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.map((s) => s.trim()).filter(Boolean).length > 0,
        message: "agenda must be a non-empty array of strings",
      },
    },
    organizer: {
      type: String,
      required: [true, "organizer is required"],
      trim: true,
      validate: { validator: (v: string) => v.trim().length > 0, message: "organizer cannot be empty" },
    },
    tags: {
      type: [String],
      required: [true, "tags are required"],
      validate: {
        validator: (arr: string[]) => Array.isArray(arr) && arr.map((s) => s.trim()).filter(Boolean).length > 0,
        message: "tags must be a non-empty array of strings",
      },
    },
  },
  {
    timestamps: true, // createdAt/updatedAt auto-generated
    versionKey: false,
  }
);

// Unique index for slug
EventSchema.index({ slug: 1 }, { unique: true });

// Pre-save: slug generation + date/time normalization + final required checks
EventSchema.pre<EventDocument>("save", function (next) {
  try {
    // Generate/refresh slug when title changes
    if (this.isModified("title") || !this.slug) {
      this.slug = toSlug(this.title);
    }

    // Normalize date and time to canonical formats
    this.date = toIsoDate(this.date);
    this.time = toHHmm(this.time);

    // Normalize arrays by trimming entries
    if (Array.isArray(this.agenda)) this.agenda = this.agenda.map((s) => s.trim()).filter(Boolean);
    if (Array.isArray(this.tags)) this.tags = this.tags.map((s) => s.trim()).filter(Boolean);

    // Ensure required strings are non-empty post-trim
    const mustHave: Array<keyof Pick<EventDocument, "title" | "description" | "overview" | "image" | "venue" | "location" | "mode" | "audience" | "organizer">> = [
      "title",
      "description",
      "overview",
      "image",
      "venue",
      "location",
      "mode",
      "audience",
      "organizer",
    ];
    for (const key of mustHave) {
      const val = String(this[key] ?? "").trim();
      if (!val) return next(new Error(`${key} is required and cannot be empty`));
    }

    // Ensure arrays remain non-empty after trimming
    if (!this.agenda?.length) return next(new Error("agenda must contain at least one item"));
    if (!this.tags?.length) return next(new Error("tags must contain at least one item"));

    next();
  } catch (err) {
    next(err as Error);
  }
});

export const Event: EventModel = (models.Event as EventModel) || model<EventDocument, EventModel>("Event", EventSchema);

export default Event;
