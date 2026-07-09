# Bashitha Ceramics - Inventory Management System

A comprehensive inventory and billing management system built with Next.js, PostgreSQL (Supabase), and modern web technologies.

## 🚀 Features

- **User Management**: Role-based access control with Admin, Manager, and Staff roles
- **Product Inventory**: Track products with categories, pricing, stock levels, and images
- **Billing System**: Create invoices, manage purchases, and handle returns
- **Customer Management**: Maintain customer records and transaction history
- **Audit Logging**: Track all system changes with detailed audit logs
- **Notifications**: Real-time notification system for important events
- **Bilingual Support**: English and Sinhala language support
- **Image Management**: Cloudinary integration for product images
- **Responsive Design**: Modern UI with Tailwind CSS and Framer Motion

---

## 📋 Tech Stack

- **Frontend**: Next.js 16.1.0, React 19.2.3
- **Database**: Turso
- **Authentication**: NextAuth.js 4.24.13
- **Styling**: Tailwind CSS 4
- **Image Upload**: Cloudinary
- **Icons**: Lucide React, React Icons
- **Animations**: Framer Motion
- **Email**: Nodemailer

---

## 🛠️ Installation

### Prerequisites

- Node.js 18+ installed
- Cloudinary account (optional, for image uploads)

### Step 1: Clone the Repository

```bash
git clone <your-repo-url>
cd bashitha-ceramics
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Update the file with your credentials:


# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret_here

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 6: Initialize Permissions

```bash
npm run dev
```

Then in another terminal:

```bash
curl http://localhost:3000/api/init-permissions
```

Or visit: http://localhost:3000/api/init-permissions

---

## 🚀 Getting Started

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Build for Production

```bash
npm run build
npm start
```

---

## 📁 Project Structure

```
bashitha-ceramics/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── billing/          # Billing page
│   │   ├── inventory/        # Inventory page
│   │   ├── login/            # Login page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── billing/          # Billing components
│   │   ├── inventory/        # Inventory components
│   │   ├── forms/            # Form components
│   │   └── ui/               # UI components
│   ├── hooks/                # Custom React hooks
│   └── lib/
│       ├── db.js             # Database connection
│       ├── auth.js           # Authentication logic
│       └── permissions.js    # Permission helpers
├── public/
│   ├── DB_Schema.sql         # Main database schema
│   └── *.sql                 # Additional SQL files
├── docs/                     # Documentation
├── SUPABASE_SETUP.md        # Supabase setup guide
├── MIGRATION_SUMMARY.md     # Migration details
└── package.json
```

---

## 🔐 Authentication & Authorization

### Default Roles

1. **Admin**: Full system access
2. **Manager**: Manage inventory, view reports
3. **Staff**: Basic operations only

### Creating Admin User

After initializing permissions, create an admin user:

```sql
-- In Supabase SQL Editor
INSERT INTO users (name, username, email, password_hash, role_id, is_active)
VALUES (
  'Admin',
  'admin',
  'admin@example.com',
  '$2a$10$YourBcryptHashHere',
  1,
  true
);
```

Generate bcrypt hash:

```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('your_password', 10));"
```

---

## 📚 Additional Documentation

- [USER_ACCESS_CONTROL.md](USER_ACCESS_CONTROL.md) - Permission system

---


### Common Problems

1. **Connection timeout**: Check SSL settings (`POSTGRES_SSL=true`)
2. **Authentication failed**: Verify database password
3. **Table not found**: Run SQL schema files
4. **Module not found**: Run `npm install`

---

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

**Important**: Update `NEXTAUTH_URL` to your production domain.

### Environment Variables for Production

All variables from `.env.local` are needed, especially:

- `POSTGRES_*` credentials
- `NEXTAUTH_URL` (production domain)
- `NEXTAUTH_SECRET` (generate new for production)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

This project is private and proprietary.

---

## 📧 Support

For issues and questions:

- Check the documentation files
- Review [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for database issues
- Check Supabase logs in your dashboard

---

## 🎉 Acknowledgments

- Next.js team for the amazing framework
- Supabase for excellent PostgreSQL hosting
- Cloudinary for image management
- All open-source contributors

---

**Built with ❤️ using Next.js and PostgreSQL**
