const jwt = require('jsonwebtoken');
const User = require('../models/user');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.UdemyNodeJsJwtSecret);
        const user = await User.findOne({'_id': decoded._id, 'tokens.token': token});

        if (!user) {
            throw new Error();
        }

        // Add the found user and their token onto the request
        req.user = user;
        req.token = token;
        next();
    } catch (e) {
        res.status(401).send({error: 'Please authenticate'});
    }
};

module.exports = auth;
