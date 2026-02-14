# 🏡 AI Family Night App

**Turn screen time into quality time** with AI-powered family activities, games, and seasonal fun!

## 🎯 Features

### ✅ What's Included

1. **3-Step Onboarding Flow**
   - Family name collection
   - Kid age selection (3-5, 6-8, 9-11, 12-14, 15+)
   - Activity preference selection (Art, Gaming, Outdoors, Science, Music, Cooking)
   - Data saved to localStorage

2. **Seasonal Activity Awareness**
   - Current month: February
   - Valentine's Day themed activities 💕
   - President's Day weekend games 🎩
   - Indoor activity focus for winter

3. **Share Functionality**
   - Copy activity details to clipboard
   - Native share API support (mobile)
   - Shareable text summaries
   - Screenshot-friendly share preview

4. **Warm & Playful Design**
   - Rounded corners throughout
   - Valentine's color palette (pink, purple, yellow)
   - Emoji clusters for visual appeal
   - Fredoka font for friendly, approachable feel
   - Smooth animations and transitions

5. **Progressive Web App (PWA)**
   - Installable on phone home screens
   - Works offline with service worker
   - App-like experience
   - Custom app icons
   - Splash screen support

## 🎮 Valentine's & President's Day Games

### Valentine's Special Activities:
1. **💕 Family Love Story Comic** - Create a sweet comic about how your family shows love
2. **💖 AI Heart Hunt** - Scavenger hunt with AI-generated clues
3. **🎵 Family Love Song** - Write and record a silly family love song

### President's Day Activities:
1. **🎩 Presidential Trivia Battle** - AI-generated quiz game
2. **⏰ Presidential Time Machine** - Bring a president to 2026 comic

### Year-Round Indoor Activities:
1. **🎲 Design Your Own Board Game**
2. **📖 AI Family Cookbook**
3. **🔐 DIY Escape Room**

## 🚀 Quick Start

### Option 1: Open Locally (Test)

```bash
cd /Users/cj/ai-family-night-app
open index.html
```

### Option 2: Deploy to GitHub Pages (Production)

1. **Create GitHub Repository**
   ```bash
   cd /Users/cj/ai-family-night-app
   git init
   git add .
   git commit -m "Initial commit: AI Family Night PWA"
   gh repo create ai-family-night --public --source=. --push
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/ (root)`
   - Save

3. **Access Your App**
   - URL: `https://[your-username].github.io/ai-family-night/`
   - Share this URL with families!

### Option 3: Deploy to Netlify (Fastest)

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd /Users/cj/ai-family-night-app
netlify deploy --prod
```

Follow prompts. App will be live at a `.netlify.app` URL.

## 📱 Installing as PWA

### On iPhone/iPad:
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"
4. Tap "Add"
5. App icon appears on home screen!

### On Android:
1. Open app in Chrome
2. Tap "Install" button (or three-dot menu → "Install app")
3. Tap "Install"
4. App icon appears on home screen!

### On Desktop (Chrome/Edge):
1. Click install icon in address bar
2. Click "Install"
3. App opens in its own window!

## 🎨 Icons

PWA icons are generated using `create-icons.html`:

1. Open `create-icons.html` in a browser
2. Icons auto-download to your Downloads folder
3. Move `icon-192.png` and `icon-512.png` to the app directory

**Or** create custom icons:
- 192x192px PNG
- 512x512px PNG
- Pink/purple gradient background recommended
- House emoji or family illustration

## 📂 File Structure

```
ai-family-night-app/
├── index.html           # Main app (all-in-one file)
├── manifest.json        # PWA manifest
├── service-worker.js    # Offline support
├── icon-192.png         # Small app icon
├── icon-512.png         # Large app icon
├── create-icons.html    # Icon generator tool
└── README.md            # This file
```

## 🔧 Customization

### Add More Activities

Edit the `activities` array in `index.html` (line ~425):

```javascript
{
    id: 'my-activity',
    title: 'Activity Name',
    icon: '🎯',
    duration: '30 min',
    difficulty: 'Easy',
    description: 'What you'll do...',
    tags: ['Tag1', 'Tag2'],
    seasonal: false, // or true for seasonal
    steps: [
        { title: 'Step 1', content: 'Instructions...' },
        // ... more steps
    ]
}
```

### Change Colors

Edit CSS variables in `index.html` (line ~32):

```css
:root {
    --primary: #ff6b9d;      /* Main pink */
    --secondary: #ffd93d;    /* Yellow accent */
    --accent: #6bcf7f;       /* Green accent */
    --purple: #a78bfa;       /* Purple gradient */
}
```

### Seasonal Themes

Activities are automatically filtered based on `appState.currentMonth`.

To add themes for other months, edit `renderActivities()` function.

## 📊 Analytics (Optional)

Add Google Analytics to track usage:

```html
<!-- Add before </head> in index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🎯 Launch Checklist

### Before Valentine's Weekend Launch:

- [x] Onboarding flow complete
- [x] Valentine's activities added (3 activities)
- [x] President's Day activities added (2 activities)
- [x] Share functionality working
- [x] PWA manifest configured
- [x] Service worker registered
- [x] Design polished (warm colors, rounded corners, emojis)
- [ ] Generate icons (run `create-icons.html`)
- [ ] Deploy to production (GitHub Pages or Netlify)
- [ ] Test PWA installation on mobile
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Share URL with beta testers

### Marketing for This Weekend:

**Social Media Posts:**
```
🏡 New for Valentine's Weekend!

AI Family Night: Turn screen time into quality time ❤️

💕 Valentine's Love Story Comics
🎩 Presidential Trivia Battles
🎵 Family Love Songs

Free PWA → Install on your phone!
[YOUR-URL-HERE]

#FamilyTime #ValentinesDay #PresidentsDay
```

**Email Subject Lines:**
- "🎮 5 Fun Family Activities for This Weekend"
- "💕 Turn Valentine's Day Into Family Fun Time"
- "Install This Free App Before the Long Weekend!"

## 🐛 Troubleshooting

### "Install" button doesn't show
- Must be served over HTTPS
- Use GitHub Pages, Netlify, or `http-server` with SSL
- Won't work with `file://` protocol

### Service worker not registering
- Check browser console for errors
- Ensure `service-worker.js` is in root directory
- Clear cache and reload

### Activities not showing
- Check browser console for JavaScript errors
- Verify `activities` array is properly formatted
- Check localStorage isn't full

### Share not working
- Native share requires HTTPS on mobile
- Fallback to clipboard copy works on all browsers

## 📞 Support

Built with ❤️ for families figuring out AI together.

Questions? Found a bug? Want to contribute?
- File an issue on GitHub
- Email: [your-email]
- Twitter: @[your-handle]

## 📄 License

MIT License - feel free to use, modify, and share!

## 🚀 Future Enhancements

Ideas for v2:
- [ ] User-submitted activities
- [ ] Activity completion tracking
- [ ] Badges and achievements
- [ ] Photo upload for completed activities
- [ ] Community sharing feed
- [ ] AI-generated custom activities
- [ ] Multi-language support
- [ ] Push notifications for new challenges

---

**Ready for Valentine's Weekend 2026!** 🎉

Install it. Play it. Share it. Make memories. 💖
