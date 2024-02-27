const productModel = require('../models/productModel')

const addProduct = async (req, res) => {
    try {
        const { name, description, price } = req.body
        const image = req.files.map(file => file.buffer)

        const newProduct = new productModel({
            name,
            description,
            price,
            image,
        });

        await newProduct.save();

        res.redirect('/adminPanel');
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deleteProduct = async (req, res) => {
    const { id } = req.params

    try {
        await productModel.findByIdAndDelete(id);
        res.redirect('/adminPanel');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}

const update = async (req, res) => {
    const id = req.params.id
    const { name, description, price } = req.body

    productModel.findByIdAndUpdate(id, { name, price, description })
        .then(() => res.redirect('/adminPanel'))
        .catch(err => res.status(500).send(err.message))
}

module.exports = { addProduct, update, deleteProduct }