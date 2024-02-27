const express = require('express')
const { authenticateAdmin } = require('../middleware/auth')
const { addProduct, update, deleteProduct } = require('../controllers/productController')
const multer = require('multer')
const upload = multer()

const router = express.Router()

router.post('/add', upload.array('images', 3), addProduct)
router.put('/update/:id', update)
router.delete('/delete/:id', deleteProduct)

module.exports = router