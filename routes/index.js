const express = require("express");
const router = express.Router();
const imageToServer = require("../utils/imageToServer");

const multer = require("multer");
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

// Imports Controller
const roleController = require("../controllers/role");
const permissionController = require("../controllers/permission");
const authController = require("../controllers/auth");
const userController = require("../controllers/user");
const assetController = require("../controllers/asset");
const settingController = require("../controllers/setting");
const templateController = require("../controllers/template");
const branchController = require("../controllers/branch");
// const expenseController = require("../controllers/expense");

const typesController = require("../controllers/types");
const teamsController = require("../controllers/team");
const regionsController = require("../controllers/region");
const statesController = require("../controllers/state");
const designationController = require("../controllers/designation");
const insurerController = require("../controllers/insurer");
const cityController = require("../controllers/city");
const makeController = require("../controllers/make");
const bankController = require("../controllers/bank");
const bankAccountController = require("../controllers/bankAccount");
const bankAccountTypesController = require("../controllers/bankAccountType");
const partnerTypeController = require("../controllers/partnerType");
const partnerController = require("../controllers/partner");
const expensesController = require("../controllers/expenses");
const expensesCategoryController = require("../controllers/expensesCategory");
const expensesEntryController = require("../controllers/expensesEntry");
const staffController = require("../controllers/staff");


// Role
router.route("/role")
  .post(roleController.create)
  .get(roleController.getAll);
router.route("/role/:role_id")
  .get(roleController.getById)
  .put(roleController.updateById)
  .delete(roleController.deleteById);

router.route("/role/:role_id/permission")
  .post(roleController.setPermissions)

// Permission
router.route("/permission")
  .get(permissionController.getAll);

// Auth
router.route("/auth/login")
  .post(authController.login);

router.route("/auth/profile")
  .get(userController.getProfile)
  .put(upload.single('image'), imageToServer, userController.updateProfile);
router.route("/auth/password")
  .put(userController.changePassword);

// User
router.route("/user")
  .post(userController.create)
  .get(userController.getAll);
router.route("/user/:user_id")
  .get(userController.getById)
  .put(userController.updateById)
  .delete(userController.deleteById);

// Staff
router.route("/staff")
  .post(staffController.create)
  .get(staffController.getAll);
router.route("/staff/:staff_id")
  .get(staffController.getById)
  .put(staffController.updateById)
  .delete(staffController.deleteById);

// Partner
router.route("/partner")
  .post(partnerController.create)
  .get(partnerController.getAll);
router.route("/partner/:partner_id")
  .get(partnerController.getById)
  .put(partnerController.updateById)
  .delete(partnerController.deleteById);

// Asset
router.route("/asset")
  .post(upload.single('file'),
    imageToServer,
    assetController.create)
  .get(assetController.getAll);

// Setting
router.route("/setting")
  .post(settingController.create)
  .get(settingController.getAll);
router.route("/setting/:setting_id")
  .get(settingController.getById)
  .put(settingController.updateById)
  .delete(settingController.deleteById);
router.route("/setting/type/:type")
  .get(settingController.getAllByType);
router.route("/setting/type/:type/name/:name")
  .get(settingController.getByTypeName);

// Template
router.route("/template")
  .post(templateController.create)
  .get(templateController.getAll);
router.route("/template/:template_id")
  .get(templateController.getById)
  .put(templateController.updateById)
  .delete(templateController.deleteById);
router.route("/template/type/:type")
  .get(templateController.getAllByType);
router.route("/template/type/:type/name/:name")
  .get(templateController.getByTypeName);

// Branch
router.route("/branch")
  .post(branchController.create)
  .get(branchController.getAll);
router.route("/branch/:branch_id")
  .get(branchController.getById)
  .put(branchController.updateById)
  .delete(branchController.deleteById);
router.route("/auth/branch")
  .put(branchController.updateByAuth);
router.route("/auth/branch/settings")
  .put(branchController.updateSettingsByAuth);

// Region  
router.route("/general/types")
  .post(typesController.create)
router.route("/general/types/:type")
  .get(typesController.getAll);
router.route("/general/types/:type_id")
  .put(typesController.updateById)
  .delete(typesController.deleteById);
router.route("/general/types/single/:type_id")
  .get(typesController.getById)

// Team
router.route("/general/teams")
  .post(teamsController.create)
  .get(teamsController.getAll);
router.route("/general/teams/:team_id")
  .get(teamsController.getById)
  .put(teamsController.updateById)
  .delete(teamsController.deleteById);
router.route("/general/teams/single/:team_id")
  .get(teamsController.getById)
