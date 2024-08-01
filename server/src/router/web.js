const express = require("express");
const router = express.Router();
const UserController = require('../apps/controllers/UserController');
const { verifyAccessToken } = require('../apps/middlewares/verifyToken');



router.post("/api/user/register", UserController.register);
router.post("/api/user/login", UserController.login);
router.get("/api/user/current", verifyAccessToken, UserController.current);
router.post("/api/user/refreshToken", UserController.refreshToken);
router.post("/api/user/logout", UserController.logout);
router.get("/api/user/forgot-password", UserController.forgotPassword);
router.put("/api/user/reset-password/:token", UserController.resetPassword);








//CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
//CREATE(POST) + PUT : body
//GET + DELETE : query


module.exports = router;