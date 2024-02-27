const express = require('express')
const userController = require('../controllers/userController')

const router = express.Router();

router.post('/register', userController.registerUser);
router.post('/loginUser', userController.loginUser);

module.exports = router