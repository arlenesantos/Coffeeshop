//postgresql
const { Pool } = require("pg/lib");
const PoolSingleton = require("../data/pooldb");
const { Product } = require("./product");
//const { Category } = require("./category");
//const { Brand } = require("./brand");

class Cart {
    constructor(id, customer) {
        let _id = id;
        let _customer = customer;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getCustomer = () => _customer;

        this.getProducts = async () => {
            try {
                let query = {
                    text: `SELECT product_id FROM purchaseDetail
                    WHERE purchase_id = $1`,
                    values: [_id]
                }
                let client = await _pool.connect();
                let result = await client.query(query);

                let array = [];

                for (let p of result.rows) {
                    let product = await Product.find(p.product_id);
                    array.push(product);
                }
                return array;




                /*
                let categories = await Category.all();
                let brands = await Brand.all();

                let array = [];
                result.rows.forEach((p) => {
                    let category = categories.find((c) => c.id == p.category_id);
                    let brand = brands.find((b) => b.id == p.brand_id);
                    let product = new Product(p.id, p.name, p.price, category, brand);
                    array.push(product);

                });

                return array;
                */


            } catch (error) {
                throw error;

            }
        }
    }

    get id() {
        return this.getId();
    }
    get customer() {
        return this.getCustomer();
    }

    static async findOrCreate(customer_id) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let find = {
                text: `SELECT id, customer_id FROM purchases WHERE customer_id = $1 AND checkout = false;`,
                values: [customer_id]
            };
            let findResult = await client.query(find);

            if (findResult.rows.length > 0) {
                let cart = findResult.rows[0];
                client.release();
                return new Cart(cart.id, cart.customer_id);

            } else {
                let create = {
                    text: `INSERT INTO purchases (customer_id, store_id, checkout) VALUES ($1, $2, $3) RETURNING *;`,
                    values: [customer_id, 1, false]
                };
                let createResult = await client.query(create);
                let cart = createResult.rows[0];
                client.release();
                return new Cart(cart.id, cart.customer_id);
            }

        } catch (error) {
            throw error;
        }
    }

    async getProducts() {
        return this.getProducts();
    }
}

module.exports = { Cart };

