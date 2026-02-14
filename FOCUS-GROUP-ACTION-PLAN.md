# Focus Group Action Plan - AI Family Night

## 🚨 CRITICAL BLOCKERS (Must Fix Before Launch)

### 1. **Save/Draft Functionality** ⚠️ SHOWSTOPPER
**Problem:** "If my kid spends 20 minutes creating something and it disappears because they refreshed, you have lost that customer forever." - David

**Impact:** This is a deal-breaker. Kids lose work = immediate cancellation.

**Solution:**
- Implement `localStorage` auto-save for all game inputs
- Add "My Creations" gallery to Dashboard
- Show "Saved!" indicator after each game completion

**Dev Time:** 4-6 hours

---

### 2. **Mobile Shareability** ⚠️ CRITICAL
**Problem:** "I don't have a printer. I want to send this to my ex-wife to show her what Leo made." - Mark

**Impact:** The entire "Printable Results" value prop is dead on arrival. Modern families don't have printers.

**Solution:**
- Add "Share Image" button on all game results
- Use `html2canvas` to generate PNG/JPG exports
- Format for Instagram Stories (9:16 ratio)
- Include email/text share options

**Dev Time:** 6-8 hours

---

### 3. **Voice-to-Text Input** ⚠️ ACCESSIBILITY
**Problem:** "I don't want to be the secretary typing for my kid." - Jessica (mom of 6-year-old)

**Impact:** Excludes non-readers (ages 4-7) and creates "parental burden."

**Solution:**
- Add microphone icon to all text input fields
- Integrate Web Speech API for voice dictation
- Add "Read to Me" button on story results (text-to-speech)

**Dev Time:** 3-4 hours

---

## 🗑️ CONTENT KILL LIST

### ❌ DELETE: Presidential Time Machine
**Verdict:** Unanimous "trash" from kids. "This is homework."

**Why Kill It:**
- Confuses brand positioning (Fun vs. Educational)
- Zero replay value
- Kids labeled it "Wikipedia page" and "DMV application"

**Action:** Remove from navigation immediately

**Dev Time:** 30 minutes

---

### 🔄 REWORK: Love Story Comic → Comic Maker
**Verdict:** "The name is cringe" - Maya (14)

**Why Rework:**
- "Love Story" alienates boys and younger kids
- Concept is good, branding is bad

**Action:**
- Rename to "Comic Strip Creator"
- Update prompts to support: Funny, Scary, Action, Adventure, Drama (not just love)
- Keep same technical implementation

**Dev Time:** 1 hour

---

### ⏸️ PAUSE: Restaurant Menu Maker
**Verdict:** "One-and-done" game with high friction (lots of typing)

**Why Pause:**
- Only replay value if you add "Play Restaurant" mode
- Too much typing on mobile = nightmare

**Action:**
- Keep existing game but don't prioritize improvements
- Consider adding "Auto-Fill" button (AI suggests 5 items instantly)

**Dev Time:** N/A (deprioritize)

---

## 🌟 HIGH-IMPACT NEW FEATURES

### 🎬 #1 PRIORITY: Family Movie Magic
**What:** Script generator where family acts out a 3-minute movie together

**Why This Wins:**
- Solves "guilt-free screen time" perfectly (forces face-to-face interaction)
- Viral potential (teens want to film it for TikTok)
- Works for all ages (6-year-old can pretend, 14-year-old finds it funny)
- Leo (11): "I can make Dad the villain? I'm in."

**How It Works:**
1. Input family member names + assign roles (Hero, Villain, Sidekick, Pet)
2. Pick genre (Sci-Fi, Western, Zombie, Noir, 90s Sitcom)
3. AI generates formatted screenplay
4. Family reads it aloud together (table read)
5. Export: PDF script + Movie Poster image for social media

**Dev Implementation:**
- Input Form: Name fields + role dropdowns + genre selector
- LLM Prompt: Generate 500-700 word screenplay with character dialogue
- Output: Markdown-formatted script styled like a real screenplay
- Bonus: "Randomize Roles" button to shuffle assignments

