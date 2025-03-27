"use strict";
require('dotenv').config();
const { Sequelize } = require("sequelize");
const process = require("process");
const fs = require("fs");
const path = require("path");
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/sequelize.js")[env];
const db = {};

console.log("Environment :", env);
const sequelize = new Sequelize(config.database, config.username, config.password, {
  ...config,
  define: {
    collate: process.env.COLLATE,
  },
  logging: process.env.LOGGING ? console.log : false,
});

fs.readdirSync(__dirname).filter(file => {
  return (
    file.indexOf('.') !== 0 &&
    file !== 'index.js' &&
    file.slice(-3) === '.js' &&
    file.indexOf('.test.js') === -1
  );
}).forEach(file => {
  const model = require(path.join(__dirname, file))(sequelize);
  db[model.name] = model;
});

db.Asset = require("./asset")(sequelize, Sequelize.DataTypes);
db.Attendance = require("./attendance")(sequelize, Sequelize.DataTypes);
db.Batch = require("./batch")(sequelize, Sequelize.DataTypes);
db.Branch = require("./branch")(sequelize, Sequelize.DataTypes);
db.Category = require("./category")(sequelize, Sequelize.DataTypes);
db.Customer = require("./customer")(sequelize, Sequelize.DataTypes);
db.Device = require("./device")(sequelize, Sequelize.DataTypes);
db.EventLog = require("./eventLog")(sequelize, Sequelize.DataTypes);
db.Invoice = require("./invoice")(sequelize, Sequelize.DataTypes);
db.InvoiceItem = require("./invoiceItem")(sequelize, Sequelize.DataTypes);
db.Item = require("./item")(sequelize, Sequelize.DataTypes);
db.Holiday = require("./holiday")(sequelize, Sequelize.DataTypes);
db.LeaveRequest = require("./leaveRequest")(sequelize, Sequelize.DataTypes);
db.Notification = require("./notification")(sequelize, Sequelize.DataTypes);
db.Permission = require("./permission")(sequelize, Sequelize.DataTypes);
db.Role = require("./role")(sequelize, Sequelize.DataTypes);
db.RolePermission = require("./rolePermission")(sequelize, Sequelize.DataTypes);
db.Salary = require("./salary")(sequelize, Sequelize.DataTypes);
db.Setting = require("./setting")(sequelize, Sequelize.DataTypes);
db.Template = require("./template")(sequelize, Sequelize.DataTypes);
db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Vendor = require("./vendor")(sequelize, Sequelize.DataTypes);
db.Transaction = require("./transaction")(sequelize, Sequelize.DataTypes);
db.KitchenOrder = require("./kitchenOrder")(sequelize, Sequelize.DataTypes);
db.KitchenOrderItem = require("./kitchenOrderItem")(sequelize, Sequelize.DataTypes);
db.Transfer = require("./transfer")(sequelize, Sequelize.DataTypes);
db.TransferItem = require("./transferItem")(sequelize, Sequelize.DataTypes);
db.FrozenBatch = require("./frozenBatch")(sequelize, Sequelize.DataTypes);
db.Position = require("./position")(sequelize, Sequelize.DataTypes);
// db.Expense = require("./expense")(sequelize, Sequelize.DataTypes);
db.Type= require("./types")(sequelize, Sequelize.DataTypes);
//New GOWIN
db.Region= require("./region")(sequelize, Sequelize.DataTypes);
db.State= require("./state")(sequelize, Sequelize.DataTypes);
db.Team= require("./team")(sequelize, Sequelize.DataTypes);
db.Designation= require("./designation")(sequelize, Sequelize.DataTypes);
db.Insurer= require("./insurer")(sequelize, Sequelize.DataTypes);
db.City= require("./city")(sequelize, Sequelize.DataTypes);
db.Make= require("./make")(sequelize, Sequelize.DataTypes);
db.Bank= require("./bank")(sequelize, Sequelize.DataTypes);
db.BankAccount= require("./bankAccount")(sequelize, Sequelize.DataTypes);
db.BankAccountType= require("./bankAccountTypes")(sequelize, Sequelize.DataTypes);
db.PinCode= require("./pinkCode")(sequelize, Sequelize.DataTypes);
db.PartnerType= require("./partnerType")(sequelize, Sequelize.DataTypes);
db.Expenses= require("./expenses")(sequelize, Sequelize.DataTypes);
db.ExpensesCategory= require("./expensesCategory")(sequelize, Sequelize.DataTypes);
db.ExpensesEntry= require("./expensesEntry")(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].addScopes) {
    db[modelName].addScopes(db);
  }
});

// sequelize.sync({ force: true })
//   .then(() => console.log('Sequelize sync done'));

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;