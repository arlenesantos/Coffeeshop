const PoolSingleton = require("../data/pooldb");

const { Customer } = require("./customer");

class Recipe {
    constructor(id, title, content, photo, approved, customer) {
        let _id = id;
        let _title = title;
        let _content = content;
        let _photo = photo;
        let _approved = approved;
        let _customer = customer;

        let _pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getTitle = () => _title;
        this.getContent = () => _content;
        this.getPhoto = () => _photo;
        this.getApproved = () => _approved;
        this.getCustomer = () => _customer;

        this.setTitle = (new_title) => _title = new_title;
        this.setContent = (new_content) => _content = new_content;
        this.setPhoto = (new_photo) => _photo = new_photo;
        this.setApproved = (new_value) => _approved = new_value;
        this.setCustomer = (new_customer) => _customer = new_customer;

        this.save = async () => {
            try {
                let query = {
                    text: `INSERT INTO recipes (title, content, photo, approved, customer_id) VALUES ($1, $2, $3, $4, $5) RETURNING *;`,
                    values: [_title, _content, _photo, false, _customer.id]
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
                    text: `UPDATE recipes SET title = $2, content = $3, photo = $4, approved = $5, customer_id = $6  WHERE id = $1 RETURNING *;`,
                    values: [_id, _title, _content, _photo, _approved, _customer.id]
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
                return this;

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
    get photo() {
        return this.getPhoto();
    }
    get approved() {
        return this.getApproved();
    }
    get customer() {
        return this.getCustomer();
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
            
            let recipes = result.rows;            
            let array = [];            
            recipes.forEach(async (r) => {
                let customer = await Customer.find(r.customer_id);                
                let recipe = new Recipe(r.id, r.title, r.content, r.photo, r.approved, customer);                              
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
                text: `SELECT id, title, content, photo, approved, customer_id FROM recipes WHERE id = $1;`,
                values: [id]
            };
            let result = await client.query(query);            
            client.release();
            let recipe = result.rows[0];

            let customer = await Customer.find(recipe.customer_id);
            return new Recipe(recipe.id, recipe.title, recipe.content, recipe.photo, recipe.approved, customer);

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

