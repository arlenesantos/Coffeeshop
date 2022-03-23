//postgresql
const PoolSingleton = require("../data/pooldb");

class Purchase {
    constructor(id, date, customer_id, checkout) {
        let _id = id;
        let _date = date;
        let _customer_id = customer_id;
        let _checkout = checkout;

        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getDate = () => _date;
        this.getCustomerId = () => _customer_id;
        this.getCheckout = () => _checkout;


        this.setDate = (new_date) => _date = new_date;
        this.setCustomerId = (new_customer_id) => _customer_id = new_customer_id;
        this.setCheckout = (new_checkout) => _checkout = new_checkout;


        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO purchases (id, date, customer_id, checkout) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                    values: [_id, _date, _customer_id, _checkout]
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
                    text: `UPDATE purchases SET date = $2, customer_id = $3, checkout = $4  WHERE id = $1 RETURNING *;`,
                    values: [_id, _date, _customer_id, _checkout]
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
                    text: ``,
                    values: []
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0]; // obj??

            } catch (error) {
                throw error;
            }

        }

        this.getTotal = async () => { // concluir
            try {
                let query = {
                    text: ``,
                    values: []
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0]; // obj??

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
            let query = `SELECT id, date, customer_id, checkout FROM purchases;`
            let result = await client.query(query);
            client.release();
            return result.rows;

        } catch (error) {
            throw error;
        }
    }

    static async find(id) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = {
                text: `SELECT id, date, customer_id, checkout FROM purchases WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let purchase = result.rows[0];
            client.release();
            return new Purchase(purchase.id, purchase.date, purchase.customer_id, purchase.checkout);

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