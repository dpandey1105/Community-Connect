# Production Deployment Checklist

## Backend Configuration ✅

### Environment Variables (Update in production)
- [ ] `FRONTEND_URL` - Set to your actual frontend domain
- [ ] `PORT` - Matches deployment platform requirements
- [ ] `NODE_ENV=production`
- [ ] Database connection strings are production-ready
- [ ] JWT_SECRET is secure and different from development

### CORS Configuration ✅
- Backend now properly uses `FRONTEND_URL` environment variable
- Fallback to localhost for development

## Frontend Configuration ✅

### Environment Variables (Create .env.production)
- [ ] `VITE_API_URL` - Set to your backend domain
- [ ] `VITE_WS_URL` - Set to your WebSocket URL (if needed)

### API Configuration ✅
- Created `config.js` for environment-aware API URLs
- Updated `queryClient.js` to use proper API endpoints
- Automatic detection of development vs production

## Deployment Steps

### 1. Backend Deployment
```bash
# Set environment variables on your hosting platform:
FRONTEND_URL=https://your-frontend-domain.com
PORT=5222  # or platform-specific port
NODE_ENV=production
```

### 2. Frontend Deployment
```bash
# Create .env.production with:
VITE_API_URL=https://your-backend-domain.com

# Build for production
npm run build
```

### 3. Verification Tests

#### Test API Connectivity
1. Open browser dev tools → Network tab
2. Login to the application
3. Verify API calls go to correct production URLs
4. Check for CORS errors (should be none)

#### Test Authentication Flow
1. Register new user
2. Login/logout
3. Access protected routes
4. Verify tokens are properly handled

#### Test Environment Detection
1. Check console logs for API URLs being used
2. Verify no localhost references in production

## Common Issues & Solutions

### CORS Errors
- Ensure `FRONTEND_URL` matches exact frontend domain
- Include protocol (https://) and no trailing slash

### API 404 Errors  
- Verify `VITE_API_URL` points to correct backend
- Check backend is running on expected port

### Authentication Issues
- Verify JWT_SECRET is set in production
- Check token storage/retrieval in browser dev tools

### Mixed Content Errors
- Ensure both frontend and backend use HTTPS in production
- Update WebSocket URLs to use WSS protocol

## Files Modified ✅
- `frontend/src/lib/config.js` (NEW)
- `frontend/src/lib/queryClient.js` (UPDATED)
- `frontend/.env.production` (NEW)
- `backend/index.js` (PORT fix)
- `.env` (Added FRONTEND_URL)