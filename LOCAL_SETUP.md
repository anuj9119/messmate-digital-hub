# MessMate - Local Development Setup Guide

This guide will help you set up the MessMate application on your local system with Nginx.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- npm or yarn
- Nginx
- Git

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd messmate

# Install dependencies
npm install
```

### 2. Configure Environment Variables

The `.env` file should already be present with your Lovable Cloud credentials. If not, create it:

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

### 3. Run Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## Nginx Configuration

### Option 1: Reverse Proxy Setup (Recommended for Local Testing)

1. **Create Nginx Configuration File**

Create a new file `/etc/nginx/sites-available/messmate`:

```nginx
server {
    listen 80;
    server_name localhost messmate.local;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

2. **Enable the Site**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/messmate /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

3. **Update Hosts File (Optional)**

If you want to use `messmate.local` instead of localhost:

```bash
# Edit hosts file
sudo nano /etc/hosts

# Add this line:
127.0.0.1    messmate.local
```

### Option 2: Build and Serve Static Files

1. **Build the Application**

```bash
npm run build
```

2. **Configure Nginx to Serve Static Files**

Create `/etc/nginx/sites-available/messmate`:

```nginx
server {
    listen 80;
    server_name localhost messmate.local;
    
    root /path/to/your/project/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable and Restart**

```bash
sudo ln -s /etc/nginx/sites-available/messmate /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## API Endpoints

The application uses Lovable Cloud backend with the following edge functions:

### Generate Token API

**Endpoint:** `https://zvdwqfgzrcpakamylwdm.supabase.co/functions/v1/generate-token`

**Method:** POST

**Headers:**
```
Authorization: Bearer <user_jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "mealType": "breakfast|lunch|snacks|dinner",
  "mealDate": "2025-10-23"
}
```

**Response:**
```json
{
  "success": true,
  "token": {
    "id": "uuid",
    "token_code": "MT-1234567890-ABC123",
    "meal_type": "lunch",
    "meal_date": "2025-10-23",
    "is_used": false,
    "created_at": "timestamp",
    "qr_code_data": "json_string"
  },
  "message": "Token generated successfully"
}
```

## Testing the APIs Locally

### Using the Application

1. **Sign Up as Student**
   - Go to `/auth`
   - Select "Student Panel"
   - Sign up with your email

2. **Generate Token**
   - Login to student dashboard
   - Select a meal type
   - Click "Generate Token (Free)"
   - Token will be generated without payment

3. **Test Admin Features**
   - Sign up another account
   - Update role to 'admin' in backend
   - Login via "Admin Panel"
   - Manage daily menus

### Using cURL (for API testing)

```bash
# First, get your JWT token from browser localStorage after login
# Open browser console and run: localStorage.getItem('sb-<project-id>-auth-token')

# Generate token
curl -X POST \
  https://zvdwqfgzrcpakamylwdm.supabase.co/functions/v1/generate-token \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mealType": "lunch",
    "mealDate": "2025-10-23"
  }'
```

## Troubleshooting

### Port Already in Use

If port 5173 is already in use:
```bash
# Find process using port
lsof -ti:5173

# Kill process
kill -9 <PID>
```

### Nginx Issues

```bash
# Check Nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# Test configuration
sudo nginx -t
```

### Database Connection Issues

- Ensure your `.env` file has correct Lovable Cloud credentials
- Check if you can access the backend dashboard
- Verify RLS policies are set correctly

## User Roles

The application has two roles:

1. **Student** (default)
   - View daily menus
   - Generate meal tokens
   - View their tokens

2. **Admin**
   - All student permissions
   - Create/update daily menus
   - View all tokens
   - Access admin dashboard

To make a user admin:
1. Sign up normally
2. Open backend dashboard
3. Go to `user_roles` table
4. Update the user's role from 'student' to 'admin'

## Payment Integration

Currently, the token generation is **FREE** for testing purposes. The payment UI is present but not functional yet. To add payment:

1. Enable Stripe integration in Lovable
2. Update the `StudentDashboard.tsx` to include payment flow
3. Modify the `generate-token` edge function to verify payment before token creation

## Need Help?

- Check console logs in browser (F12)
- View edge function logs in Lovable backend dashboard
- Check Nginx error logs: `/var/log/nginx/error.log`
- Verify database tables and RLS policies in backend
