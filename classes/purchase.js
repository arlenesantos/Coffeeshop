//postgresql
const PoolSingleton = require("../data/pooldb");

class Purchase {
    constructor(id, date, customer_id, free_shipping, checkout) {
        let _id = id;
        let _date = date;
        let _customer_id = customer_id;
        let _free_shipping = free_shipping;
        let _checkout = checkout;


        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getDate = () => _date;
        this.getCustomerId = () => _customer_id;
        this.getFreeShipping = () => _free_shipping;
        this.getCheckout = () => _checkout;


        this.setDate = (new_date) => _date = new_date;
        this.setCustomerId = (new_customer_id) => _customer_id = new_customer_id;
        this.setFreeShipping = (shipping) => _free_shipping = shipping;
        this.setCheckout = (new_checkout) => _checkout = new_checkout;


        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO purchases (date, customer_id, checkout, free_shipping) VALUES ($1, $2, $3, $4) RETURNING *;`,
                    values: [_date, _customer_id, _checkout, _free_shipping]
                };

                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0];

            } catch (error) {
                throw error;
            }
        }

        this.update = async () => {
            try {
                let query = {
                    text: `UPDATE purchases SET date = $2, customer_id = $3, checkout = $4  free_shipping = $5 WHERE id = $1 RETURNING *;`,
                    values: [_id, _date, _customer_id, _checkout, _free_shipping]
                };

                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0];

            } catch (error) {
                throw error;
            }
        }

        this.delete = async () => {
            try {
                let query = {
                    text: `DELETE FROM purchases WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0];

            } catch (error) {
                throw error;
            }
        }

        this.getProducts = async () => { // concluir
            try {
                let query = {
                    text: `SELECT products.name, brands.name AS brand, products.price, pd.quantity,
                    products.price * pd.quantity AS subtotal
                    FROM purchaseDetail AS pd
                    LEFT JOIN products ON pd.product_id = products.id
                    LEFT JOIN brands ON products.brand_id = brands.id
                    WHERE purchase_id = $1`,
                    values: [_id]
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows; // obj??

            } catch (error) {
                throw error;
            }

        }

        this.getTotal = async () => {
            try {
                let query = {
                    text: `SELECT SUM (pd.quantity * p.price) AS subtotal
                    FROM purchaseDetail AS pd
                    LEFT JOIN products AS p ON pd.product_id = p.id
                    WHERE purchase_id = $1`,
                    values: [_id]
                }

                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0].subtotal;

            } catch (error) {
                throw error;

            }

        }


    }


    get id() {
        return this.getId();
    }
    get date() {
        return this.getDate();
    }
    get customerId() {
        return this.getCustomerId();
    }

    get free_shipping() {
        return this.getFreeShipping();
    }

    get checkout() {
        return this.getCheckout();
    }
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, to_char(date, 'DD/MM/YYYY') as date, customer_id, checkout, free_shipping FROM purchases ORDER BY date DESC;`
            let result = await client.query(query);
            client.release();

            let array = [];

            result.rows.forEach((p) => {
                let purchase = new Purchase(p.id, p.date, p.customer_id, p.checkout, p.free_shipping);
                array.push(purchase);

            });

            return array;


        } catch (error) {
            throw error;
        }
    }

    static async find(id) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = {
                text: `SELECT id, date, customer_id, checkout, free_shipping FROM purchases WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let purchase = result.rows[0];
            client.release();
            return new Purchase(purchase.id, purchase.date, purchase.customer_id, purchase.checkout, purchase.free_shipping);

        } catch (error) {
            throw error;
        }
    }

    static async totalSales() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT COUNT(id) AS sales
            FROM purchases
            WHERE checkout = true;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].sales;

        } catch (error) {
            throw error;
        }
    }

    static async totalRevenue() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT SUM (pd.quantity * products.price) AS revenue
            FROM purchaseDetail AS pd
            LEFT JOIN products ON pd.product_id = products.id
            LEFT JOIN purchases ON pd.purchase_id = purchases.id
            WHERE purchases.checkout = true;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].revenue;

        } catch (error) {
            throw error;
        }
    }

    static async salesLastMonth() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT COUNT(id) AS sales_last_month
            FROM purchases
            WHERE checkout = true
            AND date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].sales_last_month;

        } catch (error) {
            throw error;
        }
    }

    static async revenueLastMonth() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT SUM (pd.quantity * products.price) AS revenue_last_month
            FROM purchaseDetail AS pd
            LEFT JOIN products ON pd.product_id = products.id
            LEFT JOIN purchases ON pd.purchase_id = purchases.id
            WHERE checkout = true
            AND purchases.date BETWEEN CURRENT_DATE - 30 AND CURRENT_DATE;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].revenue_last_month;

        } catch (error) {
            throw error;
        }
    }

    static async averageProducts() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT (SUM(quantity) / COUNT(DISTINCT purchase_id)::numeric(10,2))::numeric(10,2) AS average_products
            FROM purchaseDetail AS pd
            LEFT JOIN purchases ON pd.purchase_id = purchases.id
            WHERE purchases.checkout = true;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].average_products;

        } catch (error) {
            throw error;
        }
    }

    static async dailyReport() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT to_char(purchases.date, 'DD/MM/YYYY') AS date, 
            COUNT (DISTINCT purchases.id) AS sales,
            SUM (pd.quantity * products.price) AS gross_revenue
            FROM purchaseDetail AS pd
            LEFT JOIN products ON pd.product_id = products.id
            LEFT JOIN purchases ON pd.purchase_id = purchases.id
            WHERE checkout = true
            GROUP BY purchases.date;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows;

        } catch (error) {
            throw error;
        }
    }

    static async averageTicket() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT (total / purchase_count)::numeric(10,2) AS average_ticket
            FROM (
                SELECT COUNT(DISTINCT pd.purchase_id) AS purchase_count, SUM(products.price * pd.quantity)          AS total
                FROM purchaseDetail AS pd
                LEFT JOIN products ON pd.product_id = products.id
                LEFT JOIN purchases ON pd.purchase_id = purchases.id
                WHERE purchases.checkout = true
            ) AS purchases_revenue;`
            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows[0].average_ticket;

        } catch (error) {
            throw error;
        }
    }

    async save() {
        return this.save();
    }

    async update() {
        return this.update();
    }

    async delete() {
        return this.delete();
    }

    async getProducts() {
        return this.getProducts();
    }

    async getTotal() {
        return this.getTotal();
    }



}

module.exports = { Purchase };