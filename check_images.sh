#!/bin/bash
URLS=(
"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=60"
"https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=60"
"https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=60"
"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=60"
"https://images.unsplash.com/photo-1582533561751-2afcbafefcd5?w=800&q=60"
"https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800&q=60"
"https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=800&q=60"
"https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=60"
"https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&q=60"
"https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=800&q=60"
"https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=60"
"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=60"
"https://images.unsplash.com/photo-1515562141207-7a8ea4114e39?w=800&q=60"
"https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=800&q=60"
"https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=60"
"https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?w=800&q=60"
"https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&q=60"
"https://images.unsplash.com/photo-1571401835393-8c5f353283bf?w=800&q=60"
"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=60"
"https://images.unsplash.com/photo-1562183241-b937e95585b6?w=800&q=60"
"https://images.unsplash.com/photo-1515347619362-e56598c48545?w=800&q=60"
"https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=800&q=60"
"https://images.unsplash.com/photo-1571859856639-d51e152ff1ce?w=800&q=60"
"https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=60"
)

for URL in "${URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$URL")
  if [ "$STATUS" != "200" ]; then
    echo "BROKEN: $STATUS $URL"
  else
    echo "OK: $STATUS $URL"
  fi
done
