const userModel = require('../models/userModel')

const authenticateAdmin = async (req, res, next) => {
    const username = req.session.username

    let user = await userModel.findOne({username})

    if (user.isAdmin) {
        next();
    } else {
        res.status(403).json({ message: 'Permission denied. Admin access required.' });
    }
}

module.exports = { authenticateAdmin }
