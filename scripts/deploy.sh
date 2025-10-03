#!/bin/bash

# 🚀 Invoice Management System - Deployment Script

echo "🔧 Invoice Management System - Deployment Helper"
echo "=================================================="

# Check if git remote exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote repository found"
    exit 1
fi

# Show current status
echo "📊 Current Status:"
echo "   Branch: $(git branch --show-current)"
echo "   Remote: $(git remote get-url origin)"
echo "   Commits: $(git rev-list --count HEAD)"
echo ""

# Check if there are uncommitted changes
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Do you want to commit these changes? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "📝 Committing changes..."
        git add .
        read -p "Enter commit message: " commit_msg
        if [[ -z "$commit_msg" ]]; then
            commit_msg="Update $(date '+%Y-%m-%d %H:%M:%S')"
        fi
        git commit -m "$commit_msg"
        echo "✅ Changes committed"
    else
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

echo ""
echo "🚀 Pushing to GitHub..."
echo "   Repository: https://github.com/shagara2112/invoice-management-system"
echo ""

# Try to push
if git push -u origin main; then
    echo ""
    echo "🎉 SUCCESS! Code pushed to GitHub"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Visit: https://github.com/shagara2112/invoice-management-system"
    echo "   2. Setup GitHub Secrets for CI/CD"
    echo "   3. Deploy to Vercel/Netlify/Railway"
    echo ""
    echo "🔗 Quick Links:"
    echo "   Repository: https://github.com/shagara2112/invoice-management-system"
    echo "   Issues: https://github.com/shagara2112/invoice-management-system/issues"
    echo "   Settings: https://github.com/shagara2112/invoice-management-system/settings"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. GitHub authentication (use Personal Access Token)"
    echo "   2. Repository permissions"
    echo "   3. Network connection"
    echo ""
    echo "💡 Try running:"
    echo "   git push -u origin main"
    echo ""
    echo "📖 See PUSH_TO_GITHUB_INSTRUCTIONS.md for detailed help"
fi