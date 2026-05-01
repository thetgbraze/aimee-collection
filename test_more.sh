#!/bin/bash
TESTS=(
"https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&q=60"
"https://images.unsplash.com/photo-1596944924616-7b38e7cf9361?w=800&q=60"
"https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=60"
"https://images.unsplash.com/photo-1596304561023-eb3e9d891667?w=800&q=60"
"https://images.unsplash.com/photo-1533682805518-48d1f5e8bb3c?w=800&q=60"
)

for URL in "${TESTS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$URL")
  if [ "$STATUS" != "200" ]; then
    echo "BROKEN: $STATUS $URL"
  else
    echo "OK: $STATUS $URL"
  fi
done
