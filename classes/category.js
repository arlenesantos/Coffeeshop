//postgresql
const PoolSingleton = require("../data/pooldb");
//const { Brand } = require("./brand");
//const { Product } = require("./product");

class Category {
    constructor(id, name) {
        let _id = id;
        let _name = name;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;

        this.setName = (new_name) => _name = new_name;

        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO categories (name) VALUES ($1) RETURNING *;`,
                    values: [_name]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();


            } catch (error) {
                console.log("error save: " + error)
                console.log(error);
                throw error;
            }
        }

        this.update = async () => {
            try {
                let query = {
                    text: `UPDATE categories SET name = $2  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name]
                };

                let client = await _pool.connect();
                await client.query(query);
                client.release();
                // return the instance that already exists 
                return this;


            } catch (error) {
                throw error;
            }
        }

        this.delete = async () => {
            try {
                let query = {
                    text: `DELETE FROM categories WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;
            }
        }

        this.getProducts = async () => {
            try {
                let query = {
                    text: `SELECT p.id, p.name, p.price, c.name AS category_name, b.name AS brand_name 
                    FROM products AS p
                    LEFT JOIN categories AS c ON p.category_id = c.id
                    LEFT JOIN brands AS b ON p.brand_id = b.id                
                    WHERE category_id = $1`,
                    values: [_id]
                };

                let client = await _pool.connect();
                let result = await client.query(query);

                return result.rows;



            } catch (error) {
                throw error;
            }
        }
    }

    get id() {
        return this.getId();
    }
    get name() {
        return this.getName();
    }
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name FROM categories ORDER BY id ASC;`
            let result = await client.query(query);
            client.release();

            let array = [];
            result.rows.forEach((c) => {
                let category = new Category(c.id, c.name);
                array.push(category);
            })
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
                text: `SELECT id, name FROM categories WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let category = result.rows[0];
            client.release();
            return new Category(category.id, category.name);

        } catch (error) {
            throw error;
        }
    }

    static async totalSalesPercentage() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT categories.name, 
            (SUM (pd.quantity) * 100 / SUM(SUM (pd.quantity)) OVER ())::numeric(10,2) AS total_percentage
            FROM purchaseDetail AS pd
            LEFT JOIN products ON pd.product_id = products.id
            LEFT JOIN purchases ON pd.purchase_id = purchases.id
            LEFT JOIN categories ON products.category_id = categories.id
            WHERE purchases.checkout = true
            GROUP BY categories.name;`

            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows;

        } catch (error) {
            throw error;
        }
    }

    static async dailySalesPercentage() {
        let pool = PoolSingleton.getInstance();
        try {
            let query = `
            SELECT to_char(p.date, 'DD/MM/YYYY') AS date, categories.name,
            (SUM(pd.quantity)::numeric(10,2) / dqt.day_quantity)::numeric(10,2) AS daily_percentage
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
            ORDER BY p.date,categories.name DESC;`

            let client = await pool.connect();
            let result = await client.query(query);
            client.release();
            return result.rows;

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
}

module.exports = { Category };