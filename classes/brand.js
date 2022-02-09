//postgresql
const PoolSingleton = require("../data/pooldb");

class Brand {
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
                    text: `INSERT INTO brands (id, name) VALUES ($1, $2) RETURNING *;`,
                    values: [_id, _name]
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
                    text: `UPDATE brands SET name = $2  WHERE id = $1 RETURNING *;`,
                    values: [_id, _name]
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
                    text: `DELETE FROM brands WHERE id = $1 RETURNING *;`,
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

        this.getProducts = async () => {
            try {
                let query = {
                    text: `SELECT id, name, price, category_id, brand_id FROM products WHERE brand_id = $1`,
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
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name FROM brands;`
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
                text: `SELECT id, name FROM brands WHERE id = $1;`,
                values: [id]
            };
            let brand = await client.query(query);
            client.release();
            return new Category(brand.id, brand.name);

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

module.exports = { Brand };