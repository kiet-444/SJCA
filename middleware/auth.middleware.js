const jwt = require('jsonwebtoken');

// Middleware để xác thực token
const verifyToken = (req, res, next) => {

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Failed to authenticate token' });
        
        console.log("Decoded",decoded);
        // Lưu thông tin user id và role từ token vào req
        req.userId = decoded.id;
        req.userRole = decoded.role;
        next();
    });
};


const isEmployer = (req, res, next) => {
    if (req.userRole !== 'employer') return res.status(403).json({ message: 'Access denied' });
    next();
};

const isWorker = (req, res, next) => {
    if (req.userRole !== 'worker') return res.status(403).json({ message: 'Access denied' });
    next();
};

const isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Access denied' });
    next();
};

const isSupportStaff = (req, res, next) => {
    if (req.userRole !== 'support staff') return res.status(403).json({ message: 'Access denied' });
    next();
};

module.exports = { verifyToken, isEmployer, isWorker, isAdmin, isSupportStaff };
