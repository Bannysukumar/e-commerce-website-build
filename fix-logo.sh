#!/bin/bash
# Script to fix missing logo.jpg on the server

cd /www/wwwroot/swebirdshop.com/e-commerce-website-build

echo "=== Checking logo.jpg ==="
if [ -f "public/logo.jpg" ]; then
    echo "✅ logo.jpg exists in public/"
    ls -lh public/logo.jpg
else
    echo "❌ logo.jpg missing in public/"
    echo "Pulling latest from git..."
    git pull
    if [ -f "public/logo.jpg" ]; then
        echo "✅ logo.jpg now exists after git pull"
    else
        echo "⚠️  logo.jpg still missing. Checking git status..."
        git status public/logo.jpg
        echo "If file is not tracked, you may need to add it:"
        echo "  git add public/logo.jpg && git commit -m 'Add logo.jpg' && git push"
    fi
fi

echo ""
echo "=== Verifying logo is accessible ==="
if [ -f "public/logo.jpg" ]; then
    echo "Testing logo access..."
    curl -I http://localhost:3000/logo.jpg 2>&1 | head -5
fi

echo ""
echo "=== Rebuilding if needed ==="
if [ -f "public/logo.jpg" ]; then
    echo "Logo exists, rebuilding to ensure it's served..."
    rm -rf .next
    PATH="/usr/bin:$PATH" npm run build
    pm2 restart swebirdshop
    echo "✅ Rebuild complete"
fi

