const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'Unauthorized' });
}

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            message: 'Unauthorized' });
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        // I thought we should log error
        console.error('Auth error:', error.message);

        return res.status(401).json({
            message: 'unauthorized' });
    }

}

module.exports = { authenticate };
