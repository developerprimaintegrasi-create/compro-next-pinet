#!/bin/bash

# Sync uploads folder from backend to Next.js
# This ensures new uploads are immediately available in Next.js API routes

BACKEND_UPLOADS="/opt/pinet-compro/backend/uploads"
NEXTJS_UPLOADS="/opt/compro-next-pinet/uploads"

# Create target directory if it doesn't exist
mkdir -p "$NEXTJS_UPLOADS"

# Sync files from backend to Next.js
# Use --delete to remove files that don't exist in backend
rsync -av --delete "$BACKEND_UPLOADS/" "$NEXTJS_UPLOADS/"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Uploads synced successfully"
echo "Backend: $BACKEND_UPLOADS"
echo "Next.js: $NEXTJS_UPLOADS"
