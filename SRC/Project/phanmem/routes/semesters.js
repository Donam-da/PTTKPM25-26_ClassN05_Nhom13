const express = require('express');
const { body, validationResult } = require('express-validator');
const Semester = require('../models/Semester');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/semesters
// @desc    Get all semesters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive, isCurrent, academicYear } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (isCurrent !== undefined) filter.isCurrent = isCurrent === 'true';
    if (academicYear) filter.academicYear = academicYear;

    const semesters = await Semester.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ academicYear: -1, semesterNumber: -1 });

    res.json(semesters);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/semesters/current
// @desc    Get current semester
// @access  Public
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    // Always return the active, current semester if it exists
    const currentSemester = await Semester.findOne({
      isActive: true,
      isCurrent: true
    });

    if (!currentSemester) {
      return res.status(404).json({ message: 'No current semester found' });
    }

    const json = currentSemester.toJSON();
    json.registrationOpen = (
      now >= currentSemester.registrationStartDate &&
      now <= currentSemester.registrationEndDate &&
      currentSemester.isActive === true
    );

    res.json(json);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/semesters
// @desc    Create a new semester
// @access  Private (Admin only)
router.post('/', [
  auth,
  body('name', 'Semester name is required').not().isEmpty(),
  body('code', 'Semester code is required').not().isEmpty(),
  body('academicYear', 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)')
    .matches(/^\d{4}-\d{4}$/),
  body('semesterNumber', 'Semester number must be 1, 2, or 3').isIn([1, 2, 3]),
  body('startDate', 'Start date is required').isISO8601(),
  body('endDate', 'End date is required').isISO8601(),
  body('registrationStartDate', 'Registration start date is required').isISO8601(),
  body('registrationEndDate', 'Registration end date is required').isISO8601(),
  body('withdrawalDeadline', 'Withdrawal deadline is required').isISO8601()
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const semester = new Semester({
      ...req.body,
      createdBy: req.user.id
    });

    await semester.save();

    // Populate creator info
    await semester.populate('createdBy', 'firstName lastName');

    res.json(semester);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/semesters/:id
// @desc    Update semester
// @access  Private (Admin only)
router.put('/:id', [
  auth,
  body('name', 'Semester name is required').not().isEmpty(),
  body('code', 'Semester code is required').not().isEmpty(),
  body('academicYear', 'Academic year must be in format YYYY-YYYY (e.g., 2024-2025)')
    .matches(/^\d{4}-\d{4}$/),
  body('semesterNumber', 'Semester number must be 1, 2, or 3').isIn([1, 2, 3]),
  body('startDate', 'Start date is required').isISO8601(),
  body('endDate', 'End date is required').isISO8601(),
  body('registrationStartDate', 'Registration start date is required').isISO8601(),
  body('registrationEndDate', 'Registration end date is required').isISO8601(),
  body('withdrawalDeadline', 'Withdrawal deadline is required').isISO8601()
], async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const semester = await Semester.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    res.json(semester);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/semesters/:id/activate
// @desc    Activate a semester
// @access  Private (Admin only)
router.put('/:id/activate', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const semester = await Semester.findById(req.params.id);
    if (!semester) {
      return res.status(404).json({ message: 'Semester not found' });
    }

    // Deactivate all other semesters
    await Semester.updateMany(
      { _id: { $ne: semester._id } },
      { isActive: false, isCurrent: false }
    );

    // Activate this semester
    semester.isActive = true;
    semester.isCurrent = true;
    await semester.save();

    res.json(semester);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Semester not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 