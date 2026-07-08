# Supabase PostgreSQL Setup Guide

This guide will help you connect your Next.js application to Supabase PostgreSQL database.

## 🚀 Quick Start

### Step 1: Create a Supabase Account and Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in the project details:
   - **Name**: bashitha-ceramics (or your preferred name)
   - **Database Password**: Create a strong password (SAVE THIS!)
   - **Region**: Choose the closest region to your users
   - **Pricing Plan**: Select Free tier or Pro based on your needs
5. Click **"Create new project"**
6. Wait 2-3 minutes for your project to be set up

---

### Step 2: Get Your Database Connection Details

1. In your Supabase project dashboard, go to **Settings** (gear icon) → **Database**
2. Scroll down to **"Connection string"** section
3. Select **"URI"** tab
4. You'll see a connection string like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```

Alternatively, you can use the **"Connection parameters"** tab which shows:

- **Host**: `db.xxxxxxxxxxxxx.supabase.co`
- **Database**: `postgres`
- **Port**: `5432`
- **User**: `postgres`
- **Password**: Your database password

---

### Step 3: Create Environment Variables

Create or update your `.env.local` file in the root of your project:

```env
# PostgreSQL Database Configuration (Supabase)
POSTGRES_HOST=db.xxxxxxxxxxxxx.supabase.co
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_database_password_here
POSTGRES_DATABASE=postgres
POSTGRES_SSL=true

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Cloudinary Configuration (if using)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (if using)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

**Important Notes:**

- Replace `db.xxxxxxxxxxxxx.supabase.co` with your actual Supabase host
- Replace `your_database_password_here` with the password you created in Step 1
- Set `POSTGRES_SSL=true` for Supabase (SSL is required)
- Generate a secure `NEXTAUTH_SECRET` using: `openssl rand -base64 32`

---

### Step 4: Install PostgreSQL Driver

Run the following command in your terminal:

```bash
npm install pg
```

This replaces the `mysql2` package with the PostgreSQL driver.

---

### Step 5: Set Up Your Database Schema

You have two options to create your database tables:

#### Option A: Using Supabase SQL Editor (Recommended)

1. In your Supabase dashboard, go to **SQL Editor** (icon on left sidebar)
2. Click **"New Query"**
3. Copy the contents of `public/DB_Schema.sql`
4. Paste into the SQL Editor
5. Click **"Run"**
6. Repeat for:
   - `public/notification_reads_table.sql`
   - `public/user_preferences_table.sql`

#### Option B: Using a PostgreSQL Client (pgAdmin, DBeaver, etc.)

1. Install a PostgreSQL client tool
2. Connect using the connection details from Step 2
3. Execute the SQL files:
   - `public/DB_Schema.sql`
   - `public/notification_reads_table.sql`
   - `public/user_preferences_table.sql`

---

### Step 6: Initialize Default Data

After creating the tables, you'll need to insert initial data:

#### 1. Initialize Permissions (Required)

Run your Next.js app and call the init-permissions endpoint:

```bash
# Start your development server
npm run dev

# In another terminal, call the initialization endpoint
curl http://localhost:3000/api/init-permissions
```

Or visit `http://localhost:3000/api/init-permissions` in your browser.

#### 2. Create Default Admin User (Optional)

You can use the Supabase SQL Editor to create a default admin user:

```sql
-- First, get the admin role_id
SELECT id FROM roles WHERE role_name = 'Admin';

-- Insert admin user (replace password_hash with a bcrypt hash of your password)
INSERT INTO users (name, username, email, password_hash, role_id, is_active, created_at, updated_at)
VALUES (
  'Admin User',
  'admin',
  'admin@bashithaceramics.com',
  '$2a$10$YourBcryptHashHere', -- Generate using bcryptjs
  1, -- role_id from previous query
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
```

To generate a bcrypt hash, you can use:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
```

---

### Step 7: Test Your Connection

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Try to access your login page:

   ```
   http://localhost:3000/login
   ```

3. Check the terminal for any connection errors

---

## 🔒 Security Best Practices

### 1. Environment Variables

- **Never commit** `.env.local` to Git
- Add `.env.local` to your `.gitignore` file
- Use different credentials for development and production

### 2. Database Security

- Enable Row Level Security (RLS) in Supabase for sensitive tables
- Use the Supabase dashboard to manage user access
- Regularly rotate your database password

### 3. Connection Pooling

The application uses connection pooling with these settings:

- Max connections: 10
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds

---

## 📊 Supabase Dashboard Features

### Table Editor

- View and edit your data directly in the browser
- Go to **Table Editor** in the left sidebar

### SQL Editor

- Write and execute custom SQL queries
- Save frequently used queries

### Database Backups

- Automatic daily backups (on Pro plan)
- Manual backup options available

### Logs

- Monitor database queries and errors
- Go to **Logs** → **Postgres Logs**

### API Auto-generated

- Supabase generates REST and GraphQL APIs automatically
- Not used in this app (we use custom Next.js API routes)

---

## 🐛 Troubleshooting

### Connection Timeout

**Error**: `Error: connect ETIMEDOUT`

**Solutions**:

- Check if your IP is allowed (Supabase allows all IPs by default)
- Verify `POSTGRES_SSL=true` is set
- Check if Supabase service is down: [status.supabase.com](https://status.supabase.com)

### Authentication Failed

**Error**: `password authentication failed for user "postgres"`

**Solutions**:

- Verify your database password in `.env.local`
- Reset your database password in Supabase Settings → Database

### SSL Required Error

**Error**: `no pg_hba.conf entry for host`

**Solution**:

- Make sure `POSTGRES_SSL=true` in your `.env.local`

### Too Many Connections

**Error**: `sorry, too many clients already`

**Solutions**:

- Reduce `max` in your connection pool (in `src/lib/db.js`)
- Upgrade your Supabase plan for more connections
- Check for connection leaks in your code

### Table Does Not Exist

**Error**: `relation "table_name" does not exist`

**Solution**:

- Run the SQL schema files in Supabase SQL Editor
- Make sure you're using the correct database name

---

## 🚀 Production Deployment

### Environment Variables for Production

When deploying to Vercel, Netlify, or other platforms:

1. Add all environment variables from `.env.local`
2. Update `NEXTAUTH_URL` to your production domain:
   ```
   NEXTAUTH_URL=https://yourdomain.com
   ```
3. Generate a new `NEXTAUTH_SECRET` for production
4. Keep the same Supabase credentials (or create a separate production project)

### Database Migration Strategy

1. **Development**: Use your Supabase project
2. **Production**: Either use the same project or create a separate one
3. Run migrations using Supabase CLI or SQL Editor

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg) Documentation](https://node-postgres.com/)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🆘 Need Help?

If you encounter issues:

1. Check Supabase Logs in your dashboard
2. Check your application logs (terminal output)
3. Verify all environment variables are set correctly
4. Ensure your database schema is created properly
5. Visit [Supabase Discord](https://discord.supabase.com/) for community support

---

## ✅ Verification Checklist

Before going to production, verify:

- [ ] Database tables created successfully
- [ ] Initial permissions and roles inserted
- [ ] Admin user created and can log in
- [ ] All API routes working correctly
- [ ] Environment variables set for production
- [ ] `.env.local` added to `.gitignore`
- [ ] Database backups configured
- [ ] SSL connection working
- [ ] Application can handle expected load

---

## 🎉 Success!

Your application is now connected to Supabase PostgreSQL database. You can:

- Use the Supabase dashboard to monitor your database
- Scale your database as your application grows
- Take advantage of Supabase's additional features (Auth, Storage, Functions)

Happy coding! 🚀
