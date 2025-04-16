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
db.Branch = require("./branch")(sequelize, Sequelize.DataTypes);
db.Permission = require("./permission")(sequelize, Sequelize.DataTypes);
db.Role = require("./role")(sequelize, Sequelize.DataTypes);
db.RolePermission = require("./rolePermission")(sequelize, Sequelize.DataTypes);
db.Setting = require("./setting")(sequelize, Sequelize.DataTypes);
db.Template = require("./template")(sequelize, Sequelize.DataTypes);
db.User = require("./user")(sequelize, Sequelize.DataTypes);
// db.Expense = require("./expense")(sequelize, Sequelize.DataTypes);
db.Type = require("./types")(sequelize, Sequelize.DataTypes);
//New GOWIN
db.Staff = require("./staff")(sequelize, Sequelize.DataTypes);
db.Region = require("./region")(sequelize, Sequelize.DataTypes);
db.State = require("./state")(sequelize, Sequelize.DataTypes);
db.Team = require("./team")(sequelize, Sequelize.DataTypes);
db.Designation = require("./designation")(sequelize, Sequelize.DataTypes);
db.Insurer = require("./insurer")(sequelize, Sequelize.DataTypes);
db.City = require("./city")(sequelize, Sequelize.DataTypes);
db.Make = require("./make")(sequelize, Sequelize.DataTypes);
db.Bank = require("./bank")(sequelize, Sequelize.DataTypes);
db.BankAccount = require("./bankAccount")(sequelize, Sequelize.DataTypes);
db.BankAccountType = require("./bankAccountTypes")(sequelize, Sequelize.DataTypes);
db.PinCode = require("./pinkCode")(sequelize, Sequelize.DataTypes);
db.PartnerType = require("./partnerType")(sequelize, Sequelize.DataTypes);
db.Expenses = require("./expenses")(sequelize, Sequelize.DataTypes);
db.ExpensesCategory = require("./expensesCategory")(sequelize, Sequelize.DataTypes);
db.ExpensesEntry = require("./expensesEntry")(sequelize, Sequelize.DataTypes);
db.Partner = require("./partner")(sequelize, Sequelize.DataTypes);
db.RTO = require("./rto")(sequelize, Sequelize.DataTypes);
db.RTOCategory = require("./rtoCategory")(sequelize, Sequelize.DataTypes);
db.LoginId = require("./loginId")(sequelize, Sequelize.DataTypes);
db.MakeModal = require("./makeModal")(sequelize, Sequelize.DataTypes);
db.Modal = require("./modal")(sequelize, Sequelize.DataTypes);
db.Product = require("./product")(sequelize, Sequelize.DataTypes);
db.Vendor = require("./vendor")(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
  if (db[modelName].addScopes) {
    db[modelName].addScopes(db);
  }
});

// sequelize.sync({ force: true })
//   .then(async () => {
//     console.log('Sequelize sync done');

//     const { Branch, Region, Role, Staff, Designation, City, State, Team, Partner } = db;
//     const team_id = require('uuid').v4();
//     const role_id = require('uuid').v4();
//     const branch_id = require('uuid').v4();
//     const state_id = require('uuid').v4();
//     const city_id = require('uuid').v4();
//     const designation_id = require('uuid').v4();

//     await Designation.create({
//       designation_id,
//       name: 'Designation RM',
//     });

//     await City.create({
//       city_id,
//       name: 'Vav CITY',
//       state: {
//         state_id,
//         name: 'Vav STATE'
//       }
//     });

//     await Branch.create({
//       branch_id,
//       name: 'Vavuniya',
//       code: 'VAV',
//       address: 'vav',
//       contact: [],
//       teams: [
//         {
//           team_id,
//           name: 'VT 1',
//           staffs: [
//             {
//               name: "B Manager",
//               mobile_no: '0768911918',
//               email: 'lg@designation.com',
//               dob: '2025-02-25',
//               blood_group: 'A+',
//               door_no: 'asd',
//               street: 'sdfsd',
//               pin_code: 'sdf',
//               is_active: true,
//               branch_id,
//               role: {
//                 name: 'BM_ROLE',
//               },
//               designation: {
//                 name: 'Designation BM',
//               },
//               city_id,
//             },
//             {
//               name: "R Manager 1",
//               mobile_no: '1768911918',
//               email: 'lg1@designation.com',
//               dob: '2025-02-25',
//               blood_group: 'A+',
//               door_no: 'asd',
//               street: 'sdfsd',
//               pin_code: 'sdf',
//               is_active: true,
//               branch_id,
//               role: {
//                 role_id,
//                 name: 'RM_ROLE',
//               },
//               designation_id,
//               city_id,
//               partners: [
//                 {
//                   name: 'Partner 1 VT1',
//                 },
//                 {
//                   name: 'Partner 2 VT1',
//                 },
//               ],
//             },
//             {
//               name: "R Manager 2",
//               mobile_no: '2768911918',
//               email: 'lg2@designation.com',
//               dob: '2025-02-25',
//               blood_group: 'A+',
//               door_no: 'asd',
//               street: 'sdfsd',
//               pin_code: 'sdf',
//               is_active: true,
//               branch_id,
//               role: {
//                 name: 'RM_ROLE_2',
//               },
//               designation_id,
//               city_id,
//               partners: [
//                 {
//                   name: 'Partner 1 VT2',
//                 },
//                 {
//                   name: 'Partner 2 VT2',
//                 },
//               ],
//             }
//           ]
//         },
//         {
//           name: 'VT 2',
//         },
//       ],
//       region: {
//         name: 'NP',
//       },
//     }, {
//       include: [
//         {
//           model: Team,
//           as: 'teams',
//           include: [
//             {
//               model: Staff,
//               as: 'staffs',
//               include: [
//                 {
//                   model: Role,
//                   as: 'role',
//                 },
//                 {
//                   model: Partner,
//                   as: 'partners',
//                 },
//                 {
//                   model: Designation,
//                   as: 'designation',
//                 },
//                 {
//                   model: City,
//                   as: 'city',
//                   include: [
//                     {
//                       model: State,
//                       as: 'state',
//                     },
//                   ]
//                 },
//               ]

//             },
//           ]
//         },
//         {
//           model: Region,
//           as: 'region',
//         },
//       ],
//     });


//     const branch = await Branch.findOne({
//       include: [
//         {
//           model: Team,
//           as: 'teams',
//           include: [
//             {
//               model: Staff,
//               as: 'staffs',
//               include: [
//                 {
//                   model: Partner,
//                   as: 'partners',
//                   include: [
//                     {
//                       model: Staff,
//                       as: 'staff',
//                     },

//                   ]
//                 },
//                 {
//                   model: Role,
//                   as: 'role',
//                 },
//                 {
//                   model: Designation,
//                   as: 'designation',
//                 },
//                 {
//                   model: City,
//                   as: 'city',
//                   include: [
//                     {
//                       model: State,
//                       as: 'state',
//                     },
//                   ]
//                 },
//               ]

//             },
//           ]
//         },
//         {
//           model: Region,
//           as: 'region',
//         },
//       ],
//     });

//     require('fs').writeFileSync('branch.json', JSON.stringify(branch, null, 2));

//     console.time("Done");
//     console.warn("Done");
//     console.error("Done");
//     console.timeEnd("Done");
//     console.timeStamp("Done");
//     console.timeLog("Done");
//   });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;