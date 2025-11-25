

import mongoose, { type Mongoose } from "mongoose";

// Shape of our cached connection object stored on the Node.js global
type CachedConnection = {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
};

 declare global {
  // eslint-disable-next-line no-var
  var mongooseConn: CachedConnection | undefined;
}

// Read the connection string from environment variables
const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Fail fast during app startup instead of on first request
  throw new Error(
    "Missing environment variable: MONGODB_URI. Set it to your MongoDB connection string.",
  );
}

// Use an existing cached connection (when hot reloading in dev) or initialize the cache
const cached: CachedConnection = global.mongooseConn ?? { conn: null, promise: null };
// Always assign back so subsequent imports share the same reference
global.mongooseConn = cached;

/**
 * Establishes a singleton Mongoose connection.
 * - Returns the active Mongoose instance
 * - Reuses the same connection across hot reloads and route invocations
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // If a connection already exists, reuse it
  if (cached.conn) return cached.conn;

  // Set safe global defaults before connecting
  // Avoid buffering model operations if the connection drops
  mongoose.set("bufferCommands", false);
  // Keep Mongoose queries strict for predictable behavior
  mongoose.set("strictQuery", true);

  if (!cached.promise) {
    // Create the initial connection promise and cache it to avoid concurrent connects
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10, // tune based on workload / serverless constraints
      serverSelectionTimeoutMS: 10_000,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Returns the current Mongoose instance if already connected; otherwise null.
 * Useful in rare cases where you need access without forcing a new connection.
 */
export function getMongoose(): Mongoose | null {
  return cached.conn;
}

export default connectToDatabase;
