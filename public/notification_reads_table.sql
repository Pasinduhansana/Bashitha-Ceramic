-- Create notification_reads table to track which notifications have been read by which users

CREATE TABLE IF NOT EXISTS notification_reads (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  notification_id INT NOT NULL,
  read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, notification_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (notification_id) REFERENCES audit_logs(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user_id ON notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notification_id ON notification_reads(notification_id);
