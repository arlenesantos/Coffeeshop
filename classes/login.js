//postgresql
const PoolSingleton = require("../data/pooldb");

const { Customer } = require("./customer");

class Login {
    constructor(name, email, password) {
        let _name = name;
        let _email = email;
        let _password = password;

        this.getName = () => _name;
        this.getEmail = () => _email;
        this.getPassword = () => _password;


    }

    get name() {
        return this.getName();
    }
    get email() {
        return this.getEmail();
    }
    get password() {
        return this.getPassword();
    }


    static async isAdmin(email, password) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = {
                text: `SELECT name, email FROM admin WHERE email = $1 AND password = $2;`,
                values: [email, password]
            }

            let result = await client.query(query);
            client.release();
            return result.rows[0];

        } catch (error) {
            return false;
        }
    }

    static async isCustomer(email, password) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let query = {
                text: `SELECT id FROM customers WHERE email = $1 AND password = $2;`,
                values: [email, password]
            }

            let result = await client.query(query);
            client.release();
            return result.rows[0];

            /*
            console.log(result.rows[0])
            let id = result.rows[0].id;

            let customer = await Customer.find(id);
            console.log(`clogin: ${JSON.stringify(customer)}`)

            return customer;

            */


        } catch (error) {
            return false;
        }
    }


}

module.exports = { Login };