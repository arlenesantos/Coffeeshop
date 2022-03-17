//postgresql
const { Pool } = require("pg/lib");
const PoolSingleton = require("../data/pooldb");

class Cart {
    constructor(id, customer) {
        let _id = id;
        let _customer = customer;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getCustomer = () => _customer;
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
}

module.exports = { Cart };

