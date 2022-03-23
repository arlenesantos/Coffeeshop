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
                    text: `SELECT product_id, quantity FROM purchaseDetail
                    WHERE purchase_id = $1`,
                    values: [_id]
                }
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();

                let array = [];

                for (let p of result.rows) {
                    let product = await Product.find(p.product_id);
                    product.setQuantity(p.quantity);
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

        this.addProduct = async (product_id) => {
            try {
                let query = {
                    text: `INSERT INTO purchaseDetail (product_id, purchase_id, quantity) VALUES ($1, $2, $3) RETURNING *;`,
                    values: [product_id, _id, 1]
                }

                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;
            }
        }

        this.increaseQuantity = async (product_id) => {
            try {
                let query = {
                    text: `UPDATE purchaseDetail SET quantity =  quantity + 1 
                           WHERE product_id = $1 AND purchase_id = $2 RETURNING *;`,
                    values: [product_id, _id]
                }

                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;

            }
        }

        this.decreaseQuantity = async (product_id) => {
            try {
                let query = {
                    text: `UPDATE purchaseDetail SET quantity =  quantity -1 
                           WHERE product_id = $1 AND purchase_id = $2 RETURNING *;`,
                    values: [product_id, _id]
                }

                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;

            }
        }

        this.remove = async (product_id) => {
            try {
                let query = {
                    text: `DELETE from purchaseDetail WHERE product_id = $1 AND purchase_id = $2 RETURNING *;`,
                    values: [product_id, _id]
                }
                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;
            }
        }

        this.getTotal = async () => {
            try {
                let query = {

                    /* SELECT pd.product_id, pd.quantity, p.price,
                       pd.quantity * p.price AS multi,
                       SUM (pd.quantity * p.price) AS total  [...]  */

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
        /*
                this.checkout = async () => {
                    try {
                        //mudar checkout de purchase para true
                        //mudar data para today
                        
                    } catch (error) {
                        throw error;
                        
                    }
                }*/
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
                    text: `INSERT INTO purchases (customer_id, checkout) VALUES ($1, $2, $3) RETURNING *;`,
                    values: [customer_id, false]
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

    async addProduct() {
        return this.addProduct();
    }

    async increaseQuantity(product_id) {
        return this.increaseQuantity(product_id);
    }

    async decreaseQuantity(product_id) {
        return this.decreaseQuantity(product_id);
    }

    async remove(product_id) {
        return this.remove(product_id);
    }

    async getTotal() {
        return this.getTotal();
    }

    async checkout() {
        return this.checkout();
    }

}

module.exports = { Cart };

