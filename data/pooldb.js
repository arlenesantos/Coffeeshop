const { Pool } = require("pg");

const config = {
    user: "postgres",
    password: "senhapostgre",
    host: "localhost",
    port: 5432,
    database: "coffeeshop",
    max: 20,
    min: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000 //2000
};

const Singleton = (() => {
    var instance;

    const createInstance = () => {
        var classObj = new Pool(config);
        return classObj;
    }

    return {
        getInstance: () => {
            if (!instance) {
                instance = createInstance();
            }
            return instance;
        }
    }

})();

module.exports = Singleton;