const PoolSingleton = require("../data/pooldb");

class Recipe {
    constructor(id, title, content, photo, approved, customer_id) {
        let _id = id;
        let _title = title;
        let _content = content;
        let _photo = photo;
        let _approved = approved;
        let _customer_id = customer_id;

        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getTitle = () => _title;
        this.getContent = () => _content;
        this.getPhoto = () => _photo;
        this.getApproved = () => _approved;
        this.getCustomerId = () => _customer_id;

        this.setTitle = (new_title) => _title = new_title;
        this.setContent = (new_content) => _content = new_content;
        this.setPhoto = (new_photo) => _photo = new_photo;
        this.setApproved = (new_value) => _approved = new_value;

        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO recipes (id, title, content, photo, approved, customer_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`,
                    values: [_id, _title, _content, _photo, _approved, _customer_id]
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
                    text: `UPDATE recipes SET title = $2, content = $3, photo = $4, approved = $5, customer_id = $6  WHERE id = $1 RETURNING *;`,
                    values: [_id, _title, _content, _photo, _approved, _customer_id]
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
                    text: `DELETE FROM recipes WHERE id = $1 RETURNING *;`,
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

    }

    //_id, _title, _content, _photo, _approved, _customer_id
    get id() {
        return this.getId();
    }
    get title() {
        return this.getTitle();
    }
    get content() {
        return this.getContent();
    }
    get photo() {
        return this.getPhoto();
    }
    get approved() {
        return this.getApproved();
    }
    get customerId() {
        return this.getCustomerId();
    }    
    get pool() {
        return this.getPool();
    }


    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, title, content, photo, approved, customer_id FROM recipes;`
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
                text: `SELECT id, title, content, photo, approved, customer_id FROM recipes WHERE id = $1;`,
                values: [id]
            };
            let recipe = await client.query(query);
            client.release();
            return new Recipe(recipe.id, recipe.title, recipe.content, recipe.photo, recipe.approved, recipe.customer_id);

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

module.exports = { Recipe };

