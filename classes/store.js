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
                    text: `INSERT INTO stores (id, name, address, city, state, zip_code, phone, email) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`,
                    values: [_id, _name, _address, _city, _state, _zip_code, _phone, _email]
                };

                let client = await this._pool.connect();
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
                    text: `UPDATE stores SET name = $2, address = $3, city = $4, state = $5, zip_code = $6, phone = $7, email = $8  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name, _address, _city, _state, _zip_code, _phone, _email]
                };

                let client = await this._pool.connect();
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
                    text: `DELETE FROM stores WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await this._pool.connect();
                let result = await client.query(query);
                client.release();
                return result.rows[0];

            } catch (error) {
                throw error;
            }
        }

        this.addProduct = async (product_id, stock, min_stock) => {
            try {
                let query = {
                    text: `INSERT INTO stocks (store_id, product_id, stock, min_stock) VALUES ($1, $2, $3, $4)`,
                    values:[_id, product_id, stock, min_stock]
                };

                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }

        }

        this.getStock = async (product_id) => {
            try {
                let query = {
                    text: `SELECT stores.name, stocks.product_id, products.name, stocks.stock FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE stocks.product_id = $1 AND stores.id = $2;`,
                    values:[product_id, _id]
                };

                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getMinStock = async (product_id) => {
            try {
                let query = {
                    text: `SELECT stores.name, stocks.product_id, products.name, stocks.min_stock FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE stocks.product_id = $1 AND stores.id = $2;`,
                    values:[product_id, _id]
                };

                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getProducts = async () => {
            try {
                let query = {
                    text: `SELECT stores.name, stocks.product_id, products.name  
                    FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE stores.id = $1;`,
                    values:[_id]
                };
                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getBrands = async () => {
            try {
                let query = {
                    text: `SELECT DISTINCT stores.name, products.brand_id, brands.name 
                    FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    INNER JOIN brands ON products.brand_id = brands.id
                    WHERE stores.id = $1;`,
                    values:[_id]
                };
                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getCategories = async () => {
            try {
                let query = {
                    text: `SELECT DISTINCT stores.name, products.category_id, categories.name 
                    FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    INNER JOIN categories ON products.category_id = categories.id
                    WHERE stores.id = $1;`,
                    values:[ _id]
                };
                let client = await this._pool.connect();
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
    get address() {
        return this.getAddress();
    }
    get city() {
        return this.getCity();
    }
    get state() {
        return this.getState();
    }
    get zipCode() {
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
                text: `SELECT id, name, address, city, state, zip_code, phone, email FROM stores WHERE id = $1;`,
                values: [id]
            };
            let store = await client.query(query);
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
    
    async addProduct(product_id, stock, min_stock) {
        return this.addProduct(product_id, stock, min_stock);
    }

    async getStock(store_id) { 
        return this.getStock(store_id);
    }

    async getMinStock(store_id) {
        return this.getMinStock(store_id);
    }

    async getStores() {
        return this.getStores();
    }
}

module.exports = { Store };
