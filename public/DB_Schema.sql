-- Roles
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_name VARCHAR(100),
  description VARCHAR(255)
);

-- Permissions
CREATE TABLE permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  permission_key VARCHAR(100),
  description VARCHAR(255)
);

-- Role-Permissions Mapping
CREATE TABLE role_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT,
  permission_id INT,
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Users
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  username VARCHAR(100),
  email VARCHAR(150),
  password_hash VARCHAR(255),
  role_id INT,
  is_active BOOLEAN DEFAULT TRUE,
  contact VARCHAR(50),
  address VARCHAR(255),
  img_url LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- User-Permissions (Override)
CREATE TABLE user_permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  permission_id INT,
  is_allowed BOOLEAN,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (permission_id) REFERENCES permissions(id)
);

-- Categories
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

-- Products
CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_type VARCHAR(50),
  name VARCHAR(150),
  brand VARCHAR(100),
  code VARCHAR(100),
  new_code VARCHAR(100),
  shade VARCHAR(100),
  new_shade VARCHAR(100),
  size VARCHAR(50),
  photo_url VARCHAR(255),
  qty INT DEFAULT 0,
  unit VARCHAR(50),
  cost_price DECIMAL(10,2),
  selling_price DECIMAL(10,2),
  reorder_level INT,
  category_id INT,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

-- Suppliers
CREATE TABLE suppliers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  contact VARCHAR(50),
  address VARCHAR(255),
  remark VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Purchases
CREATE TABLE purchases (
  id INT AUTO_INCREMENT PRIMARY KEY,
  supplier_id INT,
  user_id INT,
  total_amount DECIMAL(10,2),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Purchase Items
CREATE TABLE purchase_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  purchase_id INT,
  product_id INT,
  qty INT,
  cost_price DECIMAL(10,2),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Customers
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150),
  contact VARCHAR(50),
  remark VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invoices
CREATE TABLE invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(100),
  customer_id INT,
  user_id INT,
  total_amount DECIMAL(10,2),
  discount DECIMAL(10,2),
  net_amount DECIMAL(10,2),
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Invoice Items
CREATE TABLE invoice_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT,
  product_id INT,
  qty INT,
  selling_price DECIMAL(10,2),
  line_total DECIMAL(10,2),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Returns
CREATE TABLE returns (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_id INT NULL,
  purchase_id INT NULL,
  product_id INT,
  qty INT,
  reason VARCHAR(255),
  status VARCHAR(50),
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Stock Logs
CREATE TABLE stock_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT,
  action VARCHAR(50),
  qty INT,
  invoice_id INT NULL,
  purchase_id INT NULL,
  return_id INT NULL,
  user_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id),
  FOREIGN KEY (invoice_id) REFERENCES invoices(id),
  FOREIGN KEY (purchase_id) REFERENCES purchases(id),
  FOREIGN KEY (return_id) REFERENCES returns(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(100),
  table_name VARCHAR(100),
  record_id INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
