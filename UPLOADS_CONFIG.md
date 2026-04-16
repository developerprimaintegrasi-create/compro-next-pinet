# Image Uploads & Asset Serving Configuration

## Overview

This project uses a two-tier approach for serving images and uploads to ensure compatibility with both HTTP and HTTPS protocols:

1. **Development/Testing**: Symbolic link from backend uploads folder
2. **HTTPS Compatibility**: API proxy route at `/api/uploads/[...path]`

## How It Works

### Local File Serving (Default)

The `/api/uploads/[...path]` route serves files from the symlinked `uploads` folder:

```
/opt/compro-next-pinet/uploads -> /opt/pinet-compro/backend/uploads
```

When you request an image, the flow is:
1. Frontend calls `/api/uploads/images/filename.png`
2. Next.js API route reads from the symlinked uploads folder
3. File is served with appropriate MIME type and CORS headers

### Fallback to Backend (Optional)

If a file is not found locally, the API route can proxy to the backend:

```
GET /api/uploads/images/filename.png
  → Check local symlinked uploads folder
  → If not found, proxy to `${BACKEND_URL}/uploads/images/filename.png`
```

This requires `BACKEND_URL` environment variable to be set.

## Configuration

### Environment Variables

```env
# Backend API endpoint for data requests
NEXT_PUBLIC_API_URL=/api

# Backend server URL (used by API routes for proxying)
# Optional - only needed if backend and frontend are on different servers
BACKEND_URL=http://192.168.30.253:5000

# Deprecated - no longer used
# NEXT_PUBLIC_BACKEND_URL=...
```

## Benefits

✅ **HTTPS Safe**: No mixed content warnings when transitioning to HTTPS  
✅ **Flexible**: Works whether backend and frontend are on same server or different servers  
✅ **Cached**: Images are cached indefinitely (immutable cache headers)  
✅ **CORS Safe**: Proper CORS headers set for cross-origin requests  
✅ **Fallback**: Can proxy to backend if needed  

## Image URL Format in Frontend

The `getImageUrl()` utility function automatically converts backend image paths to API routes:

```javascript
// Backend returns:
// { image_url: "/uploads/images/image-123.png" }

// Frontend converts to:
// /api/uploads/images/image-123.png
```

No changes needed in components - everything works automatically.

## Setup Steps (Already Done)

1. ✅ Created symlink: `uploads` → `/opt/pinet-compro/backend/uploads`
2. ✅ Updated `/api/uploads/[...path]/route.ts` to handle local files and proxy
3. ✅ Updated `utils/imageUtils.js` to use `/api/uploads` routes
4. ✅ Updated `.env.local` with new configuration

## Testing

Test image serving:
```bash
curl http://localhost:3000/api/uploads/images/image-1776341062117-224874463.png -I
```

Expected response:
```
HTTP/1.1 200 OK
Content-Type: image/png
Cache-Control: public, max-age=31536000, immutable
Access-Control-Allow-Origin: *
```

## Migration to Production with HTTPS

When you get your domain and switch to HTTPS:

1. **No code changes needed** - images automatically serve via HTTPS
2. Upload the backend uploads folder to server (already in place via symlink)
3. Ensure `uploads` folder is writable by Node.js process
4. Images will be served as: `https://yourdomain.com/api/uploads/...`

## Troubleshooting

### Images return 404

1. Check symlink exists: `ls -la /opt/compro-next-pinet/uploads`
2. Check file exists: `ls -la /opt/pinet-compro/backend/uploads/images/`
3. Check permissions: uploads folder should be readable by Node process
4. Check env vars: `BACKEND_URL` should be set correctly

### CORS errors in browser

The API route sets proper CORS headers, but if you still see errors:
1. Check browser console for actual error message
2. Verify domain matches origin header
3. Try accessing directly: `https://yourdomain.com/api/uploads/...`

### Mixed content warnings with HTTPS

This setup prevents mixed content issues. If you still see warnings:
1. Clear browser cache (cache headers use immutable timestamps)
2. Check for hardcoded `http://` URLs in frontend components
3. Verify all images use `getImageUrl()` utility

## Deprecated Configuration

The following environment variable is no longer used:

```env
# ❌ DEPRECATED
NEXT_PUBLIC_BACKEND_URL=http://192.168.30.253:5000
```

Images now always use `/api/uploads` proxy route, which works regardless of backend URL.
