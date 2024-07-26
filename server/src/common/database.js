const mongoose = require('mongoose');
connect().catch(err => console.log(err));

async function connect() {
    await mongoose.connect('mongodb://127.0.0.1:27017/duanhip06');
    console.log("Kết nối database duanhip06 thành công");
}

module.exports = connect();