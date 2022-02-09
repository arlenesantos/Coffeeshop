//postgresql
const PoolSingleton = require("../pooldb");

class Category {
    constructor(id, name){
        this._id = id;
        this._name = name;

        this._pool = PoolSingleton.getInstance();

        this.getId = () => _id;
        this.getName = () => _name;
        this.getPool = () => _pool;

        this.setName = (new_name) => _name = new_name;


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
            let query = `SELECT id, name FROM categories;`
            let result = await client.query(query);
            client.release();
            return result.rows;

        } catch (error) { 
            console.log("entrou")           
            throw error;            
        }
    }
}

module.exports = { Category };