require('dotenv').config();
const { PROD_DB_USERNAME, PROD_DB_PASSWORD, PROD_DB_NAME, PROD_DB_HOSTNAME } = process.env;

module.exports = {
  development: {
    username: PROD_DB_USERNAME,
    password: PROD_DB_PASSWORD,
    database: `${PROD_DB_NAME}_dev`,
    host: PROD_DB_HOSTNAME,
    dialect: "mysql"
  },
  local: {
    username: "kelaxa",
    password: "kelaxa@123",
    database: "gowin",
    host: "192.168.1.33",
    dialect: "mysql"
    
  },
  production: {
    username: PROD_DB_USERNAME,
    password: PROD_DB_PASSWORD,
    database: PROD_DB_NAME,
    host: PROD_DB_HOSTNAME,
    dialect: 'mysql',
  },
};
