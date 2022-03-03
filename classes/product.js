//postgresql
const PoolSingleton = require("../data/pooldb");
const { Category } = require("./category");
const { Brand } = require("./brand");

class Product {
    constructor(id, name, price, category, brand) {
        let _id = id;
        let _name = name;
        let _price = price;
        let _category = category;
        let _brand = brand;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;
        this.getPrice = () => _price;
        this.getCategory = () => _category;
        this.getBrand = () => _brand;
        
        
        
        this.setName = (new_name) => _name = new_name;
        this.setPrice = (new_price) => _price = new_price;
        this.setCategory = (new_category) => _category = new_category;
        this.setBrand = (new_brand) => _brand = new_brand;        
        
        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO products (name, price, category_id, brand_id) VALUES ($1, $2, $3, $4) RETURNING *;`,
                    values: [_name, _price, _category.id, _brand.id]
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
                    text: `UPDATE products SET name = $2, price = $3, category_id = $4, brand_id = $5  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name, _price, _category.id, _brand.id]
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
                    text: `DELETE FROM products WHERE id = $1 RETURNING *;`,
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

        this.checkStock = async () => {
            try {
                let query = {
                    text: `SELECT products.id, stores.name, stocks.stock, stocks.min_stock
                    FROM products
                    LEFT JOIN stocks ON products.id = stocks.product_id 
                    LEFT JOIN stores ON stocks.store_id = stores.id              
                    WHERE products.id = $1`,
                    values:[_id]
                };               

                let client = await _pool.connect();
                let result = await client.query(query);
                
                return result.rows.map((p) => (
                    {
                         id: p.id,
                         name: p.name,
                         stock: p.stock,
                         min_stock: p.min_stock,
                         stockIsZero: p.stock == 0,
                         stockIsMin: p.stock <= p.min_stock,
                     }
                 ))


                
                /* alternative code:

                result.rows.forEach((p) => {                    
                    if (p.stock == 0){
                        p.stockIsZero = true;
                        p.stockIsMin = false;
                    } else if (p.stock <= p.min_stock){
                        p.stockIsMin = true;
                        p.stockIsZero = false;
                    } else {
                        p.stockIsZero = false;
                        p.stockIsMin = false;                        
                    }                    
                    
                })
                return stock;
                */

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

                let client = await _pool.connect();
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

                let client = await _pool.connect();
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
                   
                let client = await _pool.connect();
                let result = await client.query(query);
                return result.rows;
                
            } catch (error) {
                throw error;                
            }
        }

        this.checkAvailability = async () => {
            try {
                let query = {
                    text: `SELECT products.id, stores.name, stocks.stock, stocks.min_stock
                    FROM products
                    LEFT JOIN stocks ON products.id = stocks.product_id 
                    LEFT JOIN stores ON stocks.store_id = stores.id              
                    WHERE products.id = $1`,
                    values:[_id]
                };               

                let client = await _pool.connect();
                let result = await client.query(query);
                let stocks = result.rows;
                

                return stocks.map((p) => (
                    {
                         id: p.id,
                         name: p.name,
                         stock: p.stock,
                         min_stock: p.min_stock,
                         stockIsZero: p.stock == 0,
                         stockIsMin: p.stock <= p.min_stock,
                     }
                 ))

                
                
                /*
                stock.forEach((p) => {                    
                    if (p.stock == 0){
                        p.stockIsZero = true;
                        p.stockIsMin = false;
                    } else if (p.stock <= p.min_stock){
                        p.stockIsMin = true;
                        p.stockIsZero = false;
                    } else {
                        p.stockIsZero = false;
                        p.stockIsMin = false;                        
                    }                    
                    
                })
                return stock;*/


                
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
    get category() {
        return this.getCategory();
    }
    get brand() {
        return this.getBrand();
    }
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name, price, category_id, brand_id FROM products ORDER BY id ASC;`
            let result = await client.query(query);                        
            client.release();

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
            let result = await client.query(query);
            let product = result.rows[0];
            client.release();
            let category = await Category.find(product.category_id);
            let brand = await Brand.find(product.brand_id);
            return new Product(product.id, product.name, product.price, category, brand);

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
    
    async checkStock() { 
        return this.checkStock();
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


