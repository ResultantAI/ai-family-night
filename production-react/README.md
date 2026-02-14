# AI Family Night - Production React App

Professional family activity app with $9.99/mo premium subscription.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:5173
```

## Available Pages

- `/` - Landing page (marketing site)
- `/dashboard` - Account center (logged-in view)

## Tech Stack

- React 18
- Vite
- Tailwind CSS
- React Router
- Heroicons (SVG icons)
- Framer Motion (animations)

## Build for Production

```bash
npm run build
```

Outputs to `dist/` folder.

## Deploy to Vercel

```bash
npm install -g vercel
vercel deploy --prod
```

## Environment Variables

Create `.env.local`:

```bash
VITE_API_URL=http://localhost:3000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXX
```

## What's Built

✅ Landing page with pricing ($9.99/mo)
✅ Dashboard with account center
✅ Professional design (no emojis, SVG icons only)
✅ Mobile responsive
✅ Tailwind CSS styling

## What's Next

- Build authentication pages (Login/Signup)
- Build backend API
- Connect Stripe checkout
- Build game components
- Add analytics

See `PRODUCTION-ARCHITECTURE.md` for full roadmap.
