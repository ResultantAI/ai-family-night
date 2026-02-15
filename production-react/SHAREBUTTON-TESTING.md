# ShareButton Testing Checklist

## 🎯 Overview

All 6 core games now have ShareButton integration for social sharing and viral growth.
This document provides a comprehensive testing checklist for verifying ShareButton functionality.

---

## 📱 **Device & Browser Matrix**

Test ShareButton on the following platforms:

### **Desktop Browsers**
- [ ] Chrome (Mac)
- [ ] Chrome (Windows)
- [ ] Safari (Mac)
- [ ] Edge (Windows)
- [ ] Firefox (Mac/Windows)

### **Mobile Browsers**
- [ ] Safari (iPhone)
- [ ] Chrome (iPhone)
- [ ] Chrome (Android)
- [ ] Samsung Internet (Android)

---

## 🎮 **Game-by-Game Testing**

### **1. Presidential Time Machine**
**Element ID:** `presidential-story-output`
**Location:** Story result page (after generating story)

**Test Steps:**
1. Navigate to `/game/presidential-time-machine`
2. Select a president (e.g., George Washington)
3. Click "Start Time Machine"
4. Wait for story to generate
5. Scroll to find ShareButton (below story, in action buttons)

**Test Cases:**
- [ ] **Download:** Click "Share Image" → "Download"
  - Expected: PNG file downloads with filename `{president-name}-time-machine.png`
  - Check: Image includes full story + facts + quote

- [ ] **Web Share (Mobile):** Click "Share Image" → "Share"
  - Expected: Native share sheet appears (iOS/Android)
  - Test: Share to Messages, Instagram, Email

- [ ] **Copy to Clipboard:** Click "Share Image" → "Copy"
  - Expected: "Copied!" confirmation appears
  - Test: Paste into Notes app or email

**Screenshot Requirements:**
- Ensure entire story div is captured
- Check quote box at bottom is included
- Verify president facts are visible

---

### **2. Love Story Comic**
**Element ID:** `love-story-comic-output`
**Location:** Comic result page (after generating comic)

**Test Steps:**
1. Navigate to `/game/love-story-comic`
2. Fill in all 4 comic panels
3. Click "Generate Comic"
4. Wait for comic to generate
5. Scroll to find ShareButton (in action buttons)

**Test Cases:**
- [ ] **Download:** Verify `family-love-story-comic.png` downloads
- [ ] **Web Share:** Share to social media
- [ ] **Copy:** Paste comic into other apps

**Screenshot Requirements:**
- All 4 panels must be visible
- Heart icon at bottom included
- "This is how we show love in our family!" text included

---

### **3. Superhero Origin**
**Element ID:** `superhero-profile-output`
**Location:** Hero profile page (after generating hero)

**Test Steps:**
1. Navigate to `/game/superhero-origin`
2. Enter child name and select traits
3. Choose favorite color and superpower
4. Click "Generate My Hero"
5. Wait for hero to generate
6. Find ShareButton in action buttons

**Test Cases:**
- [ ] **Download:** Verify filename includes hero name `{hero-name}-superhero.png`
- [ ] **Web Share:** Share hero profile
- [ ] **Copy:** Paste hero card

**Screenshot Requirements:**
- Header with hero name and tagline
- Origin story section
- Superpowers list
- Costume design details
- Catchphrase

---

### **4. Noisy Storybook**
**Element ID:** `noisy-storybook-output`
**Location:** Story playback page (after recording sounds)

**Test Steps:**
1. Navigate to `/game/noisy-storybook`
2. Select theme (e.g., jungle)
3. Click "Make My Story"
4. Record sound effects for each segment
5. Complete all recordings
6. Find ShareButton next to "Save Audio" and "Play Story"

**Test Cases:**
- [ ] **Download:** Verify filename includes story title `{title}-story.png`
- [ ] **Web Share:** Share story screenshot
- [ ] **Copy:** Paste story image

**Screenshot Requirements:**
- Story title
- All story segments visible
- Sound cue indicators
- Ending text

**Note:** ShareButton shares the *visual* story, not the audio recording.

---

### **5. Treehouse Designer**
**Element ID:** `treehouse-blueprint-output`
**Location:** Blueprint page (after generating blueprint)

**Test Steps:**
1. Navigate to `/game/treehouse-designer`
2. Name your treehouse
3. Select size, style, and features
4. Click "Generate Blueprint"
5. Wait for blueprint to generate
6. Find ShareButton in action buttons

**Test Cases:**
- [ ] **Download:** Verify filename `{treehouse-name}-treehouse.png`
- [ ] **Web Share:** Share blueprint design
- [ ] **Copy:** Paste blueprint

**Screenshot Requirements:**
- Treehouse name header
- Specifications grid
- Features list
- Materials section
- Safety notes

---

### **6. Family Movie Magic**
**Element ID:** (Already implemented - verify existing functionality)
**Location:** Movie script result page

**Test Steps:**
1. Navigate to `/game/family-movie-magic`
2. Complete movie script creation
3. Find ShareButton on result page

**Test Cases:**
- [ ] **Download:** Movie script downloads as PNG
- [ ] **Web Share:** Share script
- [ ] **Copy:** Paste script

---

## 🧪 **Functional Tests**

### **ShareButton Menu Behavior**
- [ ] **Menu Toggle:** Click button opens dropdown menu
- [ ] **Backdrop Close:** Click outside menu closes it
- [ ] **Option Highlighting:** Hover effects work on all 3 options
- [ ] **Icons Display:** Download, Share, Copy icons render correctly

