-- Create notification_reads table to track which notifications have been read by which users

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
