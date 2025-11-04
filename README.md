# DevEvent

The hub for developer events — discover hackathons, meetups, and conferences in one place.

## Tech Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- MongoDB with Mongoose
- PostHog analytics (optional)

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root:
   ```bash
   # Required
   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/<db>?retryWrites=true&w=majority

   # Optional (for analytics)
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
   App runs at http://localhost:3000

## Available Scripts
- `npm run dev` — start development server
- `npm run build` — build for production
- `npm run start` — start production server
- `npm run lint` — lint the codebase

## Features
- Responsive UI with event cards and categories
- API route to create events: `POST /api/events` (JSON or form-data)
- Strongly-typed Mongoose models for Events and Bookings

## Project Structure (high level)
- `app/` — routes, pages, and layout
- `components/` — UI components
- `lib/` — utilities (e.g., MongoDB connection)
- `database/` — Mongoose models
- `public/` — static assets (icons/images)

## Notes
- Ensure images referenced in `lib/constants.ts` exist under `public/images`.
- If using PostHog, Next rewrites are configured in `next.config.ts` under `/ingest`.
