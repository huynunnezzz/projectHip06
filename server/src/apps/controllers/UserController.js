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
    const user = await userModel.findOne({ email });
    if (user) {
        throw new Error('User đã được đăng ký');
    } else {
        const newUser = await userModel(req.body).save();
        return res
            .status(200)
            .json({
                success: newUser ? true : false,
                mes: newUser ? "Đăng ký thành công" : "Đăng ký thất bại"
            })
    }
})

const login = asyncHandle(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({
                success: false,
                mes: "Missing inputs"
            })
    }
    const user = await userModel.findOne({ email });

    //check co trong db va dung mat khau
    if (user && await user.isCorrectPassword(password)) {
        const { password, role, ...userData } = user.toObject();
        return res.status(200)
            .json({
                success: true,
                userData
            })
    } else {
        throw new Error('Đăng nhập thất bại');
    }
})




module.exports = {
    register,
    login
}