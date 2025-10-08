import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import Semester from '../models/Semester.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/', protect, async (req, res) => {
	const semesters = await Semester.findAll();
	res.json(semesters);
});

router.post(
	'/',
	protect,
	authorize('admin'),
	[body('name').notEmpty(), body('year').isNumeric(), body('startDate').isISO8601(), body('endDate').isISO8601()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
		const semester = await Semester.create(req.body);
		res.status(201).json(semester);
	}
);

export default router;
