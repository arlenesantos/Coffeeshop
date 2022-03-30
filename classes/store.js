//postgresql
const PoolSingleton = require("../data/pooldb");

class Store {
    constructor(id, name, address, city, state, zip_code, phone, email) {
        let _id = id;
        let _name = name;
        let _address = address;
        let _city = city;
        let _state = state;
        let _zip_code = zip_code;
        let _phone = phone;
        let _email = email;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;
        this.getAddress = () => _address;
        this.getCity = () => _city;
        this.getState = () => _state;
        this.getZipCode = () => _zip_code;
        this.getPhone = () => _phone;
        this.getEmail = () => _email;

        this.setName = (new_name) => _name = new_name;
        this.setAddress = (new_address) => _address = new_address;
        this.setCity = (new_city) => _city = new_city;
        this.setState = (new_state) => _state = new_state;
        this.setZipCode = (new_zip_code) => _zip_code = new_zip_code;
        this.setPhone = (new_phone) => _phone = new_phone;
        this.setEmail = (new_email) => _email = new_email;


        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO stores (name, address, city, state, zip_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`,
                    values: [_name, _address, _city, _state, _zip_code, _phone, _email]
                };

                let client = await _pool.connect();
                await client.query(query);
                client.release();

            } catch (error) {
                throw error;
            }
        }

        this.update = async () => {
            try {
                let query = {
                    text: `UPDATE stores SET name = $2, address = $3, city = $4, state = $5, zip_code = $6, phone = $7, email = $8  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name, _address, _city, _state, _zip_code, _phone, _email]
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
                    text: `DELETE FROM stores WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();

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
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name, address, city, state, zip_code, phone, email FROM stores;`
            let result = await client.query(query);
            client.release();

            let array = [];
            result.rows.forEach(async (s) => {
                let store = await new Store(s.id, s.name, s.address, s.city, s.state, s.zip_code, s.phone, s.email);
                array.push(store);
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
                text: `SELECT id, name, address, city, state, zip_code, phone, email FROM stores WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let store = result.rows[0];
            client.release();
            return new Store(store.id, store.name, store.address, store.city, store.state, store.zip_code, store.phone, store.email);

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

}

module.exports = { Store };
