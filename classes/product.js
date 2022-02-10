//postgresql
const PoolSingleton = require("../data/pooldb");

class Product {
    constructor(id, name, price, category_id, brand_id) {
        let _id = id;
        let _name = name;
        let _price = price;
        let _category_id = category_id;
        let _brand_id = brand_id;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;
        this.getPrice = () => _price;
        this.getCategoryId = () => _category_id;
        this.getBrandId = () => _brand_id;    
        
        this.setName = (new_name) => _name = new_name;
        this.setPrice = (new_price) => _price = new_price;
        this.setCategoryId = (new_categoryId) => _category_id = new_categoryId;
        this.setBrandId = (new_brandId) => _brand_id = new_brandId;        
        
        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO products (id, name, price, category_id, brand_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                    values: [_id, _name, _price, _category_id, _brand_id]
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
                    text: `UPDATE products SET name = $2, price = $3, category_id = $4, brand_id = $5  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name, _price, _category_id, _brand_id]
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
                    text: `DELETE FROM products WHERE id = $1 RETURNING *;`,
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

        this.getStock = async (store_id) => {
            try {
                let query = {
                    text: `SELECT stores.name, stocks.product_id, products.name, stocks.stock FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE store_id = $1 AND product_id = $2;`,
                    values:[store_id, _id]
                };

                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getMinStock = async (store_id) => {
            try {
                let query = {
                    text: `SELECT stores.name, stocks.product_id, products.name, stocks.min_stock FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE store_id = $1 AND product_id = $2 ;`,
                    values:[store_id, _id]
                };

                let client = await this._pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.getStores = async () => {
            try {
                let query = {
                    text: `SELECT stocks.product_id, products.name, stocks.store_id, stores.name 
                    FROM stocks
                    INNER JOIN products ON stocks.product_id = products.id
                    INNER JOIN stores ON stocks.store_id = stores.id
                    WHERE stocks.product_id = $1;`,
                    values:[_id]
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
            return new Product(product.id, product.name, product.price, product.category_id, product.brand_id);

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
        return this.getStock(store_id);
    }

    async getMinStock(store_id) {
        return this.getMinStock(store_id);
    }

    async getStores() {
        return this.getStores();
    }
}

module.exports = { Product };


