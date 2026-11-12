# Liliw Virtual Guide — Source Code

The web application behind the Liliw Virtual Guide, an AI-driven Progressive Web Application for cultural heritage and tourism information management for Liliw CHATO.

**Live system:** https://visitliliw.vercel.app/

## Tech Stack

| Area | Technology |
|---|---|
| Framework | Next.js (App Router), React, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Database & auth | Supabase (PostgreSQL with row-level security) |
| AI | Groq (chat assistant and itinerary planner) |
| Maps | Mapbox GL / react-map-gl |
| Media | Cloudinary (images, video, narration audio) |
| 3D | three.js, React Three Fiber, drei |
| Email | Nodemailer (SMTP) |
| Hosting | Vercel (deploys automatically on every push to `main`) |

## Requirements

- Node.js 20 LTS or newer, and npm
- Git
- Accounts / API keys for Supabase, Groq, Mapbox, Cloudinary and an SMTP mail sender

## Installation

```bash
# 1. Clone the repository and open the app folder
git clone https://github.com/TyrCoder/Liliw-Virtual-Guide.git
cd Liliw-Virtual-Guide/liliw-virtual-guide

# 2. Install dependencies
npm install

# 3. Create the environment file
#    Create a file named .env.local in this folder with the keys listed below

# 4. Start the development server
npm run dev
```

Open http://localhost:3000 in your browser.

## Environment Variables

The app is configured entirely through environment variables in `.env.local`. They are not committed to the repository because they contain secret keys.

| Group | Purpose |
|---|---|
| Database connection | Supabase URL and keys |
| AI service | Groq API key and model name |
| Maps | Mapbox public access token |
| Media hosting | Cloudinary account name and upload credentials |
| Email | SMTP account for verification codes and notifications |
| Site identity | The deployment's public URL (used in emails and QR codes) |
| Administration | Email addresses granted admin access on first sign-in |
| Session security | Secret key used to sign staff session cookies |
| Optional services | Search indexing and external reviews (disabled if not set) |

Variables starting with `NEXT_PUBLIC_` are visible to the browser; all others stay on the server.

## Database Setup

The database schema is in [`supabase/`](supabase/) as numbered migration files (`phase1-…sql` to `phase37-…sql`). Run them **in numeric order** against a fresh Supabase project to build all tables, security rules and default data. Each file can be safely re-run.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production (also stamps the service worker version) |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

## Project Structure

| Path | Contents |
|---|---|
| `src/app/` | Pages and API routes |
| `src/components/` | Reusable UI components |
| `src/context/`, `src/hooks/`, `src/lib/` | Shared state, hooks and helpers |
| `public/` | Static files, PWA manifest, service worker, 3D models, audio |
| `supabase/` | Database migration files |
| `scripts/` | Maintenance scripts (backups, migrations, AI prompt tests) |
| `docs/` | System documentation, diagrams and testing logs |

## Documentation

- [System Manual](../setup-and-user-guides/Liliw-Virtual-Guide-System-Manual.pdf) and [User Manual](../setup-and-user-guides/Liliw-Virtual-Guide-User-Manual.pdf) (PDF)
- [System architecture](docs/system-architecture.md)
- [System flows and diagrams](docs/flowchart.html), viewable at https://tyrcoder.github.io/Liliw-Virtual-Guide/liliw-virtual-guide/docs/flowchart.html
