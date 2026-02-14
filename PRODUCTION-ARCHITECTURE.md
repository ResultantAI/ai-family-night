# AI Family Night - Production Architecture

## Pricing
**$9.99/month** - Professional tier with weekly game releases

## Tech Stack

### Frontend
- **Framework:** React 18 + Vite
- **Styling:** Tailwind CSS
- **Icons:** Heroicons (high-quality SVGs)
- **Animation:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **State:** Zustand (lightweight state management)
- **Auth:** JWT tokens stored in httpOnly cookies

### Backend
- **Runtime:** Node.js 20
- **Framework:** Express.js
- **Database:** PostgreSQL 15 (Supabase or Neon)
- **ORM:** Prisma
- **Auth:** Passport.js + JWT
- **File Storage:** AWS S3 or Cloudinary
- **Email:** SendGrid or Resend
- **Payments:** Stripe

### Infrastructure
- **Hosting:** Vercel (frontend + API routes)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **CDN:** Cloudflare
- **Monitoring:** Sentry + LogRocket
- **Analytics:** Plausible or PostHog

## Application Structure

```
ai-family-night/
├── frontend/                 # React app
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Landing.jsx           # Marketing page
│   │   │   ├── Login.jsx             # Auth
│   │   │   ├── Signup.jsx            # Auth
│   │   │   ├── Dashboard.jsx         # Account center
│   │   │   ├── GameLibrary.jsx       # Browse games
│   │   │   ├── GameView.jsx          # Play individual game
│   │   │   ├── Gallery.jsx           # User's saved creations
│   │   │   ├── Settings.jsx          # Account settings
│   │   │   └── Billing.jsx           # Subscription management
│   │   ├── components/
│   │   │   ├── games/
│   │   │   │   ├── ComicCreator.jsx
│   │   │   │   ├── HeartHunt.jsx
│   │   │   │   ├── PresidentialTrivia.jsx
│   │   │   │   ├── LoveSong.jsx
│   │   │   │   └── TimeMachine.jsx
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── Footer.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   └── Input.jsx
│   │   │   └── UpgradePrompt.jsx
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── useSubscription.js
│   │   │   └── useGames.js
│   │   ├── store/
│   │   │   └── authStore.js
│   │   └── lib/
│   │       ├── api.js
│   │       └── stripe.js
│   └── public/
│       └── icons/              # SVG icon library
│
├── backend/                  # Node.js API
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── games.js
│   │   │   ├── drawings.js
│   │   │   ├── stripe.js
│   │   │   └── users.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── subscription.js
│   │   ├── services/
│   │   │   ├── stripe.service.js
│   │   │   ├── email.service.js
│   │   │   └── storage.service.js
│   │   └── prisma/
│   │       └── schema.prisma
│   └── server.js
│
└── docs/
    ├── API.md
    └── DEPLOYMENT.md
```

## Database Schema

```prisma
// prisma/schema.prisma

model User {
  id                String   @id @default(uuid())
  email             String   @unique
  passwordHash      String
  firstName         String?
  lastName          String?
  avatarUrl         String?

  // Subscription
  stripeCustomerId  String?  @unique
  subscriptionStatus String? // active, trialing, past_due, canceled
  subscriptionId    String?
  trialEndsAt       DateTime?
  subscriptionEndsAt DateTime?

  // Metadata
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  lastLoginAt       DateTime?

  // Relations
  children          Child[]
  drawings          Drawing[]
  gameProgress      GameProgress[]
}

model Child {
  id          String   @id @default(uuid())
  userId      String
  name        String
  age         Int
  avatarUrl   String?
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  drawings    Drawing[]
}

model Game {
  id            String   @id @default(uuid())
  slug          String   @unique
  title         String
  description   String
  iconUrl       String
  coverImageUrl String?
  durationMinutes Int
  isPremium     Boolean  @default(false)
  releaseDate   DateTime
  difficulty    String   // easy, medium, hard
  category      String   // creative, trivia, storytelling
  sortOrder     Int      @default(0)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  gameProgress  GameProgress[]
}

model GameProgress {
  id          String   @id @default(uuid())
  userId      String
  gameId      String
  completed   Boolean  @default(false)
  completedAt DateTime?
  savedData   Json?    // Game-specific save state

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@unique([userId, gameId])
}

model Drawing {
  id          String   @id @default(uuid())
  userId      String
  childId     String?
  gameId      String?
  title       String?
  imageUrl    String
  thumbnailUrl String?
  caption     String?
  isPublic    Boolean  @default(false)
  approved    Boolean  @default(false)
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  child       Child?   @relation(fields: [childId], references: [id], onDelete: SetNull)
}

model WeeklyRelease {
  id          String   @id @default(uuid())
  weekStartDate DateTime @unique
  gameId      String?
  emailSent   Boolean  @default(false)
  emailSentAt DateTime?
  createdAt   DateTime @default(now())
}
```

