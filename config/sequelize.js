require('dotenv').config();
const { PROD_DB_USERNAME, PROD_DB_PASSWORD, PROD_DB_NAME, PROD_DB_HOSTNAME } = process.env;

module.exports = {
  development: {
    username: "gowin",
    password: "RF7UokpAYwQ_bkyp",
    database: "gowin",
    host: "170.187.228.147",
    dialect: "mysql"
  },
  local: {
    username: "root",
    password: "123",
    database: "team_gowin",
    host: "localhost",
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
