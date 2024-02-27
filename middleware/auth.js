const userModel = require('../models/userModel')

const authorizationAdmin = async (req, res, next) => {
    const username = req.session.username

    let user = await userModel.findOne({username})

    if (user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Permission denied. Admin access required.' });
    }
}

const isAuthenticated = (req, res, next) => {
    if (req.session.username) {
        next();
    } else {
        res.redirect('/');
    }
}

module.exports = { authorizationAdmin, isAuthenticated }
