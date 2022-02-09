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
        this.getZipcode = () => _zip_code;    
        this.getPhone = () => _phone;    
        this.getEmail = () => _email; 
        
        this.setName = (new_name) => _name = new_name;
        this.setAddress = (new_address) => _address = new_address;
        this.setCity = (new_city) => _city = new_city;
        this.setState = (new_state) => _state = new_state;    
        this.setZipcode = (new_zip_code) => _zip_code = new_zip_code;    
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

    // parei aqui - falta add addProduct(product_id)
    // revisar classe store
   // _id, _name, _address, _city, _state, _zip_code, _phone, _email


    get id() {
        return this.getId();
    }
    get name() {
        return this.getName();
    }
    get price() {
        return this.getPrice();
    }
    get categoryId() {
        return this.getCategoryId();
    }
    get brandId() {
        return this.getBrandId();
    }
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name, price, category_id, brand_id FROM products;`
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
                text: `SELECT id, name, price, category_id, brand_id FROM products WHERE id = $1;`,
                values: [id]
            };
            let product = await client.query(query);
            client.release();
            return new Category(product.id, product.name, product.price, product.category_id, product.brand_id);

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

    async getStock(store_id) { 
        return this.getStock();
    }

    async getMinStock(store_id) {
        return this.getMinStock();
    }

    async getStores() {
        return this.getStores();
    }
}

module.exports = { Store };
