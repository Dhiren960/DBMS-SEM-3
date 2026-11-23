-- Canteen Management System - K.R. Mangalam University A Block Canteen
-- Run this file once to create the database, tables and menu data.

CREATE DATABASE IF NOT EXISTS canteen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE canteen_db;

DROP VIEW IF EXISTS active_orders;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS menu_items;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

CREATE TABLE categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE menu_items (
  item_id     INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  category_id INT NOT NULL,
  price       DECIMAL(8,2) NOT NULL,
  is_veg      TINYINT(1) NOT NULL DEFAULT 1,
  available   TINYINT(1) NOT NULL DEFAULT 1,
  image       VARCHAR(255) NULL,
  CONSTRAINT chk_item_price CHECK (price > 0),
  CONSTRAINT fk_item_category FOREIGN KEY (category_id)
    REFERENCES categories(category_id) ON DELETE RESTRICT,
  INDEX idx_item_category (category_id)
);

-- Customers who sign up with email + password
CREATE TABLE users (
  user_id       INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(80)  NOT NULL,
  email         VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,   -- bcrypt hash, the real password is never stored
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
  order_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NULL,
  token_no      INT NOT NULL,
  customer_name VARCHAR(80) NOT NULL,
  payment_mode  ENUM('UPI','Cash','Card') NOT NULL,
  status        ENUM('Placed','Preparing','Ready','Collected') NOT NULL DEFAULT 'Placed',
  total         DECIMAL(10,2) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orders_status (status),
  CONSTRAINT fk_order_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

-- Junction table: resolves the many-to-many between orders and menu_items
CREATE TABLE order_items (
  order_id   INT NOT NULL,
  item_id    INT NOT NULL,
  quantity   INT NOT NULL,
  unit_price DECIMAL(8,2) NOT NULL,   -- price paid at that time (keeps old bills correct)
  PRIMARY KEY (order_id, item_id),
  CONSTRAINT chk_item_qty CHECK (quantity > 0),
  CONSTRAINT fk_oi_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
  CONSTRAINT fk_oi_item  FOREIGN KEY (item_id)  REFERENCES menu_items(item_id) ON DELETE RESTRICT
);

CREATE TABLE admins (
  admin_id      INT AUTO_INCREMENT PRIMARY KEY,
  username      VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL   -- bcrypt hash (the server creates the default admin on first start)
);

CREATE VIEW active_orders AS
  SELECT order_id, token_no, customer_name, status, total, created_at
  FROM orders WHERE status <> 'Collected';

INSERT INTO categories (name) VALUES
  ('Sandwiches & Burgers'),
  ('Pasta, Rolls & Puff'),
  ('Cheese Special'),
  ('Milk Shakes'),
  ('Juices & Fruit Shakes'),
  ('Shakes with Ice Cream');

INSERT INTO menu_items (name, category_id, price, is_veg, image) VALUES
  ('Mix Veg Grilled Sandwich', 1, 70, 1, '/images/mix-veg-grilled-sandwich.jpg'),
  ('Paneer Grilled Sandwich', 1, 80, 1, '/images/paneer-grilled-sandwich.jpg'),
  ('Cheese & Corn Grilled Sandwich', 1, 80, 1, '/images/cheese-corn-grilled-sandwich.jpg'),
  ('Chicken Seekh Sandwich', 1, 90, 0, '/images/chicken-seekh-sandwich.jpg'),
  ('Chicken Tandoori Sandwich', 1, 90, 0, '/images/chicken-tandoori-sandwich.jpg'),
  ('Veg Sub', 1, 80, 1, '/images/veg-sub.jpg'),
  ('Paneer Sub', 1, 80, 1, '/images/paneer-sub.jpg'),
  ('Chicken Sub', 1, 90, 0, '/images/chicken-sub.jpg'),
  ('Veg Burger', 1, 70, 1, '/images/veg-burger.jpg'),
  ('Chicken Burger', 1, 90, 0, '/images/chicken-burger.jpg'),
  ('Stuff Paneer Kulcha', 1, 60, 1, '/images/stuff-paneer-kulcha.jpg'),
  ('Fries', 1, 60, 1, '/images/fries.jpg'),
  ('White Sauce Pasta', 2, 80, 1, '/images/white-sauce-pasta.jpg'),
  ('Red Sauce Pasta', 2, 80, 1, '/images/red-sauce-pasta.jpg'),
  ('Mix Sauce Pasta', 2, 80, 1, '/images/mix-sauce-pasta.jpg'),
  ('Veg Roll', 2, 60, 1, '/images/veg-roll.jpg'),
  ('Paneer Roll', 2, 80, 1, '/images/paneer-roll.jpg'),
  ('Chicken Seekh Roll', 2, 90, 0, '/images/chicken-seekh-roll.jpg'),
  ('Chicken Roll', 2, 90, 0, '/images/chicken-roll.jpg'),
  ('Veg Pattie', 2, 40, 1, '/images/veg-pattie.jpg'),
  ('Paneer Pattie', 2, 50, 1, '/images/paneer-pattie.jpg'),
  ('Brownie', 2, 80, 1, '/images/brownie.jpg'),
  ('Choco Chip Muffin', 2, 50, 1, '/images/choco-chip-muffin.jpg'),
  ('Cheese Sandwich', 3, 90, 1, '/images/cheese-sandwich.jpg'),
  ('Cheese Chilli Wrap', 3, 100, 1, '/images/cheese-chilli-wrap.jpg'),
  ('Chilli Garlic Burger', 3, 90, 1, '/images/chilli-garlic-burger.jpg'),
  ('Cheese Burst Burger', 3, 100, 1, '/images/cheese-burst-burger.jpg'),
  ('Cheese Chilli Pattie (4 pc)', 3, 100, 1, '/images/cheese-chilli-pattie-4-pc.jpg'),
  ('Cheese Pizza', 3, 180, 1, '/images/cheese-pizza.jpg'),
  ('Oreo Shake', 4, 70, 1, '/images/oreo-shake.jpg'),
  ('Cold Coffee', 4, 70, 1, '/images/cold-coffee.jpg'),
  ('Chocolate Shake', 4, 70, 1, '/images/chocolate-shake.jpg'),
  ('Vanilla Shake', 4, 70, 1, '/images/vanilla-shake.jpg'),
  ('Strawberry Shake', 4, 70, 1, '/images/strawberry-shake.jpg'),
  ('Butter Scotch Shake', 4, 70, 1, '/images/butter-scotch-shake.jpg'),
  ('Badam Shake', 4, 70, 1, '/images/badam-shake.jpg'),
  ('Pineapple Shake', 4, 70, 1, '/images/pineapple-shake.jpg'),
  ('Lichi Shake', 4, 70, 1, '/images/lichi-shake.jpg'),
  ('Mosammi Juice', 5, 70, 1, '/images/mosammi-juice.jpg'),
  ('Orange Juice', 5, 70, 1, '/images/orange-juice.jpg'),
  ('Pineapple Juice', 5, 70, 1, '/images/pineapple-juice.jpg'),
  ('Mix Fruit Juice', 5, 70, 1, '/images/mix-fruit-juice.jpg'),
  ('Mango Shake', 5, 70, 1, '/images/mango-shake.jpg'),
  ('Banana Shake', 5, 70, 1, '/images/banana-shake.jpg'),
  ('Apple Shake', 5, 70, 1, '/images/apple-shake.jpg'),
  ('Papaya Shake', 5, 70, 1, '/images/papaya-shake.jpg'),
  ('Mix Fruit Shake', 5, 70, 1, '/images/mix-fruit-shake.jpg'),
  ('Fresh Lemon Water', 5, 40, 1, '/images/fresh-lemon-water.jpg'),
  ('Fresh Lemon Soda', 5, 50, 1, '/images/fresh-lemon-soda.jpg'),
  ('Oreo Shake with Ice Cream', 6, 90, 1, '/images/oreo-shake-with-ice-cream.jpg'),
  ('Cold Coffee with Ice Cream', 6, 90, 1, '/images/cold-coffee-with-ice-cream.jpg'),
  ('Chocolate Shake with Ice Cream', 6, 90, 1, '/images/chocolate-shake-with-ice-cream.jpg'),
  ('Vanilla Shake with Ice Cream', 6, 90, 1, '/images/vanilla-shake-with-ice-cream.jpg'),
  ('Strawberry Shake with Ice Cream', 6, 90, 1, '/images/strawberry-shake-with-ice-cream.jpg'),
  ('Butter Scotch Shake with Ice Cream', 6, 90, 1, '/images/butter-scotch-shake-with-ice-cream.jpg'),
  ('Badam Shake with Ice Cream', 6, 90, 1, '/images/badam-shake-with-ice-cream.jpg'),
  ('Pineapple Shake with Ice Cream', 6, 90, 1, '/images/pineapple-shake-with-ice-cream.jpg'),
  ('Lichi Shake with Ice Cream', 6, 90, 1, '/images/lichi-shake-with-ice-cream.jpg');
