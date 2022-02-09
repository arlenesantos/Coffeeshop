const { Pool } = require("pg");

const config = {
    user: "postgres",
    password: "senhapostgre",
    host: "localhost",
    port: 5432,
    database: "coffee",
    max: 20,
    min: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis:2000
};

const Singleton = (() =>{
    var instance;

    const createInstance = () => {
        var classObj = new Pool(config);
        return classObj;
    }

    return {
        getInstance: () => {
            if(!instance) {
                instance = createInstance();
                console.log("pool created");
            } else{
                console.log("pool already exists");
            }
            return instance;
        }
    }

})();

module.exports = Singleton;