**Dev Time:** 8-10 hours

---

### 📸 #2: Social Share Movie Poster Generator
**What:** AI-generated movie poster background + text overlay with family names

**Why:**
- Viral loop for acquisition
- Parents share on social media = free marketing
- Maya (14): "I'd post this to Instagram if it looks good"

**Technical Approach:**
1. AI generates genre-appropriate background image (DALL-E/Stable Diffusion)
   - 9:16 aspect ratio (Instagram Stories)
   - Leave top/bottom 25% empty for text overlay
2. Frontend overlays text using CSS/Canvas:
   - Movie title (large, bold)
   - "Starring: [Family Names]"
   - "A [Family Name] Production"
3. Export as shareable JPG using `html2canvas`

**Dev Time:** 10-12 hours (includes AI image generation setup)

---

### 💾 #3: My Creations Gallery
**What:** Persistent storage of all games played with ability to view/share/delete

**Why:**
- Ethan (8): "I want to see all my blueprints in a row. Like a gallery."
- Builds "Collection" psychology (Pokémon effect)
- Justifies subscription (you're building a family memory book)

**Implementation:**
- Dashboard tab showing grid of saved creations
- Each card shows: Game name, date created, thumbnail
- Click to view full result
- Actions: Share, Delete, Re-create

**Dev Time:** 6-8 hours

---

## 🎨 UX/UI IMPROVEMENTS

### Mobile Dashboard Hierarchy
**Problem:** "I have to scroll way down to get to 'This Week's Game'" - Jessica

**Fix:** On mobile, move "Play Now" CTA above stats cards

**Dev Time:** 30 minutes

---

### Auto-Expanding Text Fields
**Problem:** "Do I have to scroll inside a tiny box?" - David

**Fix:** All textareas should auto-expand as user types

**Dev Time:** 1 hour

---

### In-App Drawing Canvas
**Problem:** "The uploaded photo looked dark and crooked. Can I draw inside the app?" - Ethan

**Fix:**
- Integrate simple drawing library (`fabric.js` or `react-sketch-canvas`)
- Replace file upload with in-app canvas
- Add tools: Pen, Eraser, Color picker, Undo

**Dev Time:** 6-8 hours

---

### Conversational UI (Future)
**Problem:** "The current 'Form Fill' approach feels like filling out a DMV application." - David

**Fix:**
- Convert at least one game (Superhero) to chat interface
- Instead of 5 form fields, it's a back-and-forth conversation
- App: "What's your hero's favorite color?"
- Kid: "Green!"
- App: "Ooh, like slime or like a forest?"

**Dev Time:** 12-15 hours (Sprint 3)

---

## 💳 TRUST & SUBSCRIPTION IMPROVEMENTS

### Visible Cancel/Pause Button
**Problem:** "I don't see a 'Cancel Subscription' button. Is it hidden?" - Sarah

**Fix:**
- Settings > Billing: Add clear "Pause Subscription" and "Cancel Subscription" options
- "Pause" keeps creations but stops billing (parents love this for summer)

**Dev Time:** 2 hours (when backend is built)

---

### Trial Countdown
**Problem:** "If I'm on the trial, remind me when it ends." - Mark

**Fix:**
- Dashboard shows: "Free Trial ends on Feb 20. We will email you 2 days before."
- Builds trust and reduces surprise charges

**Dev Time:** 1 hour (when backend is built)

---

### Privacy Transparency
**Problem:** "Is my daughter's drawing training your AI?" - Sarah

**Fix:**
- Privacy tab explicitly states: "We do not use your children's inputs to train public AI models."
- Add "Report Weird Content" button on all game results

**Dev Time:** 30 minutes (copy changes)

---

## 📋 SPRINT ROADMAP

### **Sprint 1: Critical Blockers (Week 1)**
**Goal:** Make the app functional and shareable

- [ ] Delete Presidential Time Machine from nav
- [ ] Rename Love Story Comic → Comic Maker
- [ ] Implement localStorage auto-save for all games
- [ ] Add "My Creations" gallery to Dashboard
- [ ] Build "Export to Image" functionality (html2canvas)
- [ ] Add voice-to-text input support (Web Speech API)
- [ ] Fix mobile dashboard hierarchy (Play button above stats)

**Estimated Dev Time:** 18-22 hours

---

### **Sprint 2: Family Movie Magic (Week 2)**
**Goal:** Build the killer feature

- [ ] Build Family Movie Magic input form
- [ ] Integrate LLM for screenplay generation
- [ ] Style script output (Courier font, colored character names)
- [ ] Add "Randomize Roles" button
- [ ] Export PDF script
- [ ] Build Movie Poster generator (AI background + text overlay)
- [ ] Add social share buttons

**Estimated Dev Time:** 20-25 hours

---

### **Sprint 3: Polish & Gamification (Week 3-4)**
**Goal:** Increase engagement and replay value

- [ ] In-app drawing canvas (replace file uploads)
- [ ] Conversational UI for Superhero game
- [ ] Auto-fill suggestions for Restaurant game
- [ ] Character Quiz: Extend to 10 questions + shareable result cards
- [ ] Treehouse: Add 3D preview or rendered blueprint image
- [ ] Add "Collection Badges" (Unlocked after playing 5 games, etc.)

**Estimated Dev Time:** 30-35 hours

---

## 📊 EXPECTED IMPACT

### Before Changes:
- **Leo (11):** "2/10. This is homework."
- **David (Tech Dad):** "No. It's $120/year for Mad Libs."
- **Mark (Divorced Dad):** "Wait. I don't have a printer."

### After Changes:
- ✅ Save functionality = No lost work
- ✅ Social sharing = Parents become marketers
- ✅ Family Movie Magic = "Actually laughing together"
- ✅ Voice input = Works for ages 4-14
- ✅ Removed "homework" game = Clear brand positioning

**Projected Conversion:**
- Trial signup rate: +40% (from removing friction)
- Trial → Paid conversion: +60% (from adding save + shareability)
- Viral coefficient: +2.5 (parents share Movie Posters on social media)

---

## 🚦 GO/NO-GO DECISION MATRIX

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Auto-Save | 🔥🔥🔥 | Low | **P0** |
| Export to Image | 🔥🔥🔥 | Low | **P0** |
| Voice Input | 🔥🔥 | Low | **P0** |
| Delete Presidential | 🔥🔥🔥 | Trivial | **P0** |
| Family Movie Magic | 🔥🔥🔥 | Medium | **P1** |
| Movie Poster Generator | 🔥🔥 | Medium | **P1** |
| My Creations Gallery | 🔥🔥 | Medium | **P1** |
| In-App Drawing | 🔥 | Medium | **P2** |
| Conversational UI | 🔥 | High | **P3** |

---

## 🎯 FINAL RECOMMENDATION

**Do NOT launch without:**
1. Auto-save functionality
2. Export to Image (replace print)
3. Family Movie Magic game

**These 3 items** solve the focus group's core objections:
- ❌ "Kids lose their work" → ✅ Auto-save
- ❌ "I don't have a printer" → ✅ Share images
- ❌ "Games feel like homework" → ✅ Movie Magic is pure fun

**Timeline:**
- Week 1: Critical blockers (Sprint 1)
- Week 2: Family Movie Magic (Sprint 2)
- Week 3: Soft launch beta
- Week 4: Gather feedback + iterate

---

## 📞 Next Steps

1. Review this plan and approve priorities
2. I'll start implementing Sprint 1 (Critical Blockers)
3. You prepare backend infrastructure for save/auth
4. We launch beta in 2-3 weeks with 5 solid games instead of 6 mediocre ones

**Questions?**
