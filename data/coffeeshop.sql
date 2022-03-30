CREATE DATABASE coffeeshop;

-- admin
CREATE TABLE admin(
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) PRIMARY KEY,
    password VARCHAR(12) NOT NULL
);

INSERT INTO admin (name, email, password) VALUES ('Admin', 'admin@coffeeshop.com', 12345678);

-- categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO categories (name) VALUES
('Ground Coffee'),
('Whole Bean'),
('Capsules');

-- brands
CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);

INSERT INTO brands (name) VALUES 
('ABC Coffee'),
('DEF Coffee'),
('GHI Coffee'),
('JKL Coffee'),
('MNO Coffee');

-- products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price NUMERIC(6,2) NOT NULL,
    category_id INT NOT NULL,
    brand_id INT NOT NULL,
    FOREIGN KEY(category_id) REFERENCES categories(id),
    FOREIGN KEY(brand_id) REFERENCES brands(id)
);

INSERT INTO products (name, price, category_id, brand_id) VALUES
('Traditional', 20.49, 1, 1),
('Traditional', 23.39, 1, 2),
('Traditional', 18.25, 1, 3),
('Traditional', 25.10, 1, 4),
('Traditional', 17.49, 1, 5),
('Strong', 21.67, 1, 1),
('Strong', 23.49, 1, 3),
('Strong', 25.15, 1, 4),
('Strong', 19.20, 1, 5),
('Extra Strong', 22.78, 1, 1),
('Extra Strong', 26.33, 1, 2),
('Extra Strong', 21.37, 1, 3),
('Extra Strong', 27.99, 1, 4),
('Extra Strong', 20.15, 1, 5),
('Decaffeinated', 29.20, 1, 2),
('Decaffeinated', 25.25, 1, 3),
('Decaffeinated', 28.49, 1, 4),
('Premium', 35.49, 1, 1),
('Premium', 39.39, 1, 2),
('Brazil', 30.49, 2, 1),
('Brazil', 28.39, 2, 2),
('Brazil', 39.25, 2, 3),
('Brazil', 35.10, 2, 4),
('Brazil', 32.49, 2, 5),
('Costa Rica', 32.99, 2, 1),
('Costa Rica', 36.39, 2, 2),
('Costa Rica', 44.05, 2, 3),
('Costa Rica', 40.50, 2, 4),
('Costa Rica', 38.18, 2, 5),
('Colombia', 38.29, 2, 1),
('Colombia', 34.10, 2, 2),
('Colombia', 40.50, 2, 3),
('Colombia', 42.15, 2, 4),
('Colombia', 41.25, 2, 5),
('Mexico', 34.27, 2, 1),
('Mexico', 41.25, 2, 4),
('Mexico', 37.45, 2, 5),
('Peru', 28.17, 2, 1),
('Peru', 30.99, 2, 5),
('Cappuccino', 24.27, 3, 1),
('Cappuccino', 23.49, 3, 3),
('Cappuccino', 21.25, 3, 4),
('Cappuccino', 15.45, 3, 5),
('Espresso', 20.49, 3, 1),
('Espresso', 25.10, 3, 4),
('Espresso', 17.49, 3, 5),
('Intense', 21.67, 3, 1),
('Intense', 23.49, 3, 3),
('Intense', 22.15, 3, 4),
('Intense', 19.20, 3, 5),
('Latte', 29.15, 3, 4),
('Latte', 19.20, 3, 5),
('Macchiato', 25.49, 3, 4),
('Macchiato', 17.49, 3, 5);


--stores
CREATE TABLE stores (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    address VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone TEXT NOT NULL,
    email VARCHAR(100) NOT NULL
);

INSERT INTO stores (name, address, city, state, zip_code, phone, email) VALUES 
('Lisbon Store', 'The address here', 'City', 'State', '1100-110', '800 123 456', 'lisbonstore@coffeeshop.com'),
('Porto Store', 'The address here', 'City', 'State', '1100-110', '800 123 456', 'portostore@coffeeshop.com'),
('Faro Store', 'The address here', 'City', 'State', '1100-110', '800 123 456', 'farostore@coffeeshop.com');

