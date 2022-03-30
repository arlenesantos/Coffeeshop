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
                    text: `INSERT INTO brands (name) VALUES ($1) RETURNING *;`,
                    values: [_name]
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
                    text: `UPDATE brands SET name = $2  WHERE id = $1 RETURNING *;`,
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
                    text: `DELETE FROM brands WHERE id = $1 RETURNING *;`,
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


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, name FROM brands;`
            let result = await client.query(query);
            client.release();

            let array = [];
            result.rows.forEach((b) => {
                let brand = new Brand(b.id, b.name);
                array.push(brand);
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
                text: `SELECT id, name FROM brands WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            let brand = result.rows[0];
            client.release();
            return new Brand(brand.id, brand.name);

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

module.exports = { Brand };