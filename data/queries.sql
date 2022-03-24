-- usuarios registrados
SELECT COUNT(id) 
FROM customers;

--usuarios com compras
SELECT COUNT (DISTINCT customer_id)
FROM purchases
WHERE checkout = true;

--usuarios sem compras
SELECT COUNT(customers.id) 
FROM customers
LEFT JOIN purchases ON customers.id = purchases.customer_id
WHERE customers.id NOT IN (
    SELECT DISTINCT customer_id
    FROM purchases
    WHERE checkout = true
);

--usuarios com compras últimos 30 dias
SELECT COUNT(DISTINCT customer_id)
FROM purchases
WHERE checkout = true
AND date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- qtde vendas feitas
SELECT COUNT(id)
FROM purchases
WHERE checkout = true;

-- faturamento todas as vendas
SELECT SUM (pd.quantity * products.price)
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE purchases.checkout = true;

-- qtde vendas últimos 30 dias
SELECT COUNT(id)
FROM purchases
WHERE checkout = true
AND date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- faturamento últimos 30 dias
SELECT SUM (pd.quantity * products.price)
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE checkout = true
AND purchases.date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;

-- qtde media itens por compra
SELECT AVG (quantity)::numeric(10,2)
FROM purchaseDetail AS pd
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE purchases.checkout = true;

-- qtde vendas e faturamento diario
SELECT purchases.date, 
COUNT (DISTINCT purchases.id),
SUM (pd.quantity * products.price) AS gross_revenue
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE checkout = true
GROUP BY purchases.date;

-- ticket medio
SELECT  AVG (pd.quantity * products.price)::numeric(10,2) 
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
WHERE purchases.checkout = true;

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

-- produto mais vendido --> qtde e faturamento
SELECT DISTINCT products.id, products.name, brands.name AS brand, products.price, SUM(pd.quantity) AS sales, SUM (pd.quantity * products.price) AS total
FROM purchaseDetail AS pd
LEFT JOIN products ON pd.product_id = products.id
LEFT JOIN purchases ON pd.purchase_id = purchases.id
LEFT JOIN brands ON products.brand_id = brands.id
WHERE purchases.checkout = true
GROUP BY products.id, products.name, brand, products.price
ORDER BY sales DESC, total DESC;