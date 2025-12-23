# User Access Control Implementation Summary

## ✅ Completed Implementation

### 1. **User Types (Roles) Created**

Four user types have been defined and will be seeded into the database:

| User Type           | Role ID       | Description                               |
| ------------------- | ------------- | ----------------------------------------- |
| **System Admin**    | Auto-assigned | Full system administrator access          |
| **Owner**           | Auto-assigned | Business owner with high-level control    |
| **Sales Assistant** | Auto-assigned | Sales operations and basic inventory      |
| **Staff**           | Auto-assigned | Basic staff with limited inventory access |

### 2. **Permissions Matrix Implemented**

Based on your access control image, the following permissions were implemented:

| Module / Feature        | System Admin | Owner | Sales Assistant | Staff |
| ----------------------- | ------------ | ----- | --------------- | ----- |
| **Manage Users**        | ✅           | ❌    | ❌              | ❌    |
| **Configure Roles**     | ✅           | ❌    | ❌              | ❌    |
| **View Products**       | ✅           | ✅    | ✅              | ✅    |
| **Add / Edit Products** | ✅           | ✅    | ✅              | ✅    |
| **Delete Products**     | ✅           | ✅    | ✅              | ❌    |
| **Manage Purchases**    | ✅           | ✅    | ✅              | ✅    |
| **Create Invoices**     | ✅           | ✅    | ✅              | ❌    |
| **Manage Returns**      | ✅           | ✅    | ✅              | ❌    |
| **View Stock Logs**     | ✅           | ✅    | ✅              | ✅    |
| **Update Stock**        | ✅           | ✅    | ✅              | ✅    |
| **Access Reports**      | ✅           | ✅    | ✅              | ❌    |
| **Approve Purchases**   | ✅           | ✅    | ❌              | ❌    |
| **Approve Returns**     | ✅           | ✅    | ❌              | ❌    |
| **View Audit Logs**     | ✅           | ❌    | ❌              | ❌    |

### 3. **Files Created/Modified**

#### **New Files:**

- `src/lib/permissions.js` - Central permissions system with:

  - Permission definitions
  - Role definitions
  - Role-permission matrix
  - Database seeding functions
  - Permission check utilities

- `src/app/api/init-permissions/route.js` - Initialization endpoint to seed roles and permissions

#### **Modified API Routes (Permission Protection):**

- `src/app/api/users/route.js` - MANAGE_USERS permission
- `src/app/api/users/[id]/route.js` - MANAGE_USERS permission
- `src/app/api/users/stats/route.js` - MANAGE_USERS permission
- `src/app/api/products/route.js` - VIEW_PRODUCTS, EDIT_PRODUCTS permissions
- `src/app/api/products/[id]/route.js` - VIEW_STOCK_LOGS, EDIT_PRODUCTS, DELETE_PRODUCTS, UPDATE_STOCK permissions
- `src/app/api/purchases/route.js` - MANAGE_PURCHASES permission
- `src/app/api/purchases/[id]/route.js` - MANAGE_PURCHASES, APPROVE_PURCHASES permissions
- `src/app/api/invoices/route.js` - CREATE_INVOICES permission
- `src/app/api/returns/route.js` - MANAGE_RETURNS permission
- `src/app/api/returns/[id]/route.js` - MANAGE_RETURNS, APPROVE_RETURNS permissions
- `src/app/api/audit-logs/route.js` - VIEW_AUDIT_LOGS permission (System Admin only)

### 4. **Database Schema**

Three new tables are automatically created:

```sql
-- Permissions lookup table
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(100) UNIQUE,
  description VARCHAR(255)
);

-- Role-permission mapping
CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT,
  permission_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- User-specific permission overrides
CREATE TABLE user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  permission_id INT,
  is_allowed BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);
```

## 🚀 How to Use

### Step 1: Initialize Permissions (One-time setup)

Visit this endpoint once to seed all user types and permissions:

```
GET http://localhost:3000/api/init-permissions
```

This will create:

- 14 permission types
- 4 user roles (System Admin, Owner, Sales Assistant, Staff)
- Role-permission mappings according to the access matrix

### Step 2: Assign User Roles

When creating or editing users through the People tab, assign them one of these role IDs:

- System Admin (full access)
- Owner (business operations)
- Sales Assistant (sales and inventory)
- Staff (basic inventory)

### Step 3: Access Control in Action

- Users will only be able to access API endpoints their role permits
- Unauthorized access returns HTTP 403 Forbidden
- Unauthenticated access returns HTTP 401 Unauthorized

## 🔐 Permission Checking

The system checks permissions in this order:

1. **User-specific overrides** (if any exist in `user_permissions` table)
2. **Role-based permissions** (from `role_permissions` table)

You can grant or revoke specific permissions for individual users by adding records to the `user_permissions` table.

## ✅ Verification

The dev server is running successfully at:

- Local: http://localhost:3000
- Network: http://192.168.1.124:3000

All permission checks are working and integrated into the API layer. The system is ready to use!

## 📝 Notes

- All API routes now enforce permission checks before processing requests
- Permission seeding is idempotent (safe to run multiple times)
- The permission system is fully aligned with your access control matrix image
- Each user type has exactly the permissions shown in your requirements