router.route("/general/teams/:team_id/manager")
  .put(teamsController.updateManagers)
router.route("/general/teams/:team_id/partner")
  .put(teamsController.updatePartners)

// Region
router.route("/general/regions")
  .post(regionsController.create)
  .get(regionsController.getAll);
router.route("/general/regions/:region_id")
  .put(regionsController.updateById)
  .delete(regionsController.deleteById);
router.route("/general/regions/single/:region_id")
  .get(regionsController.getById)

// State
router.route("/general/state")
  .post(statesController.create)
  .get(statesController.getAll);
router.route("/general/state/:state_id")
  .put(statesController.updateById)
  .delete(statesController.deleteById);
router.route("/general/state/single/:state_id")
  .get(statesController.getById)

// Designation
router.route("/general/designation")
  .post(designationController.create)
  .get(designationController.getAll);
router.route("/general/designation/:designation_id")
  .put(designationController.updateById)
  .delete(designationController.deleteById);
router.route("/general/designation/single/:designation_id")
  .get(designationController.getById)

// Designation
router.route("/general/insurer")
  .post(insurerController.create)
  .get(insurerController.getAll);
router.route("/general/insurer/:insurer_id")
  .put(insurerController.updateById)
  .delete(insurerController.deleteById);
router.route("/general/insurer/single/:insurer_id")
  .get(insurerController.getById)

// City
router.route("/general/city")
  .post(cityController.create)
  .get(cityController.getAll);
router.route("/general/city/:city_id")
  .put(cityController.updateById)
  .delete(cityController.deleteById);
router.route("/general/city/single/:city_id")
  .get(cityController.getById)

// Make
router.route("/general/make")
  .post(makeController.create)
  .get(makeController.getAll);
router.route("/general/make/:make_id")
  .put(makeController.updateById)
  .delete(makeController.deleteById);
router.route("/general/make/single/:make_id")
  .get(makeController.getById)

// Bank
router.route("/general/bank")
  .post(bankController.create)
  .get(bankController.getAll);
router.route("/general/bank/:bank_id")
  .put(bankController.updateById)
  .delete(bankController.deleteById);
router.route("/general/bank/single/:bank_id")
  .get(bankController.getById)

// BankAccount
router.route("/general/bank/account")
  .post(bankAccountController.create)
  .get(bankAccountController.getAll);
router.route("/general/bank/account/:account_id")
  .put(bankAccountController.updateById)
  .delete(bankAccountController.deleteById);
router.route("/general/bank/account/single/:account_id")
  .get(bankAccountController.getById)

// Bank Account Type
router.route("/general/bank/account/type")
  .post(bankAccountTypesController.create)
  .get(bankAccountTypesController.getAll);
router.route("/general/bank/account/type/:bank_account_type_id")
  .put(bankAccountTypesController.updateById)
  .delete(bankAccountTypesController.deleteById);
router.route("/general/bank/account/type/single/:bank_account_type_id")
  .get(bankAccountTypesController.getById)

// Partner Type
router.route("/general/partner/type/data")
  .get(partnerController.getCreatePartnerTypeData)

// Partner Type
router.route("/general/partner/type")
  .post(partnerTypeController.create)
  .get(partnerTypeController.getAll);
router.route("/general/partner/type/:partner_type_id")
  .put(partnerTypeController.updateById)
  .delete(partnerTypeController.deleteById);
router.route("/general/partner/type/single/:partner_type_id")
  .get(partnerTypeController.getById)

// Expenses
router.route("/expenses")
  .post(expensesController.create)
  .get(expensesController.getAll);
router.route("/expenses/:expenses_id")
  .put(expensesController.updateById)
  .delete(expensesController.deleteById);
router.route("/expenses/single/:expenses_id")
  .get(expensesController.getById)

// Expenses Category
router.route("/expenses/category")
  .post(expensesCategoryController.create)
  .get(expensesCategoryController.getAll);
router.route("/expenses/category/:expenses_category_id")
  .put(expensesCategoryController.updateById)
  .delete(expensesCategoryController.deleteById);
router.route("/expenses/category/single/:expenses_category_id")
  .get(expensesCategoryController.getById)

// Expenses Entry
router.route("/expenses/entry")
  .post(expensesEntryController.create)
  .get(expensesEntryController.getAll);
router.route("/expenses/entry/:expenses_entry_id")
  .put(expensesEntryController.updateById)
  .delete(expensesEntryController.deleteById);
router.route("/expenses/entry/single/:expenses_entry_id")
  .get(expensesEntryController.getById)

router.route("/test")
  .get(teamsController.test)

module.exports = router;