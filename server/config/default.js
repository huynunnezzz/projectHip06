require('dotenv').config();
module.exports = {
    app: {
        port: process.env.SERVER_PORT,
        static_folder: `../src/public`,
        router: `../src/router/web`,
        view_folder: `../src/apps/views`,
        session_key: "huypro",
    },
    db: {
        DB_URI: process.env.DB_URI,
    }

}