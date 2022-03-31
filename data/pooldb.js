const { Pool } = require("pg");

const config = {
    user: "", // insert your user
    password: "", //insert your password
    host: "localhost",
    port: 5432,
    database: "coffeeshop", // suggested name
    max: 20,
    min: 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 2000
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