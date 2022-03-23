//postgresql
const PoolSingleton = require("../data/pooldb");
const { Purchase } = require("./purchase");

class Customer {
    constructor(id, name, address, city, state, zip_code, phone, email, password) {
        let _id = id;
        let _name = name;
        let _address = address;
        let _city = city;
        let _state = state;
        let _zip_code = zip_code;
        let _phone = phone;
        let _email = email;
        let _password = password;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;
        this.getAddress = () => _address;
        this.getCity = () => _city;
        this.getState = () => _state;
        this.getZipCode = () => _zip_code;
        this.getPhone = () => _phone;
        this.getEmail = () => _email;
        this.getPassword = () => _password;

        this.setName = (new_name) => _name = new_name;
        this.setAddress = (new_address) => _address = new_address;
        this.setCity = (new_city) => _city = new_city;
        this.setState = (new_state) => _state = new_state;
        this.setZipCode = (new_zip_code) => _zip_code = new_zip_code;
        this.setPhone = (new_phone) => _phone = new_phone;
        this.setEmail = (new_email) => _email = new_email;
        this.setPassword = (new_password) => _password = new_password;


        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO customers (name, address, city, state, zip_code, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
                    values: [_name, _address, _city, _state, _zip_code, _phone, _email, _password]
                };

                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                _id = result.rows[0].id;


            } catch (error) {
                throw error;
            }
        }

        this.update = async () => {
            try {
                let query = {
                    text: `UPDATE customers SET name = $2, address = $3, city = $4, state = $5, zip_code = $6, phone = $7, email = $8, password = $9  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name, _address, _city, _state, _zip_code, _phone, _email, _password]
                };

                let client = await _pool.connect();
                await client.query(query);
                client.release();
                return this;

            } catch (error) {
                throw error;
            }
        }

        this.delete = async () => {
            try {
                let query = {
                    text: `DELETE FROM customers WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();
                return this;

            } catch (error) {
                throw error;
            }
        }

        this.getCart = async () => {
            try {
                let query = {
                    text: `SELECT id, date, store_id, checkout FROM purchases WHERE customer_id = $1 AND checkout = false;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0]; //obj

            } catch (error) {
                throw error;
            }
        }

        this.getPurchases = async () => {
            try {
                let query = {
                    text: `SELECT id, to_char(date, 'DD/MM/YYYY') as date, customer_id, checkout, free_shipping FROM purchases WHERE customer_id = $1 AND checkout = true ORDER BY date DESC;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                let result = await client.query(query);
                client.release();

                let array = [];
                result.rows.forEach((p) => {
                    let purchase = new Purchase(p.id, p.date, p.customer_id, p.free_shipping, p.checkout);
                    array.push(purchase);
                })
                return array;

            } catch (error) {
                throw error;
            }
        }

        this.getRecipes = async () => {
            try {
                let query = {
                    text: `SELECT id, title, content, photo, approved FROM recipes
                    WHERE customer_id = $1;`,
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
    }


    get id() {
        return this.getId();
    }
    get name() {
        return this.getName();
    }
    get address() {
        return this.getAddress();
    }
    get city() {
        return this.getCity();
    }
    get state() {
        return this.getState();
    }
    get zip_code() {
        return this.getZipCode();
    }
    get phone() {
        return this.getPhone();
    }
    get email() {
        return this.getEmail();
    }
    get password() {
        return this.getPassword();
    }
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name, address, city, state, zip_code, phone, email, password FROM customers ORDER BY id ASC;`
            let result = await client.query(query);
            client.release();

            let array = [];
            result.rows.forEach((c) => {
                let customer = new Customer(c.id, c.name, c.address, c.city, c.state, c.zip_code, c.phone, c.email, c.password);
                array.push(customer);

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
                text: `SELECT id, name, address, city, state, zip_code, phone, email, password FROM customers WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            client.release();
            let customer = result.rows[0];
            return new Customer(customer.id, customer.name, customer.address, customer.city, customer.state, customer.zip_code, customer.phone, customer.email, customer.password);

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

    async getCart() {
        return this.getCart();
    }

    async getPurchases() {
        return this.getPurchases();
    }

    async getRecipes() {
        return this.getRecipes();
    }

}

module.exports = { Customer };