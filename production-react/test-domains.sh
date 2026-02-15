#!/bin/bash

echo "🔍 Testing AI Family Night Domains..."
echo ""

echo "1. Testing Vercel URL (should work now):"
curl -I -s https://production-react-6asrv3brk-chris-projects-16eb8f38.vercel.app/games/presidential-time-machine | head -1
echo ""

echo "2. Testing custom domain (may not work yet):"
curl -I -s https://aifamilynight.com/games/presidential-time-machine 2>/dev/null | head -1 || echo "Not ready yet (DNS still propagating)"
echo ""

echo "3. DNS lookup for aifamilynight.com:"
dig +short aifamilynight.com
echo ""

echo "4. DNS lookup for www.aifamilynight.com:"
dig +short www.aifamilynight.com
echo ""

echo "Expected Results:"
echo "- Vercel URL: HTTP/2 200"
echo "- Custom domain: HTTP/2 200 (when ready)"
echo "- DNS lookup: 76.76.21.21"
echo "- www DNS: cname.vercel-dns.com"
