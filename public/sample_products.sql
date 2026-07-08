-- ================================
-- DATA INSERTS FOR SUPABASE POSTGRESQL
-- Source: Consolidate Export.sql
-- Tables already exist
-- ================================

-- Insert Roles
INSERT INTO roles (id, role_name, description) VALUES
(1, 'default user', 'Default user access'),
(2, 'System Admin', 'Full system administrator access'),
(3, 'Owner', 'Business owner with high-level control'),
(4, 'Sales Assistant', 'Sales operations and basic inventory'),
(5, 'Staff', 'Basic staff with limited inventory access')
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO categories (id, name) VALUES
(1, 'Tiles / ටයිල්'),
(2, 'Bathroom & Kitchen Fixtures / නාන කාමර සහ මුළුතැන්ගෙයි උපකරණ'),
(3, 'Sanitaryware & Fittings / නල ජල උපකරණ'),
(4, 'Accessories / උපාංග'),
(5, 'Construction Materials / සෙරමික් සන්නිවේදන භාණ්ඩ'),
(6, 'Decorative Items / අලංකාර භාණ්ඩ')
ON CONFLICT (id) DO NOTHING;

-- Insert Permissions
INSERT INTO permissions (id, permission_key, description) VALUES
(1, 'manage_users', 'Manage users (CRUD, activation)'),
(2, 'configure_roles', 'Configure roles and permissions'),
(3, 'view_products', 'View product catalog and details'),
(4, 'edit_products', 'Add and edit products'),
(5, 'delete_products', 'Delete products'),
(6, 'manage_purchases', 'Create and manage purchases'),
(7, 'create_invoices', 'Create and manage invoices'),
(8, 'manage_returns', 'Create and manage returns'),
(9, 'view_stock_logs', 'View stock movement logs'),
(10, 'update_stock', 'Manually adjust stock'),
(11, 'access_reports', 'Access reporting views'),
(12, 'approve_purchases', 'Approve or delete purchases'),
(13, 'approve_returns', 'Approve or reject returns'),
(14, 'view_audit_logs', 'View system audit logs')
ON CONFLICT (id) DO NOTHING;

-- Insert Role Permissions (System Admin gets all permissions)
INSERT INTO role_permissions (role_id, permission_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8), (2, 9), (2, 10), (2, 11), (2, 12), (2, 13), (2, 14),
(3, 3), (3, 4), (3, 6), (3, 7), (3, 8), (3, 9), (3, 11), (3, 12), (3, 13),
(4, 3), (4, 4), (4, 7), (4, 8), (4, 9),
(5, 3)
ON CONFLICT DO NOTHING;

-- ================================
-- SAMPLE PRODUCTS (20 Records)
-- ================================

INSERT INTO products (product_type, name, brand, code, shade, size, photo_url, qty, unit, cost_price, selling_price, reorder_level, category_id, description) VALUES

-- Category 1: Tiles / ටයිල් (8 products)
('Floor Tile', 'Premium Porcelain Floor Tile', 'RAK Ceramics', 'RAK-PT-001', 'Ivory White', '600x600mm', NULL, 250, 'sqm', 1200.00, 1650.00, 30, 1, 'High-gloss porcelain floor tile suitable for living rooms and commercial spaces'),
('Wall Tile', 'Designer Wall Tile Glossy', 'Johnson Tiles', 'JOH-DW-002', 'Cream Beige', '300x600mm', NULL, 300, 'sqm', 580.00, 850.00, 40, 1, 'Glossy finish designer wall tiles with subtle texture'),
('Floor Tile', 'Vitrified Floor Tile Matt', 'Somany', 'SOM-VF-003', 'Stone Grey', '800x800mm', NULL, 180, 'sqm', 1450.00, 1980.00, 25, 1, 'Large format vitrified tiles with anti-slip matt finish'),
('Wall Tile', 'Subway Tile Metro Style', 'Kajaria', 'KAJ-ST-004', 'Pure White', '100x300mm', NULL, 400, 'sqm', 420.00, 620.00, 50, 1, 'Classic metro subway tiles for modern interiors'),
('Floor Tile', 'Wooden Effect Plank Tile', 'Orient Bell', 'ORI-WE-005', 'Oak Brown', '200x1200mm', NULL, 150, 'sqm', 1580.00, 2150.00, 20, 1, 'Natural wood appearance ceramic tile, waterproof and durable'),
('Wall Tile', 'Mosaic Tile Sheet', 'RAK Ceramics', 'RAK-MS-006', 'Mixed Blue', '300x300mm', NULL, 120, 'sheets', 950.00, 1350.00, 15, 1, 'Glass mosaic sheet for feature walls and backsplashes'),
('Floor Tile', 'Outdoor Patio Tile Anti-Slip', 'Johnson Tiles', 'JOH-OP-007', 'Terracotta', '400x400mm', NULL, 220, 'sqm', 780.00, 1100.00, 30, 1, 'Weather-resistant anti-slip tiles for outdoor use'),
('Wall Tile', '3D Feature Wall Tile', 'Somany', 'SOM-3D-008', 'Marble White', '300x600mm', NULL, 160, 'sqm', 1100.00, 1550.00, 20, 1, 'Three-dimensional textured tiles for accent walls'),