## API Endpoints

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
POST   /api/auth/refresh
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
```

### Subscription & Billing
```
POST   /api/stripe/create-checkout-session
POST   /api/stripe/create-portal-session
POST   /api/stripe/webhook
GET    /api/subscription/status
POST   /api/subscription/cancel
```

### Games
```
GET    /api/games                    # List all games (filtered by subscription)
GET    /api/games/:slug              # Get game details
GET    /api/games/:slug/start        # Initialize game session
POST   /api/games/:slug/save         # Save progress
POST   /api/games/:slug/complete     # Mark complete
```

### User Profile & Children
```
GET    /api/profile
PATCH  /api/profile
POST   /api/children
GET    /api/children
PATCH  /api/children/:id
DELETE /api/children/:id
```

### Drawings & Gallery
```
POST   /api/drawings/upload
GET    /api/drawings
GET    /api/drawings/:id
DELETE /api/drawings/:id
PATCH  /api/drawings/:id/publish
GET    /api/gallery/public           # Public approved drawings
```

## Page Layouts

### 1. Landing Page (Unauthenticated)

**URL:** `/`

**Sections:**
- Hero with value proposition
- Feature comparison (Free vs Premium)
- Game preview cards (with "locked" state for premium)
- Social proof (testimonials)
- Pricing table ($9.99/mo)
- FAQ
- Footer

**CTAs:**
- "Start Free Trial" (primary)
- "See All Games" (secondary)

### 2. Dashboard (Account Center)

**URL:** `/dashboard`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header (Logo | Search | Profile Menu)  │
├─────────────────────────────────────────┤
│                                         │
│  Welcome back, [Name]                   │
│  ┌──────────────────────────────────┐  │
│  │ Subscription Status              │  │
│  │ Premium - Active                 │  │
│  │ Next billing: Mar 15, 2026       │  │
│  └──────────────────────────────────┘  │
│                                         │
│  This Week's Game                       │
│  ┌──────────────────────────────────┐  │
│  │  [Game Preview Card]             │  │
│  │  Presidential Time Machine       │  │
│  │  Released Feb 20                 │  │
│  └──────────────────────────────────┘  │
│                                         │
│  Your Children                          │
│  [Child Card] [Child Card] [+ Add]      │
│                                         │
│  Recent Creations                       │
│  [Gallery Thumbnails]                   │
│                                         │
└─────────────────────────────────────────┘
```

### 3. Game Library

**URL:** `/games`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Header                                 │
├─────────────────────────────────────────┤
│  Filters: [All] [Creative] [Trivia]    │
│           [Easy] [Medium] [Hard]        │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Game │  │ Game │  │ Game │          │
│  │  1   │  │  2   │  │  3   │          │
│  └──────┘  └──────┘  └──────┘          │
│                                         │
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │ Game │  │ Game │  │ Game │          │
│  │  4   │  │  5   │  │🔒 6  │ (locked) │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

### 4. Individual Game View

**URL:** `/games/:slug`

**Layout:**
```
┌─────────────────────────────────────────┐
│  ← Back to Games                        │
├─────────────────────────────────────────┤
│  Presidential Time Machine              │
│  20 minutes • Medium difficulty         │
├─────────────────────────────────────────┤
│  [Game Interface Component]             │
│                                         │
│  Interactive elements here...           │
│                                         │
├─────────────────────────────────────────┤
│  [Upload Drawing] [Print] [Save]        │
└─────────────────────────────────────────┘
```

### 5. Account Settings

**URL:** `/settings`

**Tabs:**
- Profile
- Subscription & Billing
- Children
- Notifications
- Privacy

## SVG Icon System

