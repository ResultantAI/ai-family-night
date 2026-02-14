#!/bin/bash

# AI Family Night - Quick Deploy Script
# Deploys to GitHub Pages in one command

echo "🏡 AI Family Night - Deployment Script"
echo "======================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit: AI Family Night PWA with Valentine's & President's Day games"
fi

# Check if remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo ""
    echo "🔗 Creating GitHub repository..."
    echo "Repository name: ai-family-night"
    echo ""

    gh repo create ai-family-night --public --source=. --push

    if [ $? -ne 0 ]; then
        echo "❌ Failed to create repository. Make sure 'gh' CLI is installed."
        echo "Install with: brew install gh"
        exit 1
    fi
else
    echo "📤 Pushing to existing repository..."
    git add .
    git commit -m "Update: $(date '+%Y-%m-%d %H:%M')" || echo "No changes to commit"
    git push -u origin main || git push -u origin master
fi

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/$(gh api user -q .login)/ai-family-night/settings/pages"
echo "2. Under 'Source', select 'Deploy from a branch'"
echo "3. Select branch 'main' and folder '/ (root)'"
echo "4. Click 'Save'"
echo "5. Wait 1-2 minutes for deployment"
echo "6. Your app will be live at:"
echo "   https://$(gh api user -q .login).github.io/ai-family-night/"
echo ""
echo "🎉 Ready for Valentine's Weekend!"
