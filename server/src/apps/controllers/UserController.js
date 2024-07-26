const userModel = require('../models/user');
const asyncHandle = require('express-async-handler');

//asyncHandle để thay cho try_catch
const register = asyncHandle(async (req, res) => {
    const { fullname, email, phone, password } = req.body;
    if (!fullname || !email || !phone || !password) {
        return res
            .status(400)
            .json({
                success: false,
                mes: "Missing inputs"
            })
    }
    const response = await userModel(req.body).save();
    return res
        .status(200)
        .json({
            success: response ? true : false,
            response
        })
})




module.exports = {
    register
}