import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = Router();

function signToken(userId) {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
}

router.post(
	'/register',
	[
		body('firstName').notEmpty(),
		body('lastName').notEmpty(),
		body('email').isEmail(),
		body('password').isLength({ min: 6 }),
		body('role').optional().isIn(['student', 'teacher', 'admin']),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		try {
			const existing = await User.findOne({ email: req.body.email });
			if (existing) return res.status(409).json({ message: 'Email already registered' });
            const user = await User.create(req.body);
            const token = signToken(user.id);
            res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
		} catch (err) {
			res.status(500).json({ message: 'Registration failed', error: err.message });
		}
	}
);

router.post(
	'/login',
	[body('email').isEmail(), body('password').isString()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { email, password } = req.body;
		try {
            const user = await User.findOne({ where: { email } });
			if (!user) return res.status(401).json({ message: 'Invalid credentials' });
            const match = await bcrypt.compare(password, user.password);
			if (!match) return res.status(401).json({ message: 'Invalid credentials' });
            const token = signToken(user.id);
            res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
		} catch (err) {
			res.status(500).json({ message: 'Login failed', error: err.message });
		}
	}
);

router.get('/me', protect, async (req, res) => {
    res.json({ user: req.user });
});

router.post(
	'/change-password',
	protect,
	[body('currentPassword').isString(), body('newPassword').isLength({ min: 6 })],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { currentPassword, newPassword } = req.body;
		try {
            const user = await User.findByPk(req.user.id);
			const ok = await user.comparePassword(currentPassword);
			if (!ok) return res.status(400).json({ message: 'Current password incorrect' });
			user.password = newPassword;
			await user.save();
			res.json({ message: 'Password updated' });
		} catch (err) {
			res.status(500).json({ message: 'Change password failed', error: err.message });
		}
	}
);

export default router;
