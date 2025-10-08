import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, authorize('admin'), async (req, res) => {
	const users = await User.findAll({ attributes: { exclude: ['password'] } });
	res.json(users);
});

router.get('/profile', protect, async (req, res) => {
	res.json(req.user);
});

router.put(
	'/profile',
	protect,
	[body('firstName').optional(), body('lastName').optional(), body('avatarUrl').optional().isURL()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const allowed = ['firstName', 'lastName', 'avatarUrl', 'department'];
		for (const key of allowed) if (key in req.body) req.user[key] = req.body[key];
		await req.user.save();
		res.json(req.user);
	}
);

router.get('/students', protect, authorize('admin', 'teacher'), async (req, res) => {
	const students = await User.findAll({ where: { role: 'student' }, attributes: { exclude: ['password'] } });
	res.json(students);
});

export default router;
