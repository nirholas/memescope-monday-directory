# Memescope Monday

**The community directory for Memescope Monday.**

Submit, discover, and upvote memecoins across Solana, Base, and BNB Chain. Every Monday at 10 AM UTC, the community rides together.

**Live at:** [memescope.monday.directory](https://memescope.monday.directory)

---

## Features

### Directory & Discovery
- Browse memecoins with search, chain filters (Solana/Base/BNB), and sort (votes, trending, newest)
- Existing coins and upcoming launches with launch countdown timers
- Featured and trending sections on the homepage
- Live countdown to the next Memescope Monday (10 AM UTC)

### Community
- **Upvoting** — one vote per user per coin, most upvoted rise to the top
- **Per-coin trollbox chat** — real-time(ish) chat on every coin detail page
- **Watchlists** — save coins to your personal watchlist
- **User accounts** — email + password auth with session cookies

### Market Data & Analysis
- **DexScreener chart embeds** — live charts on every existing coin
- **Live market data** — price, market cap, liquidity, volume, buy/sell ratio via DexScreener API
- **Safety Score** (A-F) — algorithmic risk assessment based on liquidity, trading activity, buy/sell ratio, social presence, pair age, community votes
- **Social Buzz Score** — hype level indicator (Dead → Low → Moderate → Hot → Viral)
- **News feed** — per-coin news with sentiment analysis (configurable via free-crypto-news API)

### Submit & Monetize
- Submit existing coins or upcoming launches
- **Auto-fill from contract address** — paste a contract address or PumpFun URL to auto-populate coin details
- **Paid features:**
  - Expedited Review ($19) — approved within 1 hour
  - Trending Placement ($49) — 24h in the trending section
  - Bundle ($59) — both features

### Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** SQLite via Turso (libsql) + Drizzle ORM
- **Styling:** Tailwind CSS
- **Auth:** Cookie-based sessions, bcrypt password hashing
- **APIs:** DexScreener (market data), configurable crypto news API
- **Deployment:** Vercel

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Local Development

```bash
# Clone the repo
git clone https://github.com/nirholas/memescope-monday-directory.git
cd memescope-monday-directory

# Install dependencies
npm install

# Run dev server (uses local SQLite file)
npm run dev
```

The app runs at `http://localhost:3000` with a local SQLite database that auto-seeds with sample data.

### Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `TURSO_DATABASE_URL` | Production | Turso database URL (e.g., `libsql://your-db.turso.io`) |
| `TURSO_AUTH_TOKEN` | Production | Turso auth token |
| `NOWPAYMENTS_API_KEY` | No | [NOWPayments](https://nowpayments.io) API key — crypto payments (200+ coins, no KYC) |
| `NOWPAYMENTS_IPN_SECRET` | No | NOWPayments IPN secret — verifies payment callbacks |
| `STRIPE_SECRET_KEY` | No | [Stripe](https://stripe.com) secret key — card payments |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook signing secret — verifies payment callbacks |
| `NEXT_PUBLIC_BASE_URL` | No | Site URL (default: `https://memescope.monday.directory`) |
| `CRYPTO_NEWS_API_URL` | No | [free-crypto-news](https://github.com/nirholas/free-crypto-news) instance URL |
| `ADMIN_SECRET` | No | Admin password for managing submissions |

**Payment providers:** Configure one or both. If both are set, users can choose between crypto and card. If neither is set, paid features run in demo mode (applied free).

---

## Deploy to Vercel

### 1. Create a Turso Database

```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Sign up / login
turso auth signup

# Create database
turso db create memescope-monday

# Get the URL
turso db show memescope-monday --url

# Create auth token
turso db tokens create memescope-monday
```

### 2. Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN

# Deploy to production
vercel --prod
```

Or connect the GitHub repo to Vercel and add the env vars in the Vercel dashboard.

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirholas%2Fmemescope-monday-directory&env=TURSO_DATABASE_URL,TURSO_AUTH_TOKEN&envDescription=Turso%20database%20credentials&project-name=memescope-monday&repository-name=memescope-monday-directory)

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx                    # Homepage (countdown, featured, trending, upcoming)
│   ├── coins/
│   │   ├── page.tsx                # Browse directory (search, filter, sort)
│   │   └── [slug]/page.tsx         # Coin detail (chart, market data, scores, chat)
│   ├── submit/page.tsx             # Submit form (auto-fill, paid features)
│   ├── login/page.tsx              # Sign in
│   ├── register/page.tsx           # Create account
│   ├── profile/page.tsx            # User profile
│   ├── watchlist/page.tsx          # Saved coins
│   └── api/
│       ├── auth/                   # Register, login, logout, me
│       ├── coins/                  # List, upvote, chat
│       ├── watchlist/              # Add, remove, check
│       ├── submit/                 # Submit new coin
│       ├── checkout/               # Paid features
│       ├── news/                   # News proxy
│       └── token-data/             # DexScreener proxy
├── components/
│   ├── Header.tsx                  # Nav with auth state
│   ├── Footer.tsx                  # Footer
│   ├── CoinCard.tsx                # Coin listing card with upvotes
│   ├── UpvoteButton.tsx            # Auth-gated voting
│   ├── WatchlistButton.tsx         # Save to watchlist
│   ├── ChartEmbed.tsx              # DexScreener iframe
│   ├── MarketData.tsx              # Live price/volume/liquidity
│   ├── SafetyScore.tsx             # A-F safety grade
│   ├── SocialBuzz.tsx              # Hype level indicator
│   ├── NewsFeed.tsx                # Per-coin news
│   ├── CoinChat.tsx                # Trollbox
│   ├── CountdownTimer.tsx          # Monday 10 AM UTC countdown
│   ├── LaunchCountdown.tsx         # Upcoming launch timer
│   ├── AutoFillAddress.tsx         # Contract address auto-fill
│   ├── PaidFeatures.tsx            # Expedited/trending purchase
│   ├── SubmitForm.tsx              # Full submit form
│   ├── SearchBar.tsx               # Search input
│   ├── ChainFilter.tsx             # Chain filter pills
│   ├── SortSelect.tsx              # Sort dropdown
│   ├── ChainBadge.tsx              # Chain label badge
│   └── AuthProvider.tsx            # Auth context
└── lib/
    ├── db/
    │   ├── schema.ts               # Drizzle schema (6 tables)
    │   ├── index.ts                # DB connection (Turso/local)
    │   └── seed.ts                 # Seed data
    ├── data.ts                     # All database queries
    ├── auth.ts                     # Auth (register, login, sessions)
    ├── types.ts                    # TypeScript types + constants
    ├── utils.ts                    # Utilities
    ├── dexscreener.ts              # DexScreener API client
    ├── news.ts                     # News feed service
    └── scoring.ts                  # Safety score + social buzz algorithms
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Email, username, bcrypt password hash |
| `sessions` | Token-based auth, 30-day expiry |
| `coins` | All listings with full metadata |
| `votes` | One vote per user per coin |
| `watchlist` | Per-user saved coins |
| `chat_messages` | Per-coin trollbox messages |

12 indexes for search and filter performance.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/logout` | Yes | Sign out |
| GET | `/api/auth/me` | Yes | Get current user |
| GET | `/api/coins` | No | List coins (filter by chain, search) |
| POST | `/api/coins/[slug]/upvote` | Yes | Upvote a coin |
| GET | `/api/coins/[slug]/chat` | No | Get chat messages |
| POST | `/api/coins/[slug]/chat` | No* | Send chat message (*username used if logged in) |
| POST | `/api/submit` | No | Submit a new coin |
| GET | `/api/checkout` | No | List available payment providers |
| POST | `/api/checkout` | No | Create checkout (NOWPayments / Stripe / demo) |
| POST | `/api/webhooks/nowpayments` | No | NOWPayments IPN callback |
| POST | `/api/webhooks/stripe` | No | Stripe webhook callback |
| GET | `/api/watchlist` | Yes | Get user's watchlist |
| POST | `/api/watchlist` | Yes | Add/remove from watchlist |
| GET | `/api/watchlist/check` | Yes | Check if coin is in watchlist |
| GET | `/api/news?q=` | No | Fetch coin news |
| GET | `/api/token-data?address=` | No | Fetch market data from DexScreener |

---

## Integrations

### DexScreener
Live market data and chart embeds. No API key needed. Auto-maps chains:
- Solana → `solana`
- Base → `base`
- BNB Chain → `bsc`

### free-crypto-news
Optional news feed integration. Deploy your own instance from [github.com/nirholas/free-crypto-news](https://github.com/nirholas/free-crypto-news) and set `CRYPTO_NEWS_API_URL`.

### Payments
- **NOWPayments** — set `NOWPAYMENTS_API_KEY` + `NOWPAYMENTS_IPN_SECRET` for crypto payments (SOL, BTC, ETH, USDC, 200+ coins). No KYC. Webhook: `/api/webhooks/nowpayments`
- **Stripe** — set `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` for card payments. Webhook: `/api/webhooks/stripe`
- **Both** — if both are configured, users choose between crypto and card at checkout
- **Neither** — paid features run in demo mode (applied immediately without payment)

---

## Scripts

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Lint with Next.js ESLint
```

---

## License

All rights reserved. See [LICENSE](LICENSE).