-- Category 2: Bathroom & Kitchen Fixtures (4 products)
('Sink', 'Stainless Steel Kitchen Sink', 'Nirali', 'NIR-KS-009', 'Silver', 'Single Bowl', NULL, 45, 'units', 4500.00, 6200.00, 8, 2, 'Premium grade 304 stainless steel kitchen sink with drain basket'),
('Faucet', 'Chrome Basin Faucet', 'Jaquar', 'JAQ-BF-010', 'Chrome', 'Standard', NULL, 60, 'units', 2800.00, 3950.00, 10, 2, 'Single lever basin mixer with brass body and chrome finish'),
('Shower', 'Rain Shower Head Set', 'Cera', 'CER-RS-011', 'Silver', '200mm', NULL, 35, 'units', 3200.00, 4500.00, 8, 2, 'Overhead rain shower with flexible hose and hand shower'),
('Cabinet', 'Bathroom Vanity Cabinet', 'Hindware', 'HIN-VC-012', 'White', '600mm', NULL, 25, 'units', 8500.00, 11800.00, 5, 2, 'Wall-mounted vanity cabinet with integrated basin'),

-- Category 3: Sanitaryware & Fittings (4 products)
('Toilet', 'Wall Hung Toilet Suite', 'Parryware', 'PAR-WH-013', 'White', 'Standard', NULL, 30, 'units', 12500.00, 17200.00, 6, 3, 'European style wall-hung WC with soft-close seat'),
('Washbasin', 'Pedestal Wash Basin', 'Hindware', 'HIN-PW-014', 'White', 'Medium', NULL, 40, 'units', 3800.00, 5300.00, 8, 3, 'Ceramic pedestal basin with overflow protection'),
('Urinal', 'Wall Mounted Urinal', 'Cera', 'CER-WU-015', 'White', 'Standard', NULL, 20, 'units', 4200.00, 5800.00, 5, 3, 'Wall-hung urinal with concealed trap'),
('Fittings', 'Angle Valve Chrome Set', 'Jaquar', 'JAQ-AV-016', 'Chrome', '15mm', NULL, 100, 'pairs', 380.00, 550.00, 20, 3, 'Brass angle valves with chrome plating, pack of 2'),

-- Category 4: Accessories (2 products)
('Holder', 'Towel Rail Chrome 600mm', 'Cera', 'CER-TR-017', 'Chrome', '600mm', NULL, 50, 'units', 850.00, 1200.00, 10, 4, 'Single towel rail with concealed screws'),
('Holder', 'Soap Dispenser & Holder Set', 'Jaquar', 'JAQ-SD-018', 'Chrome', 'Standard', NULL, 45, 'sets', 1200.00, 1680.00, 10, 4, 'Wall-mounted soap dispenser with tumbler holder'),

-- Category 5: Construction Materials (1 product)
('Adhesive', 'Tile Adhesive Cement Based', 'Laticrete', 'LAT-TA-019', 'Grey', '20kg', NULL, 180, 'bags', 1250.00, 1750.00, 25, 5, 'High-performance tile adhesive for walls and floors'),

-- Category 6: Decorative Items (1 product)
('Mirror', 'LED Illuminated Bathroom Mirror', 'Cera', 'CER-LM-020', 'Silver', '600x800mm', NULL, 15, 'units', 6500.00, 9200.00, 5, 6, 'Frameless LED mirror with touch sensor and demister');

-- ================================
-- RESET SEQUENCES
-- ================================
SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles));
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
SELECT setval('permissions_id_seq', (SELECT MAX(id) FROM permissions));
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));
