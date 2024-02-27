const mongoose = require('mongoose')

let productSchema = new mongoose.Schema({ 
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    image: { type: Array, required: true}
}, {timestamps: true})

const Product = mongoose.model("products", productSchema);

module.exports = Product;