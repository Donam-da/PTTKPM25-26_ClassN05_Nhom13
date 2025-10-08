import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export async function protect(req, res, next) {
	try {
		let token = null;
		if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
			token = req.headers.authorization.split(' ')[1];
		}
		if (!token) {
			return res.status(401).json({ message: 'Not authorized, token missing' });
		}
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);
		if (!user) {
			return res.status(401).json({ message: 'Not authorized, user not found' });
		}
		req.user = user;
		return next();
	} catch (err) {
		return res.status(401).json({ message: 'Not authorized', error: err.message });
	}
}

export function authorize(...allowedRoles) {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Not authorized' });
		}
		if (!allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Forbidden: insufficient role' });
		}
		return next();
	};
}
