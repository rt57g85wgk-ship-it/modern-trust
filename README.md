# Modern Trust

A modern rental property marketplace for Bangkok, Thailand. Modern Trust connects renters with verified landlords through smart AI-powered search, transparent pricing, and a bilingual (English/Thai) interface.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the App](#running-the-app)
- [Building for Production](#building-for-production)
- [Deploying to Cloudflare](#deploying-to-cloudflare)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)

---

## Project Overview

Modern Trust is a full-stack web application built with TanStack Start and deployed on Cloudflare Workers. It serves two types of users:

- **Renters** — search, filter, and save rental properties with smart match scoring
- **Landlords** — list and manage properties, promote listings, and receive leads via VoiceBot

The platform uses Supabase for authentication, database, and file storage.

---

## Features

### For Renters
- **Smart Search** — Filter by location, budget (with visual histogram slider), property type, room layout, lease term, pet-friendly policy, and amenities
- **AI-Powered Match Scoring** — Listings are ranked by how closely they match your saved preferences
- **Best Match Section** — Top 3 personalized results highlighted at the top
- **Save Preferences** — Search preferences are saved to localStorage and synced to Supabase when logged in
- **Saved Listings (Favorites)** — Bookmark properties to revisit later
- **Recently Viewed** — Track which properties you've looked at
- **Trust Score** — Profile completeness score based on verification, photo, phone, bio, and lifestyle tags
- **Identity Verification** — Upload documents to verify your identity
- **Public Profile** — Share your renter profile with landlords

### For Landlords
- **Listing Management** — Create, edit, and delete property listings (Condo, Apartment, Dormitory, House)
- **Photo Uploads** — Drag-and-drop image upload to Supabase Storage (up to 5 images per listing, 5MB each)
- **Utility Rate Settings** — Specify electricity and water rates (government rate or fixed rate per unit)
- **Listing Promotion** — Pay to promote a listing so it appears at the top of search results
- **Direct Call Feature** — Premium add-on (฿199/month) to show your phone number on listings
- **Availability Toggle** — Mark rooms as available or occupied in real time
- **VoiceBot Integration** — Receive inbound voice leads from the AI receptionist with LINE and Email notifications
- **Revenue & Occupancy Stats** — Dashboard showing monthly revenue, active bookings, and occupancy rate

### Platform
- **Google OAuth + Email/Password Auth** — Sign in with Google or email via Supabase Auth
- **Bilingual UI** — Full English and Thai (ภาษาไทย) support via i18next
- **Animated Transitions** — Smooth page and component animations with Framer Motion
- **Responsive Design** — Works on mobile, tablet, and desktop
- **Dark/Light Mode** — System-aware color scheme via Tailwind CSS
- **SEO Friendly** — Each page sets proper Open Graph meta tags

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [TanStack Start](https://tanstack.com/start) (React 19 + SSR) |
| Router | [TanStack Router](https://tanstack.com/router) (file-based routing) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage) |
| Auth | Supabase Auth (Email/Password + Google OAuth) |
| Deployment | [Cloudflare Workers](https://workers.cloudflare.com) via Wrangler |
| Runtime | [Bun](https://bun.sh) |
| State / Data | TanStack Query v5 |
| Animations | Framer Motion |
| Charts | Recharts |
| Forms | React Hook Form + Zod |
| i18n | i18next + react-i18next |
| Notifications | LINE Messaging API + Resend (email) |
| Build Tool | Vite 7 |

---

## Prerequisites

- [Bun](https://bun.sh) >= 1.x (or Node.js >= 20.x with npm)
- A [Supabase](https://supabase.com) project
- Google Cloud project with OAuth 2.0 credentials (for "Sign in with Google")
- A [Cloudflare](https://cloudflare.com) account (for production deployment)
- Optional: [Resend](https://resend.com) API key (email notifications)
- Optional: LINE Messaging API channel access token (LINE notifications)

---

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd modern-trust

# 2. Install dependencies
bun install

# 3. Copy the environment template
cp .env.example .env
```

---

## Environment Variables

Edit the `.env` file and fill in your credentials:

```env
# Supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Google OAuth (create credentials in Google Cloud Console)
# Add your dev URL (e.g. http://localhost:3000) as an authorized JavaScript origin
VITE_GOOGLE_CLIENT_ID=<your-google-client-id>
```

For Cloudflare Workers deployment, set these as **Worker Secrets / Environment Variables** in `wrangler.jsonc` or via the Cloudflare dashboard:

```
LINE_CHANNEL_ACCESS_TOKEN   # LINE Messaging API (for VoiceBot notifications)
RESEND_API_KEY              # Resend email API (for VoiceBot notifications)
```

---

## Database Setup

Run the SQL migration files in your Supabase SQL editor in this order:

```bash
# Core tables (rooms, buildings, etc.) — set up your Supabase project schema first,
# then run the following migration files from the project root:

1. create_tenant_requirements.sql   # Tenant search preferences table
2. create_voice_leads.sql           # VoiceBot inbound lead capture table
3. add_promoted_column.sql          # Promoted flag on rooms
4. add_landlord_contact_columns.sql # Landlord contact info columns
5. add_notification_preferences.sql # Notify via LINE / Email toggles
6. add_phone_contact_enabled.sql    # Direct Call feature flag
7. add_virtual_phone_to_users.sql   # Virtual phone number for VoiceBot receptionist
```

You also need to create a **Supabase Storage bucket** named `room-images` with public read access for landlord photo uploads.

---

## Running the App

```bash
# Start the development server
bun run dev
```

The app will be available at `http://localhost:3000` (or the port shown in your terminal).

```bash
# Lint
bun run lint

# Format
bun run format
```

---

## Building for Production

```bash
bun run build
```

The output goes to `.output/` and `.wrangler/`, ready for Cloudflare Workers.

---

## Deploying to Cloudflare

This app is configured for Cloudflare Workers via `wrangler.jsonc`.

```bash
# Install Wrangler globally if you haven't
bun add -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
wrangler deploy
```

Set your environment secrets via the Cloudflare dashboard or:

```bash
wrangler secret put VITE_SUPABASE_URL
wrangler secret put VITE_SUPABASE_ANON_KEY
wrangler secret put LINE_CHANNEL_ACCESS_TOKEN
wrangler secret put RESEND_API_KEY
```

---

## API Endpoints

### `POST /api/webhook/voicebot`

Receives inbound call data from a VoiceBot AI system, records the lead, and notifies the property owner via LINE and/or email.

**Request Body:**

```json
{
  "caller_phone": "+66812345678",
  "room_id": "uuid-of-the-room",
  "to_phone": "+66891234567",
  "transcript": "I am interested in renting...",
  "audio_url": "https://..."
}
```

- `caller_phone` — required
- `room_id` — UUID of the specific room listing (optional if `to_phone` is provided)
- `to_phone` — virtual phone number mapped to a landlord (optional if `room_id` is provided)

**Response:**

```json
{ "success": true, "message": "Lead recorded successfully" }
```

The lead is saved to the `voice_leads` table in Supabase. If the owner has LINE or email notifications enabled, a notification is sent asynchronously.

---

## Project Structure

```
modern-trust/
├── src/
│   ├── routes/                 # File-based routes (TanStack Router)
│   │   ├── __root.tsx          # Root layout (Navbar, Footer, Providers)
│   │   ├── index.tsx           # Landing page + property search
│   │   ├── dashboard.tsx       # Renter & Landlord dashboards
│   │   ├── account.tsx         # Account settings & profile
│   │   ├── property.$id.tsx    # Property detail page
│   │   ├── profile.$id.tsx     # Public user profile
│   │   ├── login.tsx           # Sign in page
│   │   └── register.tsx        # Sign up page
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   ├── Footer.tsx          # Site footer
│   │   ├── PropertyCard.tsx    # Listing card + skeleton
│   │   ├── ChatWidget.tsx      # Chat/support widget
│   │   ├── PromoteModal.tsx    # Listing promotion purchase modal
│   │   ├── AmenitiesPicker.tsx # Amenity checkbox picker
│   │   ├── GoogleAuthButton.tsx
│   │   └── EmailPasswordForm.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client
│   │   ├── supabase-listings.ts# Fetch & map listings from Supabase
│   │   ├── app-context.tsx     # Global auth & user state (React Context)
│   │   ├── listing-match.ts    # Smart match scoring algorithm
│   │   ├── amenities.ts        # Amenity option constants
│   │   ├── property-form.ts    # Property form helpers & constants
│   │   ├── profiles.ts         # Profile utility functions
│   │   ├── i18n.ts             # i18next configuration
│   │   └── utils.ts            # Tailwind cn() utility
│   ├── locales/
│   │   ├── en.json             # English translations
│   │   └── th.json             # Thai translations
│   ├── server.ts               # Cloudflare Worker entry + VoiceBot webhook
│   └── router.tsx              # TanStack Router setup
├── public/                     # Static assets
├── *.sql                       # Database migration files
├── .env.example                # Environment variable template
├── wrangler.jsonc              # Cloudflare Workers configuration
├── vite.config.ts              # Vite + TanStack plugin config
├── tsconfig.json
└── package.json
```

---

## How to Use

### As a Renter

1. Go to the homepage and enter your desired location in the search bar.
2. Set your budget using the price range slider.
3. Optionally expand **More Options** to filter by room layout, pet policy, lease term, distance, and amenities.
4. Click **Find Room** — the top 3 best-matching listings appear as "Personalized Picks," followed by all available listings.
5. Click any property card to view full details, photos, and amenities.
6. Sign up or log in to save favorites and sync your preferences across devices.

### As a Landlord

1. Register or log in, then switch your role to **Landlord** from the Dashboard.
2. Click **Add Listing** to create a new room with photos, price, amenities, and utility rates.
3. Toggle listings between **Available** and **Occupied**.
4. Use the **Promote** button to boost your listing to the top of search results.
5. Enable **Direct Call** (฿199/month) to show your phone number on your listings.
6. Leads from the VoiceBot are automatically sent to your LINE or email if notifications are configured in Account Settings.
