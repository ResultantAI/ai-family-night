# Phase 3 Testing Guide

## 🧪 How to Test Age-Appropriate Features

The app now automatically adjusts UX based on the child's age stored in Supabase `user_metadata.child_age`.

---

## 🔧 Setup for Testing

### Option 1: Via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Find your test user
3. Click to edit user metadata
4. Add/update `child_age` field:
```json
{
  "child_age": 5
}
```
5. Save and refresh the app

### Option 2: Via Onboarding Flow

1. Sign up as a new user
2. Complete onboarding
3. Enter child's age (5-12)
4. The app will store this in `user_metadata`

---

## 📋 Test Cases by Age Group

### **Test 1: Ages 5-7 (Mash Phase)**

**Setup:**
```json
{
  "child_age": 5
}
```

**Expected Behavior:**

✅ **Button Sizing:**
- All AgeButton components: **76x76px minimum**
- Easy to tap with fat fingers
- Large touch targets reduce frustration

✅ **Auto-Save Intervals:**
- Games save every **30 seconds**
- Check AutoSaveIndicator displays "Saved just now"
- Short interval matches attention span

✅ **Choice Limiting:**
- ChoiceLimiter shows max **3 options** initially
- "Show More" button reveals additional choices
- Educational hint explains why choices are limited

✅ **Voice Input:**
- Voice button prominent and accessible
- Kids can speak instead of type
- Removes spelling anxiety

**Games to Test:**
1. Presidential Time Machine
2. Love Story Comic
3. Family Character Quiz
4. Treehouse Designer

---

### **Test 2: Ages 8-10 (Refinement Phase)**

**Setup:**
```json
{
  "child_age": 8
}
```

**Expected Behavior:**

✅ **Button Sizing:**
- All AgeButton components: **57x57px minimum**
- Moderate precision required
- Still larger than adult UI

✅ **Auto-Save Intervals:**
- Games save every **60 seconds**
- Check AutoSaveIndicator updates correctly
- Balanced between security and performance

✅ **Choice Limiting:**
- ChoiceLimiter shows max **5 options** initially
- More choices than younger kids
- "Show More" still available

✅ **Gestures:**
- Tap, drag, swipe all work
- No complex multi-touch required

**Games to Test:**
1. All 6 core games
2. Verify buttons are noticeably smaller than age 5
3. Confirm auto-save interval changed

---

### **Test 3: Ages 11-12 (Adult-Adjacent)**

**Setup:**
```json
{
  "child_age": 12
}
```

**Expected Behavior:**

✅ **Button Sizing:**
- All AgeButton components: **44x44px minimum**
- Adult-level precision
- Matches Apple's minimum tap target

✅ **Auto-Save Intervals:**
- Games save every **120 seconds** (2 minutes)
- Longer sessions supported
- Less frequent interruptions

✅ **Choice Limiting:**
- ChoiceLimiter shows max **7 options** initially
- Adult-level cognitive load
- Full feature access

✅ **All Gestures:**
- Complex gestures supported
- Pinch, rotate, multi-touch work

**Games to Test:**
1. All 6 core games
2. Verify buttons are standard size
3. Confirm longer auto-save intervals

---

## 🎮 Game-Specific Tests

### **Presidential Time Machine**

**What to Test:**
1. "Start Time Machine" button resizes by age
2. President selection cards clickable
3. "Print Story" and "Save as Image" buttons resize
4. Auto-save indicator appears
5. Save status updates ("Saving...", "Saved")

**How to Test:**
```
1. Navigate to: http://localhost:5173/game/presidential-time-machine
2. Select a president
3. Watch for auto-save indicator
4. Generate story
5. Verify button sizes match child age
```

---

### **Love Story Comic**

**What to Test:**
1. "Generate Comic" button resizes
2. Panel input areas accessible
3. "Print Comic" and "Create Another" resize
4. Auto-save preserves panel content

**How to Test:**
```
1. Navigate to: http://localhost:5173/game/love-story-comic
2. Fill in comic panels
3. Wait for auto-save (30s/60s/120s depending on age)
4. Verify save indicator shows
5. Generate comic
```

---

### **Family Character Quiz**

**What to Test:**
1. "Start Quiz" button resizes
2. Answer option buttons resize (4 per question)
3. "Print Result" and "Take Quiz Again" resize
4. Auto-save preserves quiz progress

