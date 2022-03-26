-- usuarios registrados
SELECT COUNT(id) AS customers_registered 
FROM customers;

--usuarios com compras
SELECT COUNT (DISTINCT customer_id) AS customers_with_purchases
FROM purchases
WHERE checkout = true;

--usuarios sem compras
SELECT COUNT(customers.id) AS customers_without_purchases
FROM customers
WHERE customers.id NOT IN (
    SELECT DISTINCT customer_id
    FROM purchases
    WHERE checkout = true
);

--usuarios com compras últimos 30 dias
SELECT COUNT(DISTINCT customer_id) AS customers_active
FROM purchases
WHERE checkout = true
AND date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- qtde vendas feitas
SELECT COUNT(id) AS sales
FROM purchases
WHERE checkout = true;

-- faturamento todas as vendas
SELECT SUM (pd.quantity * products.price) AS revenue
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE purchases.checkout = true;

-- qtde vendas últimos 30 dias
SELECT COUNT(id) AS sales_last_month
FROM purchases
WHERE checkout = true
AND date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- faturamento últimos 30 dias
SELECT SUM (pd.quantity * products.price) AS revenue_last_month
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE checkout = true
AND purchases.date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- qtde media itens por compra
SELECT (SUM(quantity) / COUNT(DISTINCT purchase_id)::numeric(10,2))::numeric(10,2) AS average_products
FROM purchaseDetail AS pd
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE purchases.checkout = true;

-- qtde vendas e faturamento diario
SELECT purchases.date, 
COUNT (DISTINCT purchases.id) AS daily_sales,
SUM (pd.quantity * products.price) AS daily_gross_revenue
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE checkout = true
GROUP BY purchases.date;

-- ticket medio
SELECT (total / purchase_count)::numeric(10,2) AS average_ticket
FROM (
    SELECT COUNT(DISTINCT pd.purchase_id) AS purchase_count, SUM(products.price * pd.quantity) AS total
    FROM purchaseDetail AS pd
    LEFT JOIN products ON pd.product_id = products.id
    LEFT JOIN purchases ON pd.purchase_id = purchases.id
    WHERE purchases.checkout = true
) AS purchases_revenue;


-- vendas por categoria
-- PQ OVER???
SELECT categories.name, SUM (pd.quantity),
(SUM (pd.quantity) * 100 / SUM(SUM (pd.quantity)) OVER ())::numeric(10,2) AS percentage
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
LEFT JOIN categories ON products.category_id = categories.id
WHERE purchases.checkout = true
GROUP BY categories.name;


-- vendas/categoria por dia
SELECT p.date, categories.name,
(SUM(pd.quantity)::numeric(10,2) / dqt.day_quantity)::numeric(10,2) AS daily_percentage_category
FROM purchases as p
LEFT JOIN purchaseDetail as pd ON p.id = pd.purchase_id
LEFT JOIN products ON products.id = pd.product_id
LEFT JOIN categories ON products.category_id = categories.id
LEFT JOIN (
    SELECT purchases.date, SUM(pd.quantity)::numeric(10,2) AS day_quantity FROM purchases
    LEFT JOIN purchaseDetail as pd ON purchases.id = pd.purchase_id
    WHERE purchases.checkout = true
    GROUP BY purchases.date
) AS dqt on dqt.date = p.date
WHERE checkout = true
GROUP BY p.date,categories.name, dqt.day_quantity
ORDER BY p.date,categories.name DESC;

-- produto mais vendido --> qtde e faturamento
SELECT DISTINCT products.id, products.name, brands.name AS brand, products.price, SUM(pd.quantity) AS sales, SUM (pd.quantity * products.price) AS total
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
LEFT JOIN brands ON products.brand_id = brands.id
WHERE purchases.checkout = true
GROUP BY products.id, products.name, brand, products.price
ORDER BY sales DESC, total DESC LIMIT 1;



/*
-- vendas/categoria por dia 
SELECT DISTINCT n1.name, n1.date, n1.sales, n2.day_sum,
(SUM (n1.sales) / SUM (n2.day_sum) * 100)::numeric(10,2) AS percentage
FROM (
    SELECT DISTINCT categories.name AS name, purchases.date AS date, SUM (pd.quantity) AS sales
    FROM purchaseDetail AS pd
    LEFT JOIN (
    SELECT id, purchases.date, SUM (pd.quantity)
    FROM purchaseDetail AS pd
    LEFT JOIN purchases ON pd.purchase_id = purchases.id
    WHERE purchases.checkout = true
    GROUP BY purchases.id, purchases.date
    ) AS day_quantity ON pd.purchase_id = day_quantity.id
    LEFT JOIN products ON pd.product_id = products.id
    LEFT JOIN purchases ON pd.purchase_id = purchases.id
    LEFT JOIN categories ON products.category_id = categories.id
    WHERE purchases.checkout = true
    GROUP BY categories.name, purchases.date       
) AS n1
INNER JOIN (
    SELECT purchases.date AS date, SUM (pd.quantity) AS day_sum
    FROM purchaseDetail AS pd
    LEFT JOIN purchases ON pd.purchase_id = purchases.id
    WHERE purchases.checkout = true
    GROUP BY purchases.date    
) AS n2
ON n2.date = n1.date
GROUP BY n1.name, n1.date, n1.sales, n2.day_sum
ORDER BY n1.date DESC;
*/




