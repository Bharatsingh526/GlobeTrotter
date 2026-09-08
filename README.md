# 🧭 GlobeTrotter — Personalized Multi-City Travel Planning

> A production-grade, full-stack web application for seamless multi-city travel planning, budgeting, route mapping, and step-by-step itinerary scheduling.

Built with **Next.js 14 App Router**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **MySQL 8+**, **Auth.js / NextAuth**, **Three.js (WebGL)**, and **Recharts**.

---

## 🌟 Key Features

- 🌍 **Interactive 3D WebGL Globe**:
  - Rotating low-poly interactive globe rendered with Three.js and React Three Fiber.
  - Interactive city nodes (Paris, Tokyo, Dubai, Rome, Bali, London, New York, Singapore) with hover cards and navigation hooks.
  - Automatic fallback to high-fidelity SVG projection on mobile devices or unsupported browsers.

- 🗓️ **Drag-and-Drop Itinerary Builder**:
  - Multi-city travel planner powered by `@dnd-kit/core` and `@dnd-kit/sortable`.
  - Day-by-day vertical timeline for scheduling activities with time slots, durations, custom costs, and personal notes.
  - Reorder activities within and across days with instant database synchronization.
  - Adaptive mobile layout with dedicated tab navigation.

- 💰 **Budget Analytics & Expense Tracking**:
  - Live cost tracking compiling scheduled activity costs and custom travel expenses.
  - Visual analytics powered by **Recharts**: Category Distribution Donut Chart and Daily Spending Timeline Bar Chart.
  - Intelligent over-budget alerts when daily expenditure targets are exceeded.
  - City-by-city cost breakdown and comprehensive expense ledger.

- 🗺️ **Interactive Route Map**:
  - Dynamic Mapbox GL integration displaying trip cities, custom markers, and route lines.
  - Built-in SVG coordinate projection engine that plots true latitude/longitude coordinates and animates flight-path connections without requiring an external API key.

- 🔍 **City & Activity Discovery Catalog**:
  - Explore curated international destinations with cost indices, popularity ratings, and rich descriptions.
  - Filter activities by category (*Adventure, Food, Culture, Nature, Nightlife, Shopping*), duration, and cost.
  - Add destinations and activities directly to existing trips with one click.
  - Save bucket-list destinations with persistent heart toggles.

- 🔗 **Public Trip Sharing & One-Click Cloning**:
  - Generate unique, secure public share links (`/shared/[slug]`).
  - Read-only showcase view for friends and fellow travelers.
  - One-click **"Copy Trip to Profile"** clones the full route, city stops, and scheduled activities to the logged-in user's account in a single atomic database transaction.

- 🛡️ **Role-Protected Admin Panel**:
  - Accessible only to users with the `ADMIN` role (protected via Next.js Middleware).
  - Real-time metrics: Total Users, Total Trips, Gross Spending Volume, and Average Trip Cost.
  - Interactive registration trends and trip creation volume charts.
  - Top 5 ranked destinations and booked activities.