Using **Heroicons** (https://heroicons.com) for all UI icons:

### Navigation Icons
- `HomeIcon` - Dashboard
- `SparklesIcon` - Games
- `PhotoIcon` - Gallery
- `CogIcon` - Settings
- `CreditCardIcon` - Billing

### Game Category Icons
- `PaintBrushIcon` - Creative
- `AcademicCapIcon` - Trivia
- `BookOpenIcon` - Storytelling
- `PuzzlePieceIcon` - Puzzle

### Action Icons
- `PlayIcon` - Start game
- `LockClosedIcon` - Premium locked
- `CloudArrowUpIcon` - Upload
- `PrinterIcon` - Print
- `ShareIcon` - Share

### Status Icons
- `CheckCircleIcon` - Completed
- `ClockIcon` - Duration
- `StarIcon` - Premium
- `BoltIcon` - New

**Implementation:**
```jsx
import { SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline'

<SparklesIcon className="w-6 h-6 text-purple-600" />
```

## Color Palette (Professional)

```css
/* Primary - Purple (Premium feel) */
--primary-50: #faf5ff;
--primary-100: #f3e8ff;
--primary-500: #a855f7;
--primary-600: #9333ea;
--primary-700: #7e22ce;

/* Accent - Emerald (Growth, family) */
--accent-50: #ecfdf5;
--accent-100: #d1fae5;
--accent-500: #10b981;
--accent-600: #059669;

/* Neutral */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;

/* Semantic */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;
```

## Typography

**Font Stack:**
- **Headings:** Inter (weight 700)
- **Body:** Inter (weight 400, 500)
- **Code:** JetBrains Mono

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
```

## Environment Variables

```bash
# Frontend (.env.local)
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXX

# Backend (.env)
DATABASE_URL=postgresql://user:pass@host:5432/dbname
JWT_SECRET=random-256-bit-string
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=another-random-string

STRIPE_SECRET_KEY=sk_live_XXX
STRIPE_WEBHOOK_SECRET=whsec_XXX
STRIPE_PRICE_ID=price_XXX  # $9.99/mo

AWS_ACCESS_KEY_ID=XXX
AWS_SECRET_ACCESS_KEY=XXX
AWS_S3_BUCKET=ai-family-night-uploads
AWS_REGION=us-east-1

SENDGRID_API_KEY=SG.XXX
FROM_EMAIL=noreply@aifamilynight.com

NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://aifamilynight.com
```

## Deployment Flow

### Development
```bash
# Frontend
cd frontend
npm run dev        # http://localhost:5173

# Backend
cd backend
npm run dev        # http://localhost:3000
```

### Staging
- **Frontend:** Auto-deploy from `develop` branch to Vercel
- **Backend:** Railway or Render (auto-deploy)
- **Database:** Supabase (staging project)

### Production
- **Frontend:** Vercel (custom domain)
- **Backend:** Vercel serverless functions or Railway
- **Database:** Supabase (production project)
- **CDN:** Cloudflare

## Monitoring & Analytics

### Error Tracking
- **Sentry** - Frontend + backend error monitoring
- Budget: $26/mo (Team plan)

### User Analytics
- **PostHog** - Privacy-friendly analytics
- Events to track:
  - Page views
  - Game starts
  - Game completions
  - Drawing uploads
  - Subscription events
- Budget: $0 (1M events/mo free)

### Performance
- **Vercel Analytics** - Web Vitals
- **Lighthouse CI** - Automated performance audits

## Security Checklist

- [ ] HTTPS everywhere
- [ ] httpOnly cookies for tokens
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input validation (Zod schemas)
- [ ] SQL injection protection (Prisma)
- [ ] XSS protection (React auto-escaping)
- [ ] File upload validation (type, size)
- [ ] Helmet.js security headers
- [ ] Regular dependency updates

## Cost Breakdown (Monthly)

| Service | Plan | Cost |
|---------|------|------|
| Vercel | Pro | $20 |
| Supabase | Pro | $25 |
| AWS S3 | Pay-as-you-go | $5 |
| SendGrid | Essentials | $20 |
| Sentry | Team | $26 |
| Domain | .com | $1 |
| **Total** | | **$97/mo** |

**Break-even:** 10 paying subscribers ($99.90 revenue)

## Launch Checklist

### Pre-Launch (Week 1-2)
- [ ] Set up Vercel project
- [ ] Set up Supabase database
- [ ] Configure Stripe product + price ($9.99/mo)
- [ ] Set up SendGrid sender verification
- [ ] Register domain
- [ ] Set up Cloudflare

### Development (Week 3-6)
- [ ] Build authentication flow
- [ ] Implement Stripe checkout + webhooks
- [ ] Build 2-3 premium games
- [ ] Build landing page
- [ ] Build account dashboard
- [ ] Image upload system
- [ ] Email notification system

### Testing (Week 7)
- [ ] End-to-end testing (Playwright)
- [ ] Mobile responsiveness
- [ ] Payment flow testing (Stripe test mode)
- [ ] Email delivery testing
- [ ] Performance testing (Lighthouse)

### Launch (Week 8)
- [ ] Deploy to production
- [ ] DNS configuration
- [ ] SSL certificate
- [ ] Sentry monitoring active
- [ ] Analytics tracking live
- [ ] Beta user invites (10-20 families)

## Success Metrics (Month 1)

| Metric | Target |
|--------|--------|
| Signups | 100 |
| Free trial starts | 20 |
| Trial → Paid conversion | 40% (8 subscribers) |
| MRR | $79.92 |
| Game completion rate | 60% |
| Return user rate | 40% |

## Next Steps

1. Create landing page design (Figma)
2. Build React app structure
3. Set up backend + database
4. Implement Stripe integration
5. Build first 2-3 games
6. Deploy to staging
7. Beta test with 10 families
8. Launch publicly