--stocks
CREATE TABLE stocks (
    store_id INT,
    product_id INT,
    stock INT CHECK(stock >= 0 ) NOT NULL,
    min_stock INT NOT NULL,
    PRIMARY KEY (store_id, product_id),
    FOREIGN KEY (store_id) REFERENCES stores(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

INSERT INTO stocks (store_id, product_id, stock, min_stock) VALUES
(1, 1, 50, 15),
(1, 2, 125, 15),
(1, 3, 75, 15),
(1, 4, 30, 15),
(1, 5, 150, 15),
(1, 6, 60, 15),
(1, 7, 150, 15),
(1, 8, 50, 15),
(1, 9, 150, 15),
(1, 10, 58, 15),
(1, 11, 150, 15),
(1, 12, 79, 15),
(1, 13, 49, 15),
(1, 14, 120, 15),
(1, 15, 150, 15),
(1, 16, 120, 15),
(1, 17, 37, 15),
(1, 18, 70, 15),
(1, 19, 150, 15),
(1, 20, 85, 10),
(1, 21, 150, 10),
(1, 22, 56, 10),
(1, 23, 39, 10),
(1, 24, 150, 10),
(1, 25, 120, 10),
(1, 26, 150, 10),
(1, 27, 152, 10),
(1, 28, 150, 10),
(1, 29, 120, 10),
(1, 30, 150, 10),
(1, 31, 152, 10),
(1, 32, 150, 10),
(1, 33, 73, 10),
(1, 34, 39, 10),
(1, 35, 150, 10),
(1, 36, 120, 10),
(1, 37, 150, 10),
(1, 38, 150, 10),
(1, 39, 120, 10),
(1, 40, 250, 20),
(1, 41, 150, 20),
(1, 42, 120, 20),
(1, 43, 65, 20),
(1, 44, 152, 20),
(1, 45, 65, 20),
(1, 46, 120, 20),
(1, 47, 150, 20),
(1, 48, 150, 20),
(1, 49, 152, 20),
(1, 50, 65, 20),
(1, 51, 150, 20),
(1, 52, 120, 20),
(1, 53, 65, 20),
(1, 54, 150, 20),
(2, 1, 50, 15),
(2, 2, 125, 15),
(2, 3, 75, 15),
(2, 4, 30, 15),
(2, 11, 150, 15),
(2, 12, 79, 15),
(2, 13, 49, 15),
(2, 14, 120, 15),
(2, 15, 150, 15),
(2, 16, 120, 15),
(2, 17, 37, 15),
(2, 18, 70, 15),
(2, 19, 150, 15),
(2, 28, 150, 10),
(2, 29, 120, 10),
(2, 30, 150, 10),
(2, 31, 152, 10),
(2, 32, 150, 10),
(2, 33, 73, 10),
(2, 34, 39, 10),
(2, 35, 150, 10),
(2, 36, 120, 10),
(2, 37, 150, 10),
(2, 38, 150, 10),
(2, 39, 120, 10),
(2, 40, 250, 20),
(2, 41, 150, 20),
(2, 42, 120, 20),
(2, 43, 65, 20),
(2, 44, 152, 20),
(2, 45, 65, 20),
(2, 50, 65, 20),
(2, 51, 150, 20),
(2, 52, 120, 20),
(2, 53, 65, 20),
(2, 54, 150, 20),
(3, 1, 50, 15),
(3, 2, 125, 15),
(3, 3, 75, 15),
(3, 4, 30, 15),
(3, 5, 150, 15),
(3, 8, 50, 15),
(3, 9, 150, 15),
(3, 10, 58, 15),
(3, 11, 150, 15),
(3, 12, 79, 15),
(3, 13, 49, 15),
(3, 14, 120, 15),
(3, 15, 150, 15),
(3, 16, 120, 15),
(3, 19, 150, 15),
(3, 20, 85, 10),
(3, 21, 150, 10),
(3, 22, 56, 10),
(3, 23, 39, 10),
(3, 24, 150, 10),
(3, 25, 120, 10),
(3, 30, 150, 10),
(3, 31, 152, 10),
(3, 32, 150, 10),
(3, 33, 73, 10),
(3, 34, 39, 10),
(3, 35, 150, 10),
(3, 36, 120, 10),
(3, 37, 150, 10),
(3, 38, 150, 10),
(3, 39, 120, 10),
(3, 40, 250, 20),
(3, 41, 150, 20),
(3, 42, 120, 20),
(3, 43, 65, 20),
(3, 44, 152, 20),
(3, 47, 150, 20),
(3, 48, 150, 20),
(3, 49, 152, 20),
(3, 50, 65, 20),
(3, 51, 150, 20),
(3, 54, 150, 20);

--customers
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    phone TEXT NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(32) NOT NULL
);

INSERT INTO customers (name, address, city, state, zip_code, phone, email, password) VALUES 
('Coffee Shop', '', '', '', '', '', '', ''),
('Jane Doe', 'The address here', 'City', 'State', '1100-110', '001-912345678', 'janedoe@email.com', 'jane1234'),
('John Doe', 'The address here', 'City', 'State', '1200-210', '002-912345678', 'johndoe@email.com', 'john1234'),
('Other Customer', 'The address here', 'City', 'State', '1300-310', '003-912345678', 'other@email.com', 'other123');

--purchases
CREATE TABLE purchases (
    id SERIAL PRIMARY KEY,
    date DATE DEFAULT CURRENT_DATE NOT NULL,    
    customer_id INT NOT NULL,
    free_shipping BOOLEAN,    
    checkout BOOLEAN,    
    FOREIGN KEY (customer_id) REFERENCES customers(id)    
);

INSERT INTO purchases (date, customer_id, free_shipping, checkout ) VALUES
('2022-01-05', 2, true, true),
('2022-02-15', 2, false, true),
('2022-02-22', 2, false, true),
('2022-03-02', 2, true, true),
('2022-03-20', 2, true, true),
('2022-03-22', 2, false, true),
('2022-02-20', 3, true, true),
('2022-03-22', 3, true, true);

--purchase-detail
CREATE TABLE purchaseDetail (      
    product_id INT NOT NULL, 
    purchase_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (product_id, purchase_id),
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (purchase_id) REFERENCES purchases(id)
);

INSERT INTO purchaseDetail (product_id, purchase_id, quantity) VALUES
(3, 1, 2),
(17, 1, 4),
(50, 1, 3),
(4, 2, 3),
(4, 3, 2),
(3, 3, 2),
(24, 3, 1),
(12, 3, 1),
(3, 4, 3),
(17, 4, 2),
(5, 4, 2),
(1, 4, 3),
(1, 5, 2),
(10, 5, 1),
(18, 5, 2),
(50, 6, 2),
(4, 6, 2),
(24, 6, 4),
(1, 6, 2),
(1, 7, 2),
(52, 7, 3),
(23, 7, 1),
(25, 8, 1),
(1, 8, 1);


--recipes
CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,    
    content TEXT NOT NULL,    
    customer_id INT NOT NULL,
    approved BOOLEAN,    
    FOREIGN KEY (customer_id) REFERENCES customers(id)   
);

-- recipe with pending approval by admin
INSERT INTO recipes (title, content, customer_id, approved) VALUES
('Iced latte', 'Ingredients: 2 espresso shots (60ml); 2 tsp sugar, honey or maple syrup (to taste); ice; 100ml whole milk; Method: STEP 1 Mix the hot espresso with the sugar until it dissolves. STEP 2 Fill a glass with ice and stir in the sweetened coffee.
STEP 3 Pour over the milk and stir until combined.', 1, false);





