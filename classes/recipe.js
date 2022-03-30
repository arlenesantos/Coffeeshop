const PoolSingleton = require("../data/pooldb");

const { Customer } = require("./customer");

class Recipe {
    constructor(id, title, content, approved, customer) {
        let _id = id;
        let _title = title;
        let _content = content;
        let _approved = approved;
        let _customer = customer;

        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getTitle = () => _title;
        this.getContent = () => _content;
        this.getApproved = () => _approved;
        this.getCustomer = () => _customer;

        this.setTitle = (new_title) => _title = new_title;
        this.setContent = (new_content) => _content = new_content;
        this.setApproved = (new_value) => _approved = new_value;

        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO recipes (title, content, approved, customer_id) VALUES ($1, $2, $3, $4) RETURNING *;`,
                    values: [_title, _content, false, _customer.id]
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
                    text: `UPDATE recipes SET title = $2, content = $3, approved = $4, customer_id = $5  WHERE id = $1 RETURNING *;`,
                    values: [_id, _title, _content, _approved, _customer.id]
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
                    text: `DELETE FROM recipes WHERE id = $1 RETURNING *;`,
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
    get title() {
        return this.getTitle();
    }
    get content() {
        return this.getContent();
    }
    get approved() {
        return this.getApproved();
    }
    get customer() {
        return this.getCustomer();
    }



    static async all() {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = `SELECT id, title, content, approved, customer_id FROM recipes;`
            let result = await client.query(query);
            client.release();

            let recipes = result.rows;
            let customers = await Customer.all();

            let array = [];
            recipes.forEach((r) => {
                let customer = customers.find((c) => c.id == r.customer_id);
                let recipe = new Recipe(r.id, r.title, r.content, r.approved, customer);
                array.push(recipe);

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
                text: `SELECT id, title, content, approved, customer_id FROM recipes WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);
            client.release();

            let recipe = result.rows[0];
            let customer = await Customer.find(recipe.customer_id);
            return new Recipe(recipe.id, recipe.title, recipe.content, recipe.approved, customer);

        } catch (error) {
            console.log(error);
            return false;
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

