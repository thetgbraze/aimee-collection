#!/bin/bash
NEW_URLS=(
"https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=800&q=60"
"https://images.unsplash.com/photo-1591557304153-6599cdbfdc54?w=800&q=60"
"https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=800&q=60"
"https://images.unsplash.com/photo-1629224314594-2b9a7102008f?w=800&q=60"
"https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=800&q=60"
"https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=800&q=60"
)

for URL in "${NEW_URLS[@]}"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -I "$URL")
  if [ "$STATUS" != "200" ]; then
    echo "BROKEN: $STATUS $URL"
  else
    echo "OK: $STATUS $URL"
  fi
done
