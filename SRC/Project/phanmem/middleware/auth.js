const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        // Get token from header (support both Authorization and x-auth-token)
        let token = req.header('Authorization') || req.header('x-auth-token');

        // Check if no token
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // Extract token from "Bearer TOKEN" format if using Authorization header
        const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Verify token
        const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);

        // Get user from token
        const user = await User.findById(decoded.user.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Token is not valid - user not found' });
        }

        if (!user.isActive) {
            return res.status(401).json({ message: 'Account is deactivated' });
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error.message);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Token is not valid' });
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token has expired' });
        }

        res.status(500).json({ message: 'Server error in authentication' });
    }
};

// Middleware to check if user is admin
const adminAuth = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
};

// Middleware to check if user is teacher or admin
const teacherAuth = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Teacher or admin privileges required.' });
    }
};

// Middleware to check if user is student, teacher, or admin
const userAuth = (req, res, next) => {
    if (req.user && ['student', 'teacher', 'admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Valid user role required.' });
    }
};

// Optional auth middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization') || req.header('x-auth-token');

        if (token) {
            const bearerToken = token.startsWith('Bearer ') ? token.slice(7) : token;
            const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
            const user = await User.findById(decoded.user.id).select('-password');

            if (user && user.isActive) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        // Continue without authentication if token is invalid
        next();
    }
};

module.exports = {
    auth,
    adminAuth,
    teacherAuth,
    userAuth,
    optionalAuth
};
