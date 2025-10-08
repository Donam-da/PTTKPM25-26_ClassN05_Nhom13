import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Course from '../models/Course.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
	const courses = await Course.findAll();
	res.json(courses);
});

router.get('/:id', protect, async (req, res) => {
	const course = await Course.findByPk(req.params.id);
	if (!course) return res.status(404).json({ message: 'Course not found' });
	res.json(course);
});

router.post(
	'/',
	protect,
	authorize('admin', 'teacher'),
	[body('code').notEmpty(), body('title').notEmpty(), body('credits').isNumeric()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const course = await Course.create(req.body);
		res.status(201).json(course);
	}
);

router.put('/:id', protect, authorize('admin', 'teacher'), async (req, res) => {
	const course = await Course.findByPk(req.params.id);
	if (!course) return res.status(404).json({ message: 'Course not found' });
	await course.update(req.body);
	res.json(course);
});

export default router;
