# Notification System Setup

## Overview

The notification system tracks user actions through audit logs and displays them in the header notification dropdown. Users can mark notifications as read, and read notifications won't appear again for that user.

## Database Setup

### 1. Create the notification_reads table

Run the SQL script in `/public/notification_reads_table.sql`:

```sql
CREATE TABLE IF NOT EXISTS notification_reads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  notification_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_notification (user_id, notification_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notification_id) REFERENCES audit_logs(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_notification_id (notification_id)
);
```

## Features

### 1. Real-time Notifications

- Notifications are fetched from the `audit_logs` table
- Only unread notifications are displayed (those not in `notification_reads` table)
- Notification count badge shows number of unread items

### 2. Mark as Read

- Hover over any notification to reveal the "Mark as read" button (CheckCircle icon)
- Click the button to mark the notification as read
- The notification immediately disappears from the list
- Toast confirmation appears

### 3. Color Coding

- **Green**: CREATE/ADD actions
- **Blue**: UPDATE/EDIT actions
- **Red**: DELETE/REMOVE actions
- **Purple**: Other actions

### 4. User Initials

- Avatar shows user initials extracted from their name
- Colored background based on action type

## API Endpoints

### GET /api/notifications

Fetches unread notifications for the current user.

**Response:**

```json
{
  "notifications": [
    {
      "id": 1,
      "action": "CREATE_PRODUCT",
      "table_name": "products",
      "record_id": 123,
      "timestamp": "2026-01-27T10:30:00.000Z",
      "user_name": "John Doe",
      "user_img_url": null,
      "description": "CREATE PRODUCT on products"
    }
  ],
  "count": 1
}
```

### POST /api/notifications

Marks a notification as read for the current user.

**Request:**

```json
{
  "notificationId": 1
}
```

**Response:**

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

## Usage

The notification system is automatically integrated into the InventoryHeader component. Any action that creates an audit log entry will appear as a notification for all users until they mark it as read.

### How Audit Logs Create Notifications

When a user performs an action (create product, update invoice, delete customer, etc.), the system:

1. Logs the action in the `audit_logs` table
2. All users see this in their notification dropdown
3. Each user can independently mark it as read
4. Once marked as read, it no longer appears for that user

## Customization

### Modify Notification Display

Edit the notification rendering in `InventoryHeader.js`:

- Change color schemes in `getNotificationColor()`
- Adjust description format in the API response
- Customize the icon display

### Filter Notifications

Update the SQL query in `/api/notifications/route.js` to:

- Show only specific action types
- Limit to certain tables
- Add time-based filters (e.g., only last 7 days)

### Example: Show only product-related notifications

```sql
WHERE nr.id IS NULL AND a.table_name = 'products'
```

## Testing

1. **Create a test notification**: Add a product or perform any CRUD operation
2. **Check notification appears**: Open the notification dropdown in the header
3. **Mark as read**: Hover and click the CheckCircle icon
4. **Verify it's gone**: Refresh and check it no longer appears
5. **Login as different user**: The notification should still appear for other users

## Troubleshooting

### Notifications not appearing

- Check if audit logs are being created properly
- Verify the `notification_reads` table exists
- Check browser console for API errors

### Mark as read not working

- Verify user authentication (token must be valid)
- Check database foreign key constraints
- Ensure notification ID is being passed correctly

### Count badge not updating

- The count updates when the notification list changes
- Try refreshing the notifications by closing and reopening the dropdown
