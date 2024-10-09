const Admin = require('../model/adminpanel');
const User = require('../model/userpanel');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

module.exports.add_Expense = async (req, res) => {
    try {
        if (req.body) {
            const userData = await Admin.findById(req.user._id);
            if (userData) {
                const checkData = await User.findOne({ title: req.body.title });
                if (checkData) {
                    return res.status(200).json({ mes: "user Data insert already", status: 1 })
                }
                else {
                    req.body.Created_date = new Date().toLocaleDateString();
                    req.body.Updated_date = new Date().toLocaleString();
                    req.body.adminId = userData.id
                    const newpost = await User.create(req.body);
                    if (newpost) {
                        return res.status(200).json({ mes: "user Data successfully insert", newpost: newpost, status: 1 })
                    }
                    else {
                        return res.status(200).json({ mes: "user not found", status: 0 })
                    }

                }
            }
            else {
                return res.status(200).json({ mes: "User not found", status: 0 })
            }
        }
        else {
            return res.status(200).json({ mes: "invliad Data", status: 0 })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ mes: "something worng", status: 0 })
    }
}
module.exports.viewExpense = async (req, res) => {
    try {
        const viewData = await User.find({ adminId: req.user._id })
        if (viewData != "") {
            return res.status(200).json({
                msg: "Here is all post data", viewData: viewData, status: 1
            });
        } else {
            return res.status(200).json({ msg: "No user found", status: 0 });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ mes: "something worng", status: 0 })
    }
}

module.exports.deleteExpence = async (req, res) => {
    try {
        let deletedata = await User.findByIdAndDelete(req.params.id, req.body)
        if (deletedata) {
            return res.status(200).json({ mes: "Delete record sucessfully", deletedata: deletedata, status: 1 });
        }
        else {
            return res.status(200).json({ mes: "invliad Data", status: 0 });

        }
    } catch (error) {
        console.log(error);
        return req.status(400).json({ mes: "something worng", status: 0 })
    }
}

module.exports.editExpence = async (req, res) => {
    try {
        let editdata = await User.findByIdAndUpdate(req.params.id, req.body)
        if (editdata) {
            return res.status(200).json({ mes: "Edit record sucessfully", editdata: editdata, status: 1 });
        }
        else {
            return res.status(200).json({ mes: "invliad Data", status: 0 });

        }
    } catch (error) {
        console.log(error);
        return req.status(400).json({ mes: "something worng", status: 0 })
    }
}


// Bulk upload expenses via CSV
module.exports.uploadCSV = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No CSV file uploaded' });
    }

    const expenses = [];
    const filePath = req.file.path;

    try {
        // Parse CSV file
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                expenses.push({
                    title: row.title,
                    description: row.description,
                    amount: parseFloat(row.amount),
                    category: row.category,
                    adminId: req.user._id,
                    paymentMethod: row.paymentMethod,
                    Created_date: new Date().toLocaleDateString(),
                    Updated_date: new Date().toLocaleString()
                });
            })
            .on('end', async () => {
                try {
                    await User.insertMany(expenses);  // Insert expenses in bulk
                    res.status(201).json({ message: 'Expenses uploaded successfully', count: expenses.length });
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Error saving expenses', error });
                } finally {
                    fs.unlinkSync(filePath); // Clean up the uploaded file
                }
            });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'CSV parsing error', error });
    }
};

module.exports.fetchExpenses = async (req, res) => {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    let filter = { adminId: req.user._id };

    if (category) {
        filter.category = category;
    }
    if (startDate || endDate) {
        filter.created_at = {}; // Update field name to created_at
        if (startDate) {
            filter.created_at['$gte'] = new Date(startDate);
        }
        if (endDate) {
            filter.created_at['$lte'] = new Date(endDate);
        }
    }

    try {
        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { amount: 1 },
        };

        const result = await User.find(filter, options);
        res.status(200).json({
            message: 'Expenses fetched successfully',
            data: result,
            total: result.length,
            page: page,
            totalPages: Math.ceil(result.length / limit),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching expenses', error });
    }
};

// Fetch expenses with optional filtering and pagination
module.exports.fetchExpenses = async (req, res) => {
    const { page = 1, limit = 10, category, startDate, endDate } = req.query;

    let filter = { adminId: req.user._id };

    if (category) {
        filter.category = category;
    }
    if (startDate || endDate) {
        filter.created_at = {}; // Update field name to created_at
        if (startDate) {
            filter.created_at['$gte'] = new Date(startDate);
        }
        if (endDate) {
            filter.created_at['$lte'] = new Date(endDate);
        }
    }

    try {
        const expenses = await User.find(filter).sort({ amount: 1 }).limit(limit).skip((page - 1) * limit);
        const total = await User.countDocuments(filter);

        res.status(200).json({
            message: 'Expenses fetched successfully',
            data: expenses,
            total: total,
            page: page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching expenses', error });
    }
};

module.exports.generateExpenseStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $match: { adminId: req.user._id }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$created_at" },
                        year: { $year: "$created_at" },
                        category: "$category"
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);

        res.status(200).json({
            message: 'Expense statistics generated successfully',
            stats: stats,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error generating statistics', error });
    }
};