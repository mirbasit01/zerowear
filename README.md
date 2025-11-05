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
- Complete REST API for events and bookings
- Advanced search and filtering
- Analytics dashboard data
- Image upload via Cloudinary
- Strongly-typed Mongoose models

## Project Structure (high level)
- `app/` — routes, pages, and layout
- `components/` — UI components
- `lib/` — utilities (e.g., MongoDB connection)
- `database/` — Mongoose models
- `public/` — static assets (icons/images)

## API Routes
- `GET /api/events` — list all events
- `POST /api/events` — create event (JSON/form-data with image upload)
- `GET /api/events/[slug]` — get single event
- `PUT /api/events/[slug]` — update event
- `DELETE /api/events/[slug]` — delete event
- `GET /api/events/search` — search/filter events
- `GET /api/bookings` — list bookings (optional ?eventId=...)
- `POST /api/bookings` — create booking
- `GET /api/stats` — analytics data
- `GET /api/categories` — unique tags/modes/locations

## Environment Variables
```bash
# Required
MONGODB_URI=mongodb+srv://...

# Optional (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Optional (for analytics)
NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
```

## Notes
- Ensure images referenced in `lib/constants.ts` exist under `public/images`.
- If using PostHog, Next rewrites are configured in `next.config.ts` under `/ingest`.
- Image uploads require Cloudinary credentials and use the nodejs runtime.
