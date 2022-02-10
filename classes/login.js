//postgresql
const PoolSingleton = require("../data/pooldb");

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
   

    static async check(email, password, isAdmin = false) {
        let pool = PoolSingleton.getInstance();
        try {
            let client = await pool.connect();
            let statement = "";

            if(isAdmin){
                statement = `SELECT email FROM admin WHERE email = $1 AND password = $2;`

            } else{
                statement = `SELECT email FROM customers WHERE email = $1 AND password = $2;`

            }

            let query = {
                text: statement,
                values: [email, password]
            }            
            
            let result = await client.query(query);
            client.release();
            return result.rows.length > 0 ? true : false;

        } catch (error) {
            throw error;
        }
    }

    
}

module.exports = { Login };