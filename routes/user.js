const express = require('express');

const Passport = require('passport');

const routes = express.Router();

const usercontroller = require('../controller/Expensecontroller');

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
routes.post('/add_Expense', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), usercontroller.add_Expense);

routes.get('/viewExpense', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), usercontroller.viewExpense);

routes.delete('/deleteExpence/:id', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), usercontroller.deleteExpence);

routes.patch('/editExpence/:id', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), usercontroller.editExpence);


// Bulk CSV upload of expenses
routes.post('/uploadCSV', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), upload.single('file'), usercontroller.uploadCSV);

routes.get('/fetchExpenses',Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }),usercontroller.fetchExpenses);

routes.get('/generateExpenseStats', Passport.authenticate("userverify", { failureRedirect: "/admin/faillogin" }), usercontroller.generateExpenseStats);



module.exports = routes;