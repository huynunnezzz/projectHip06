const express = require("express");
const router = express.Router();
const UserController = require('../apps/controllers/UserController');
const ProductController = require('../apps/controllers/ProductController');
const { verifyAccessToken, isAdmin } = require('../apps/middlewares/verifyToken');


// admin vs user dùng chung
router.post("/api/user/register", UserController.register);
router.post("/api/user/login", UserController.login);
router.get("/api/user/current", verifyAccessToken, UserController.current);

//Cap nhat trang ca nhan
router.put("/api/user/current/update", [verifyAccessToken], UserController.updateUser);
router.post("/api/user/refreshToken", UserController.refreshToken);
router.post("/api/user/logout", UserController.logout);
router.get("/api/user/forgot-password", UserController.forgotPassword);
router.put("/api/user/reset-password/:token", UserController.resetPassword);

//chi admin dùng
router.get("/api/user/", UserController.getUsers);
router.delete("/api/user/delete/:uid", [verifyAccessToken, isAdmin], UserController.deleteUserbyAdmin);
router.put("/api/user/update/:uid", [verifyAccessToken, isAdmin], UserController.updateUserbyAdmin);


//Product
router.get("/api/product/:pid", ProductController.getProduct);
router.get("/api/product", ProductController.getProducts);
router.post("/api/product/store", [verifyAccessToken, isAdmin], ProductController.createProduct);
router.put("/api/product/update/:pid", [verifyAccessToken, isAdmin], ProductController.updateProduct);
router.delete("/api/product/delete/:pid", [verifyAccessToken, isAdmin], ProductController.deleteProduct);





//CRUD | Create - Read - Update - Delete | POST - GET - PUT - DELETE
//CREATE(POST) + PUT : body
//GET + DELETE : query

module.exports = router;