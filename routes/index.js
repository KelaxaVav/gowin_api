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
const translationController = require("../controllers/translation");
const settingController = require("../controllers/setting");
const notificationController = require("../controllers/notification");
const deviceController = require("../controllers/device");
const templateController = require("../controllers/template");
const branchController = require("../controllers/branch");
const vendorController = require("../controllers/vendor");
const categoryController = require("../controllers/category");
const itemController = require("../controllers/item");
const invoiceController = require("../controllers/invoice");
const transactionController = require("../controllers/transaction");
const kitchenOrderController = require("../controllers/kitchenOrder");
const transferController = require("../controllers/transfer");
const holidayController = require("../controllers/holiday");
const leaveRequestController = require("../controllers/leaveRequest");
const attendanceController = require("../controllers/attendance");
const salaryController = require("../controllers/salary");
const batchController = require("../controllers/batch");
const customerController = require("../controllers/customer");
const positionController = require("../controllers/position");
// const expenseController = require("../controllers/expense");

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
router.route("/auth/notification")
  .get(notificationController.getAll);

// User
router.route("/user")
  .post(userController.create)
  .get(userController.getAll);
router.route("/user/:user_id")
  .get(userController.getById)
  .put(userController.updateById)
  .delete(userController.deleteById);

// Asset
router.route("/asset")
  .post(upload.single('file'),
    imageToServer,
    assetController.create)
  .get(assetController.getAll);

// Device
router.route("/device")
  .post(deviceController.create);

// Translation
router.route("/translation")
  .post(translationController.update)
  .get(translationController.getAll);
router.route("/translation/data")
  .get(translationController.getAllData);
router.route("/translation/:translation_id")
  .put(translationController.updateById)
  .delete(translationController.deleteById);

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

// Vendor
router.route("/vendor")
  .post(vendorController.create)
  .get(vendorController.getAll);
router.route("/vendor/:vendor_id")
  .get(vendorController.getById)
  .put(vendorController.updateById)
  .delete(vendorController.deleteById);

// Category
router.route("/category")
  .post(upload.single('image'), imageToServer, categoryController.create)
  .get(categoryController.getAll);
router.route("/category/:category_id")
  .get(categoryController.getById)
  .put(upload.single('image'), imageToServer, categoryController.updateById)
  .delete(categoryController.deleteById);
router.route("/option-category")
  .get(categoryController.getAllOptions);
router.route("/main-category")
  .get(categoryController.getAllMainCategories)
router.route("/main-category/:name")
  .get(categoryController.getMainCategoryByName);

router.route("/category/:category_id/children")
  .post(categoryController.appendChildOption)
  .delete(categoryController.removeChildOption);

// CustomItem
router.route("/item/custom")
  .get(itemController.getAllCustomItems);

// Item  
router.route("/item")
  .post(upload.single('image'), imageToServer, itemController.create)
  .get(itemController.getAll);
router.route("/item/:item_id")
  .get(itemController.getById)
  .put(upload.single('image'), imageToServer, itemController.updateById)
  .delete(itemController.deleteById);

// Batch  
router.route("/batch")
  .post(batchController.create)
  .get(batchController.getAll);
router.route("/batch/:batch_id")
  .get(batchController.getById)
  .put(batchController.updateById)
  .delete(batchController.deleteById);

// Customer  
router.route("/customer")
  .get(customerController.getAll);
router.route("/customer/:customer_id")
  .get(customerController.getById);

// Invoice
router.route("/invoice")
  .post(invoiceController.create)
  .get(invoiceController.getAll);
router.route("/invoice/item")
  .get(itemController.getAllItemsForInvoice);
router.route("/invoice/:invoice_id")
  .get(invoiceController.getById)
  .put(invoiceController.updateById)
  .delete(invoiceController.deleteById);
router.route("/invoice/:invoice_id/status/:status")
  .put(invoiceController.updateStatus);
router.route("/invoice/:invoice_id/return")
  .post(invoiceController.returnInvoice);
router.route("/invoice/:invoice_id/transaction")
  .post(transactionController.payInvoice);

// Transfer
router.route("/transfer")
  .post(transferController.create)
  .get(transferController.getAll);
router.route("/transfer/:transfer_id")
  .get(transferController.getById)
  .put(transferController.updateById)
  .delete(transferController.deleteById);
router.route("/transfer/:transfer_id/status/:status")
  .put(transferController.updateStatus);

// Transaction
router.route("/transaction")
  .get(transactionController.getAll);
router.route("/transaction/:transaction_id")
  .get(transactionController.getById)
  .put(transactionController.updateById)
  .delete(transactionController.deleteById);

// KitchenOrder
router.route("/kitchen/order")
  .post(kitchenOrderController.create)
  .get(kitchenOrderController.getAll);
router.route("/kitchen/order/:kitchen_order_id")
  .get(kitchenOrderController.getById)
  .put(kitchenOrderController.updateById)
router.route("/kitchen/orders-kanban")
  .get(kitchenOrderController.getAllAsStatusCategorized);
router.route("/kitchen/order/:kitchen_order_id/status/:status")
  .put(kitchenOrderController.updateStatus)

// Holiday  
router.route("/holiday")
  .post(holidayController.create)
  .get(holidayController.getAll);
router.route("/holiday/:holiday_id")
  .get(holidayController.getById)
  .put(holidayController.updateById)
  .delete(holidayController.deleteById);

// LeaveRequest  
router.route("/leave/request")
  .post(leaveRequestController.create)
  .get(leaveRequestController.getAll);
router.route("/leave/request/:leave_request_id")
  .get(leaveRequestController.getById)
  .put(leaveRequestController.updateById)
  .delete(leaveRequestController.deleteById);
router.route("/leave/request/:leave_request_id/status/:status")
  .put(leaveRequestController.updateStatus);

// Attendance  
router.route("/attendance")
  .post(attendanceController.create)
  .get(attendanceController.getAll);
router.route("/attendance/:attendance_id")
  .get(attendanceController.getById)
  .put(attendanceController.updateById)
  .delete(attendanceController.deleteById);

// Salary  
router.route("/salary")
  .post(salaryController.create)
  .get(salaryController.getAll);
router.route("/salary/:salary_id")
  .get(salaryController.getById)
  .put(salaryController.updateById)
  .delete(salaryController.deleteById);

// Expense  
// router.route("/expense")
//   .post(expenseController.create)
//   .get(expenseController.getAll);
// router.route("/expense/:expense_id")
//   .get(expenseController.getById)
//   .put(expenseController.updateById)
//   .delete(expenseController.deleteById);
// router.route("/expense/:expense_id/transaction")
//   .post(transactionController.payExpense);

// Position  
router.route("/position")
  .post(positionController.create)
  .get(positionController.getAll);
router.route("/position/:position_id")
  .get(positionController.getById)
  .put(positionController.updateById)
  .delete(positionController.deleteById);

module.exports = router;