**How to Test:**
```
1. Navigate to: http://localhost:5173/game/family-character-quiz
2. Enter name
3. Answer questions
4. Auto-save should preserve progress
5. Complete quiz
```

---

### **Treehouse Designer**

**What to Test:**
1. "Generate Blueprint" button resizes
2. Design option selections work
3. "Print Blueprint" and "Design Another" resize
4. Auto-save preserves treehouse design

---

## 🔍 Visual Inspection Checklist

### **Button Size Verification**

Open browser DevTools → Elements → Inspect button:

**Age 5-7:**
```css
min-width: 76px;
min-height: 76px;
```

**Age 8-10:**
```css
min-width: 57px;
min-height: 57px;
```

**Age 11-12:**
```css
min-width: 44px;
min-height: 44px;
```

---

## 🕐 Auto-Save Timing Test

### **Manual Timing Test:**

1. Start a game
2. Make a change (type something, select option)
3. Start a timer
4. Watch for AutoSaveIndicator to show "Saving..."
5. Verify timing:
   - Age 5: ~30 seconds
   - Age 8: ~60 seconds
   - Age 12: ~120 seconds

### **Console Log Test:**

Open DevTools Console and look for:
```
✅ Auto-saved: game-state-key
```

---

## 🐛 Common Issues & Debugging

### **Issue: Buttons Not Changing Size**

**Possible Causes:**
1. `child_age` not set in Supabase user_metadata
2. User not logged in
3. AgeButton not reading from Supabase correctly

**Debug Steps:**
```javascript
// Add console.log to AgeButton.jsx useEffect:
console.log('Child age loaded:', age)
```

---

### **Issue: Auto-Save Not Working**

**Possible Causes:**
1. Game state not changing (no trigger)
2. Auto-save interval not set
3. Supabase connection issue

**Debug Steps:**
```javascript
// Check auto-save hook console logs:
✅ Auto-saved: presidential-time-machine
```

---

### **Issue: Wrong Save Interval**

**Possible Causes:**
1. `child_age` not loaded before hook initializes
2. Default interval being used (60s)

**Debug Steps:**
```javascript
// Check getSessionDuration output:
console.log('Auto-save interval:', autoSaveInterval)
// Should be: 30000, 60000, or 120000 (milliseconds)
```

---

## 📊 Test Results Template

### **Age 5-7 Testing**

| Feature | Expected | Actual | Pass/Fail |
|---------|----------|--------|-----------|
| Button size | 76x76px | | |
| Auto-save | 30 seconds | | |
| Choice limit | 3 max | | |
| Voice input | Available | | |

### **Age 8-10 Testing**

| Feature | Expected | Actual | Pass/Fail |
|---------|----------|--------|-----------|
| Button size | 57x57px | | |
| Auto-save | 60 seconds | | |
| Choice limit | 5 max | | |

### **Age 11-12 Testing**

| Feature | Expected | Actual | Pass/Fail |
|---------|----------|--------|-----------|
| Button size | 44x44px | | |
| Auto-save | 120 seconds | | |
| Choice limit | 7 max | | |

---

## 🚀 Quick Test Script

```bash
# 1. Start dev server (already running)
npm run dev

# 2. Open browser
open http://localhost:5173

# 3. Login or signup
# 4. Set child age in Supabase Dashboard
# 5. Navigate to a game
# 6. Verify button sizes
# 7. Wait for auto-save
# 8. Change age and test again
```

---

## ✅ Sign-Off Checklist

Before deploying to production, verify:

- [ ] All 6 games tested with age 5
- [ ] All 6 games tested with age 8
- [ ] All 6 games tested with age 12
- [ ] Button sizes verified with DevTools
- [ ] Auto-save intervals verified with timer
- [ ] AutoSaveIndicator displays correctly
- [ ] No console errors
- [ ] Supabase user_metadata persists correctly
- [ ] Games playable at all age levels
- [ ] Performance acceptable (no lag from auto-save)

---

## 📞 Support

**Issues?** Check:
1. Supabase connection (AUTH_ENABLED in .env.local)
2. User logged in
3. user_metadata.child_age is an integer (not string)
4. Browser console for errors

**Expected Behavior:** The app should feel effortless and frustration-free for kids of all ages!