- 🔐 **Authentication & Security**:
  - NextAuth.js credentials provider with salted password hashing using `bcryptjs`.
  - Next.js Route Middleware protecting `/dashboard`, `/trips`, `/profile`, and `/admin`.
  - Role-based access control (`OWNER`, `EDITOR`, `VIEWER`).

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | [Next.js 14 (App Router)](https://nextjs.org/) & [React 18](https://react.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate) |
| **Icons & UI Components** | [Lucide React](https://lucide.dev/), [Radix UI](https://www.radix-ui.com/) |
| **Database & ORM** | [MySQL 8+](https://www.mysql.com/) with [Prisma ORM 5](https://www.prisma.io/) |
| **Authentication** | [NextAuth.js v4](https://next-auth.js.org/) & [bcryptjs](https://github.com/dcodeIO/bcrypt.js) |
| **3D WebGL** | [Three.js](https://threejs.org/) & [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) / [@react-three/drei](https://github.com/pmndrs/drei) |
| **Drag and Drop** | [@dnd-kit/core](https://dndkit.com/) & [@dnd-kit/sortable](https://dndkit.com/) |
| **Charts & Visualizations** | [Recharts](https://recharts.org/) |
| **Mapping** | [Mapbox GL JS](https://www.mapbox.com/) with custom SVG projection fallback |
| **Form Validation** | [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/) |

---

## 📁 Project Structure

```
globetrotter/
├── app/
│   ├── layout.tsx                   # Root layout (Inter + Fraunces typography, Providers)
│   ├── page.tsx                     # Cinematic landing page with 3D Globe
│   ├── globals.css                  # Global Tailwind & design system variables
│   ├── providers.tsx                # NextAuth session context provider
│   ├── login/page.tsx               # Login page with Zod validation
│   ├── signup/page.tsx              # Signup page with automatic session signin
│   ├── dashboard/page.tsx           # Command center (trips, stats, bucket list)
│   ├── trips/
│   │   ├── page.tsx                 # My Trips catalog (search, filter, delete)
│   │   ├── new/page.tsx             # New trip creator with cover image picker
│   │   └── [id]/
│   │       ├── page.tsx             # Comprehensive trip itinerary overview
│   │       ├── ClientViewToggler.tsx# List view vs. Calendar view toggle
│   │       ├── PublicShareWidget.tsx# Share link generator and clipboard copier
│   │       ├── builder/page.tsx     # Drag-and-drop itinerary builder
│   │       └── budget/page.tsx      # Budget analytics with Recharts
│   ├── explore/
│   │   ├── cities/page.tsx          # Global city discovery & "Add to Trip"
│   │   └── activities/page.tsx      # Categorized activity explorer
│   ├── shared/[slug]/
│   │   ├── page.tsx                 # Public read-only trip viewer
│   │   └── CloneTripButton.tsx      # One-click trip clone to profile
│   ├── profile/page.tsx             # Profile settings, bucket list, account removal
│   ├── admin/
│   │   ├── page.tsx                 # Role-protected admin metrics server page
│   │   └── AdminDashboardClient.tsx # Analytics charts & popular ranking tables
│   └── api/
│       ├── auth/
│       │   ├── [...nextauth]/route.ts # NextAuth route handler
│       │   └── signup/route.ts        # User registration endpoint
│       ├── trips/
│       │   ├── route.ts               # GET user trips / POST create trip
│       │   └── [id]/
│       │       ├── route.ts           # GET, PATCH, DELETE single trip
│       │       ├── clone/route.ts     # Deep clone trip transaction
│       │       ├── stops/route.ts     # Manage & reorder trip stops
│       │       ├── stops/[stopId]/route.ts # Edit / delete single stop
│       │       ├── activities/route.ts     # Add / reorder itinerary activities
│       │       ├── activities/[itemId]/route.ts # Update schedule / delete activity
│       │       └── expenses/route.ts  # Trip expenses ledger endpoint
│       ├── cities/route.ts            # Search and filter cities
│       ├── activities/route.ts        # Search and filter activities catalog
│       ├── saved-destinations/
│       │   ├── route.ts               # GET saved / POST save destination
│       │   └── [id]/route.ts          # DELETE unsave destination
│       └── shared/route.ts            # Toggle public status & generate slug
├── components/
│   ├── 3d/InteractiveGlobe.tsx      # WebGL 3D Globe with SVG fallback
│   ├── map/TripMap.tsx              # Mapbox GL map + SVG flight-path projector
│   ├── itinerary/ItineraryBuilder.tsx # Core dnd-kit itinerary drag-and-drop
│   └── navigation/Navbar.tsx        # Dynamic responsive navigation bar
├── lib/
│   ├── prisma.ts                    # Global Prisma client singleton
│   ├── auth.ts                      # NextAuth configuration options
│   ├── validations.ts               # Zod validation schemas
│   └── utils.ts                     # Styling, date & currency formatters
├── prisma/
│   ├── schema.prisma                # Normalized MySQL database schema
│   └── seed.ts                      # Seed data: 12 cities, 40+ activities, test users
├── types/
│   └── next-auth.d.ts               # NextAuth session type declarations
├── middleware.ts                    # Protected routes middleware
├── tailwind.config.js               # Editorial theme colors & typography
├── tsconfig.json                    # TypeScript compiler configuration
└── package.json
```

---

## 🗄️ Database Schema

The relational database is modeled with Prisma and deployed on MySQL 8+:

- **`users`**: Account identity, email, hashed password, role (`USER`, `ADMIN`).
- **`profiles`**: User profile, display name, avatar URL, language preference.
- **`trips`**: Travel records, title, description, cover image, dates, public share slug.
- **`trip_members`**: Trip collaboration roles (`OWNER`, `EDITOR`, `VIEWER`).
- **`cities`**: Global cities with coordinates, region, cost index, and popularity.
- **`trip_stops`**: Ordered city stops within each trip.
- **`activities`**: Activity catalog categorized into *Adventure, Food, Culture, Nature, Nightlife, Shopping*.
- **`itinerary_items`**: Activities scheduled into specific days and stops with order and custom costs.
- **`expenses`**: Categorized expense ledger (*Transport, Accommodation, Activity, Food, Other*).
- **`saved_destinations`**: User bucket-list destinations (unique per user/city).
- **`shared_trips`**: Public share slugs mapped to trips.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.x or higher
- **MySQL**: 8.0 or higher running on port `3306`

### 2. Installation

Clone the repository and install dependencies:
```bash
git clone https://github.com/malay1197/odoo-LDCE-hackathon-GlobeTrotter.git
cd odoo-LDCE-hackathon-GlobeTrotter
npm install --legacy-peer-deps
```

### 3. Environment Setup

Create a `.env` file in the root directory (based on `.env.example`):
```env
DATABASE_URL="mysql://root:password@localhost:3306/globetrotter"
NEXTAUTH_SECRET="globetrotter-super-secret-key-2026"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Mapbox token (an interactive SVG fallback is used if not provided)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=""
```

### 4. Database Initialization & Seeding

Create the database in MySQL:
```sql
CREATE DATABASE IF NOT EXISTS globetrotter;
```

Push the Prisma schema to MySQL and seed realistic destinations and activities:
```bash
npx prisma db push
npx ts-node prisma/seed.ts
```

### 5. Run the Application

**Development Mode:**
```bash
npm run dev
```

**Production Build:**
```bash
npm run build
npm start
```

Visit **`http://localhost:3000`** in your browser.

---

## 👥 Default Test Accounts

After running the seed script, the following accounts are pre-configured:

| Role | Email | Password | Access |
|---|---|---|---|
| **Standard User** | `user@globetrotter.com` | `password123` | Dashboard, Itinerary Builder, Budget, Explore |
| **Administrator** | `admin@globetrotter.com` | `password123` | Full access + Admin Operations Dashboard |

---

## 📄 License

This project was built for the **Odoo LDCE Hackathon**. All rights reserved.
