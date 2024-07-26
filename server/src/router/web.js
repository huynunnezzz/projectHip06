const express = require("express");
const router = express.Router();
const UserController = require('../apps/controllers/UserController');




router.post("/api/user/register", UserController.register);
router.post("/api/user/login", UserController.login);





module.exports = router;