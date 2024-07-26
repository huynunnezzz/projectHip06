const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({
    fullname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    phone: {
        type: String,
        require: true,
        unique: true
    },
    password: {
        type: String,
        require: true
    },
    //quyen
    role: {
        type: String,
        default: 'user'
    },
    //gio hang
    cart: {
        type: Array,
        default: []
    },
    //dia chi
    address: [
        { type: mongoose.Types.ObjectId, ref: 'Address' },
    ],
    //danh muc yeu thich
    wishlist: [
        { type: mongoose.Types.ObjectId, ref: 'Wishlist' },
    ],
    //khoa tai khoan
    isBlock: {
        type: Boolean,
        default: false,
    },
    //doi token
    refreshToken: {
        type: String,
    },
    //thoi gian password doi
    passwordChangedAt: {
        type: String
    },
    //gui token password
    passwordResetToken: {
        type: String
    },
    //gioi han thoi gian doi mk
    passwordResetExpires: {
        type: String
    }

}, { timestamps: true });


//trước khi lưu sẽ mã hóa mật khẩu
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const saltRounds = bcrypt.genSaltSync(10);
    this.password = await bcrypt.hash(this.password, saltRounds);
});

//check mật khẩu trar về boolean
UserSchema.methods = {
    isCorrectPassword: async function (password) {
        return await bcrypt.compare(password, this.password)
    }
}
module.exports = mongoose.model('User', UserSchema, 'users');