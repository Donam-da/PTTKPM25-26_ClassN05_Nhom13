import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Registration from '../models/Registration.js';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
	const where = req.user.role === 'student' ? { studentId: req.user.id } : undefined;
	const regs = await Registration.findAll({ where });
	res.json(regs);
});

router.post(
	'/',
	protect,
	authorize('student'),
	[body('course').isMongoId(), body('semester').isMongoId()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const { course, semester } = req.body;
		const exists = await Course.findByPk(course);
		if (!exists) return res.status(404).json({ message: 'Course not found' });
		const reg = await Registration.create({ studentId: req.user.id, courseId: course, semesterId: semester });
		res.status(201).json(reg);
	}
);

router.put('/:id/approve', protect, authorize('teacher', 'admin'), async (req, res) => {
	const reg = await Registration.findByPk(req.params.id);
	if (!reg) return res.status(404).json({ message: 'Registration not found' });
	await reg.update({ status: 'approved' });
	res.json(reg);
});

router.put('/:id/drop', protect, async (req, res) => {
	const reg = await Registration.findByPk(req.params.id);
	if (!reg) return res.status(404).json({ message: 'Registration not found' });
	if (req.user.role === 'student' && reg.studentId !== req.user.id) {
		return res.status(403).json({ message: 'Forbidden' });
	}
	await reg.update({ status: 'dropped' });
	res.json(reg);
});

export default router;
