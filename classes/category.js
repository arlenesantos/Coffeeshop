//postgresql
const PoolSingleton = require("../data/pooldb");

class Category {
    constructor(id, name) {
        let _id = id;
        let _name = name;
        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;

        this.setName = (new_name) => _name = new_name;

        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO categories (name) VALUES ($1) RETURNING *;`,
                    values: [_name]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();


            } catch (error) {
                console.log("error save: " + error)
                console.log(error);
                throw error;
            }
        }

        this.update = async () => {
            try {
                let query = {
                    text: `UPDATE categories SET name = $2  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name]
                };

                let client = await _pool.connect();
                await client.query(query);
                client.release();
                // return the instance that already exists 
                return this;


            } catch (error) {
                throw error;
            }
        }

        this.delete = async () => {
            try {
                let query = {
                    text: `DELETE FROM categories WHERE id = $1 RETURNING *;`,
                    values: [_id]
                };
                let client = await _pool.connect();
                await client.query(query);
                client.release();
                
            } catch (error) {                
                throw error;
            }
        }

        this.getProducts = async () => {
            try {
                let query = {
                    text: `SELECT id, name, price, category_id, brand_id FROM products WHERE category_id = $1`,
                    values: [_id]
                };

                let client = await _pool.connect();
                let result = await client.query(query);                
                return result.rows; // retornar instancia
                

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
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name FROM categories ORDER BY id ASC;`
            let result = await client.query(query);
            client.release();

            let array = [];
            result.rows.forEach((c) => {
                let category = new Category(c.id, c.name);
                array.push(category);
            })
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
                text: `SELECT id, name FROM categories WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let category = result.rows[0];
            client.release();
            return new Category(category.id, category.name);

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
}

module.exports = { Category };