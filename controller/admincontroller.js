const Admin = require('../model/adminpanel')
const bcrypt = require('bcrypt')
const jwtData = require('jsonwebtoken');

module.exports.ragister = async (req, res) => {
    // console.log(req.body);
    try {
        const checkemail = await Admin.findOne({ email: req.body.email });
        if (checkemail) {
            return res.status(200).json({ mes: "Email already exits", status: 0 });
        }
        else {
            req.body.password = await bcrypt.hash(req.body.password, 10);
            const data = await Admin.create(req.body);
            if (data) {
                return res.status(200).json({ mes: "data insert succesfully", data: data, status: 1 });
            }
            else {
                return res.status(200).json({ mes: "data not found", status: 0 });

            }
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ mes: "something worng", status: 0 });
    }
}
module.exports.login = async (req, res) => {
    try {
        if (req.body) {
            const checkemail = await Admin.findOne({ email: req.body.email })
            // console.log(checkemail);
            // console.log(req.body.password);
            
            if (checkemail) {
                if (await bcrypt.compare(req.body.password, checkemail.password)) {
                    const token = jwtData.sign({ AdminData: checkemail }, "JWTPR", { expiresIn: "1h" });

                    return res.status(200).json({ mes: " login successfully", logintoken: token, status: 1 });
                }
                else {
                    return res.status(200).json({ mes: "password not match", status: 0 });
                }
            }
            else {
                return res.status(200).json({ mes: "email not match", status: 0 })
            }
        }
        else {
            return res.status(200).json({ mes: "invlaid data", status: 0 });
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({ mes: "something worng", status: 0 });
    }
}