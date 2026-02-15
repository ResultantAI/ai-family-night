# ElevenLabs Text-to-Speech Setup

High-quality AI voices for the ReadAloud feature.

## 1. Get Your Free API Key

1. Go to https://elevenlabs.io/
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Go to **Profile** → **API Keys**
5. Click **"Create API Key"**
6. Copy the key (starts with `sk_...`)

**Free Tier:**
- 10,000 characters/month
- ~20 full stories
- Commercial license included
- No credit card required

---

## 2. Add API Key to Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `ELEVENLABS_API_KEY`
   - **Value:** `sk_...` (your API key from step 1)
   - **Environment:** Production, Preview, Development
3. Click **Save**

---

## 3. Redeploy

After adding the environment variable:

```bash
npx vercel --prod
```

Then assign domains:
```bash
npx vercel alias set [deployment-url] aifamilynight.com
npx vercel alias set [deployment-url] www.aifamilynight.com
```

---

## 4. Test It

1. Go to any game (e.g., Presidential Time Machine)
2. Generate a story
3. Click **"Read to Me"**
4. You should hear a **natural, warm female voice** (Rachel)
5. If it fails, it automatically falls back to browser TTS

---

## Voice Details

**Using:** Rachel (ElevenLabs pre-made voice)
- **Style:** Warm, friendly, clear
- **Best for:** Children's stories, educational content
- **Settings:**
  - Stability: 0.5 (more expressive)
  - Similarity: 0.75 (clear voice)
  - Style: 0.5 (animated for kids)

---

## Upgrade Options

If you hit the 10,000 character limit:

### Starter ($5/month)
- 30,000 characters/month
- ~60 stories
- All voices

### Creator ($22/month)
- 100,000 characters/month
- ~200 stories
- Voice cloning
- Custom voices

---

## How It Works

1. User clicks "Read to Me"
2. Frontend calls `/api/elevenlabs-tts` (serverless function)
3. Vercel function calls ElevenLabs API with your key
4. ElevenLabs returns MP3 audio
5. Frontend plays audio in browser
6. **If API fails:** Automatically falls back to browser TTS

---

## Monitoring Usage

Check your usage at: https://elevenlabs.io/app/usage

**Character Count Examples:**
- Short story (500 words): ~2,500 characters
- Medium story (1000 words): ~5,000 characters
- Long story (2000 words): ~10,000 characters

---

## Troubleshooting

### Error: "API key not configured"
**Fix:** Make sure `ELEVENLABS_API_KEY` is set in Vercel environment variables, then redeploy.

### Error: "Monthly character quota exceeded"
**Fix:** Either wait until next month (free tier resets) or upgrade to paid plan.

### Fallback to Browser Voice
**This is normal!** If ElevenLabs fails for any reason, the app automatically uses browser TTS so users can still hear the story.

---

## Cost Estimate

**Free tier (10,000 chars/month):**
- ~4 stories per day
- Perfect for testing and small user base

**Paid tier ($5/month for 30k chars):**
- ~12 stories per day
- Good for early growth phase

**At scale:**
- Average user: 2 stories/week = ~20k chars/month
- 100 users = 2M chars = $30/month (Creator plan)
- 500 users = 10M chars = $99/month (Pro plan)

Much cheaper than running your own TTS infrastructure!

---

## API Key Security

✅ **Secure:** API key is stored in Vercel environment variables
✅ **Never exposed:** Frontend never sees the API key
✅ **Serverless function:** API calls happen server-side only

**Never commit your API key to git!**
