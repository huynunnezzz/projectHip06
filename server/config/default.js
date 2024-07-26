require('dotenv').config();
module.exports = {
    app: {
        port: process.env.SERVER_PORT || 3000,
        static_folder: `../src/public`,
        router: `../src/router/web`,
        view_folder: `../src/apps/views`,
        session_key: "huypro",
    },
    db: {
        DB_URI: 'mongodb://127.0.0.1:27017/duanhip06',
    }

}