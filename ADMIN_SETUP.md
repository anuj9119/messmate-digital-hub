# Admin Setup Guide

## Creating an Admin User

Since the system assigns "student" role by default to all new users, you need to manually update a user to have admin privileges.

### Step 1: Sign Up as a Normal User

1. Go to your MessMate application at `/auth`
2. Select **"Admin Panel"**
3. Click on **"Sign up"** tab
4. Fill in your email and password
5. Submit the form

### Step 2: Update User Role to Admin

You need to access the backend database to assign admin role:

1. **Open Lovable Cloud Backend**
   - Click on the backend access button in your Lovable project

2. **Navigate to user_roles Table**
   - Find the `user_roles` table in the database
   - Locate your user record (it will have role = 'student')

3. **Add Admin Role**
   - You have two options:
   
   **Option A: Update existing role**
   - Edit the row where `user_id` matches your user
   - Change `role` from `'student'` to `'admin'`
   - Save changes

   **Option B: Add new admin role (keep student role too)**
   - Insert a new row with:
     - `user_id`: Your user ID (same as in auth.users table)
     - `role`: `'admin'`
   - This allows the user to have both student and admin access

### Step 3: Login as Admin

1. Go back to `/auth`
2. Select **"Admin Panel"**
3. Login with your credentials
4. You'll be redirected to `/admin` with full admin privileges

## Admin Capabilities

Once logged in as admin, you can:

### 1. **Graphical Menu Management**
   - Select date for menu
   - Add/Edit/Remove items for each meal type:
     - 🌅 Breakfast
     - 🍽️ Lunch
     - ☕ Snacks
     - 🌙 Dinner
   - Click on items to edit inline
   - Use + button to add new items
   - Hover over items to see edit/delete buttons
   - Save all changes with one click

### 2. **View All Student Tokens**
   - See all generated tokens across all students
   - Track token usage and meal types

### 3. **Future Features** (Coming Soon)
   - Send notifications to students
   - View analytics and reports
   - Weekly menu planning

## Troubleshooting

### Can't Access Admin Dashboard
- **Issue**: Redirected to student dashboard
- **Solution**: Verify your user has 'admin' role in `user_roles` table

### Login Shows Error
- **Issue**: Invalid credentials
- **Solution**: Make sure you're selecting "Admin Panel" before login

### Database Access Issues
- **Issue**: Can't see backend tables
- **Solution**: Make sure you have access to the Lovable Cloud backend through your project settings

## Security Notes

⚠️ **Important Security Information:**

1. **Never store roles in localStorage** - The system uses server-side role verification via the `user_roles` table
2. **Admin role is protected** - Only users with explicit admin role in database can access admin features
3. **RLS Policies** - Row Level Security ensures data protection at database level
4. **JWT Verification** - Edge functions verify user authentication via JWT tokens

## Need Help?

If you're having trouble setting up admin access:
1. Check that the `user_roles` table exists
2. Verify your user_id matches between `auth.users` and `user_roles`
3. Clear browser cache and try logging in again
4. Check browser console for any error messages