### **Download Functionality**
- [ ] **File Name:** Correct filename based on content
- [ ] **File Format:** PNG image format
- [ ] **Image Quality:** 2x scale (high resolution)
- [ ] **White Background:** No transparent areas
- [ ] **Complete Content:** Entire element captured

### **Web Share API (Mobile)**
- [ ] **Browser Support:** Works on Chrome/Safari mobile
- [ ] **Fallback:** Download triggers if Share API unavailable
- [ ] **Share Sheet:** Native OS share sheet appears
- [ ] **File Attached:** PNG file included in share
- [ ] **Title & Text:** Correct share metadata

### **Clipboard Copy**
- [ ] **Copy Success:** Image copies to clipboard
- [ ] **Visual Feedback:** "Copied!" message displays
- [ ] **Auto-Close:** Menu closes after 2 seconds
- [ ] **Paste Test:** Image pastes correctly into apps

---

## 🎨 **Visual Quality Checks**

### **Image Capture Quality**
- [ ] **Full Content:** No truncated text or elements
- [ ] **Print Styles:** `.no-print` elements excluded
- [ ] **Fonts:** Web fonts loaded correctly
- [ ] **Colors:** Gradients and colors accurate
- [ ] **Borders:** Rounded corners preserved
- [ ] **Spacing:** Padding and margins correct

### **Social Media Preview**
- [ ] **Instagram Stories:** 9:16 format option works
- [ ] **Instagram Feed:** Square/portrait works
- [ ] **Facebook:** Adequate resolution
- [ ] **Twitter/X:** Image displays in tweet
- [ ] **Messages/WhatsApp:** Image sends correctly

---

## ⚠️ **Error Handling Tests**

### **Browser Compatibility**
- [ ] **Firefox:** Clipboard API may fail → shows error message
- [ ] **Safari < 14:** Web Share API may be limited
- [ ] **Chrome Incognito:** Clipboard may be restricted
- [ ] **Edge:** All features work

### **Element Not Found**
- [ ] **Missing ID:** Console error logged
- [ ] **User Feedback:** Alert shown to user
- [ ] **Graceful Degradation:** App doesn't crash

### **Network Issues**
- [ ] **html2canvas Load:** Library loaded successfully
- [ ] **Font Loading:** Fonts render before capture
- [ ] **Image Assets:** External images captured

---

## 📊 **Performance Tests**

### **Image Generation Speed**
- [ ] **Simple Content:** < 1 second
- [ ] **Complex Content:** < 3 seconds
- [ ] **Large Blueprints:** < 5 seconds
- [ ] **No Hanging:** UI remains responsive

### **Memory Usage**
- [ ] **Multiple Shares:** No memory leaks
- [ ] **Large Images:** Browser doesn't crash
- [ ] **Canvas Cleanup:** Temporary elements removed

---

## 🔒 **Privacy & Security**

### **Data Handling**
- [ ] **No Server Upload:** Images generated client-side only
- [ ] **Local Processing:** html2canvas runs in browser
- [ ] **No Tracking:** No share analytics sent
- [ ] **User Control:** User initiates all shares

### **Permissions**
- [ ] **Clipboard:** Permission requested correctly
- [ ] **File System:** Download permission (if needed)
- [ ] **Share API:** Permission not required

---

## ✅ **Acceptance Criteria**

**ShareButton is considered passing if:**

1. ✅ Works on all 6 core games
2. ✅ Download produces high-quality PNG
3. ✅ Web Share API works on mobile (with fallback)
4. ✅ Clipboard copy works on supported browsers
5. ✅ No console errors during normal operation
6. ✅ Visual quality matches original content
7. ✅ Menu interaction is smooth and intuitive
8. ✅ Error messages are user-friendly

---

## 🐛 **Known Issues**

### **Browser Limitations:**
- **Firefox:** Clipboard API requires HTTPS in production
- **Safari < 14:** Web Share API for files not supported
- **Chrome Android:** Share sheet may exclude some apps

### **Content Capture:**
- **Custom Fonts:** Must be loaded before capture
- **External Images:** Require CORS headers
- **CSS Animations:** Paused during capture

---

## 📝 **Bug Report Template**

```markdown
**Game:** [Presidential Time Machine / Love Story Comic / etc.]
**Browser:** [Chrome 120 / Safari 17 / etc.]
**Device:** [iPhone 14 / MacBook Pro / Windows 11]
**Action:** [Download / Share / Copy]

**Steps to Reproduce:**
1.
2.
3.

**Expected Behavior:**


**Actual Behavior:**


**Console Errors:**


**Screenshot:**
[Attach screenshot if applicable]
```

---

## 🚀 **Post-Testing Actions**

After completing all tests:

1. [ ] Update `FOCUS-GROUP-PHASE-3-MAPPING.md`:
   - Change ShareButton status from "NEEDS VERIFICATION" to "VERIFIED"
   - Update success rate if applicable

2. [ ] Document any issues found in GitHub Issues

3. [ ] Update Phase 3 implementation docs with test results

4. [ ] Consider adding ShareButton to remaining pages:
   - Dashboard (share user stats?)
   - Collection page (share gallery?)

---

## 📈 **Success Metrics**

**Target Metrics (Post-Launch):**
- Share button click rate: > 5% of game completions
- Successful shares: > 80% of click attempts
- Social media posts: Track #AIFamilyNight mentions
- Viral coefficient: > 0.1 (1 in 10 users shares)

**Tracking:**
- Add analytics event: `shareButton.click`
- Add analytics event: `shareButton.success`
- Add analytics event: `shareButton.error`

---

**Last Updated:** February 14, 2026
**Status:** Ready for testing
**Next Review:** After user testing phase
