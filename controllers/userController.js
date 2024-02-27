const userModel = require('../models/userModel')
const bcryptjs = require('bcryptjs')
const validator = require('validator')
const dotenv = require('dotenv')

dotenv.config()

const registerUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username });
        if (user) return res.status(400).json("User already exists...");

        user = new userModel({
            username,
            password,
            isAdmin: false
        });

        if (!username || !password)
            return res.status(400).json("All fields are required...");

        const salt = await bcryptjs.genSalt(10);
        user.password = await bcryptjs.hash(user.password, salt);

        await user.save();

        req.session.username = username
        res.redirect('/home')
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await userModel.findOne({ username });

        if (!user) return res.status(400).json("Invalid username or password...");

        const validPassword = await bcryptjs.compare(password, user.password);
        if (!validPassword)
            return res.status(400).json("Invalid username or password...")

        req.session.username = username
        res.redirect('/home')
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

module.exports = { registerUser, loginUser }