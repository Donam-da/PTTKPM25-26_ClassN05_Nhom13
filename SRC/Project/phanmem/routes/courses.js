const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const User = require('../models/User');
const Semester = require('../models/Semester');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/courses
// @desc    Get all courses with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const {
            search,
            major,
            year,
            semester,
            category,
            isActive,
            teacher,
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};

        // Apply filters
        if (search) {
            filter.$or = [
                { courseCode: { $regex: search, $options: 'i' } },
                { courseName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        if (major) filter.major = major;
        if (year) filter.yearLevel = parseInt(year);
        if (semester) filter.semesterNumber = parseInt(semester);
        if (category) filter.courseType = category;
        if (isActive !== undefined) filter.isActive = isActive === 'true';
        if (teacher) filter.teacher = teacher;

        const skip = (page - 1) * limit;

        const courses = await Course.find(filter)
            .populate('teacher', 'firstName lastName email')
            .populate('semester', 'name code academicYear')
            .sort({ courseCode: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Course.countDocuments(filter);

        res.json({
            courses,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'firstName lastName email')
            .populate('semester', 'name code academicYear')
            .populate('prerequisites', 'courseCode courseName');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json(course);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/courses/teacher/:teacherId
// @desc    Get courses by teacher
// @access  Private
router.get('/teacher/:teacherId', auth, async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.params.teacherId })
            .populate('semester', 'name code academicYear')
            .sort({ courseCode: 1 });

        res.json(courses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/courses
// @desc    Create a new course
// @access  Private (Admin/Teacher)
router.post('/', [
    auth,
    body('courseCode', 'Course code is required').not().isEmpty(),
    body('courseName', 'Course name is required').not().isEmpty(),
    body('credits', 'Credits must be between 1 and 6').isInt({ min: 1, max: 6 }),
    body('department', 'Department is required').not().isEmpty(),
    body('major', 'Major is required').not().isEmpty(),
    body('teacher', 'Teacher is required').isMongoId(),
    body('semester', 'Semester is required').isMongoId(),
    body('maxStudents', 'Max students must be at least 1').isInt({ min: 1 }),
    body('registrationDeadline', 'Registration deadline is required').isISO8601(),
    body('withdrawalDeadline', 'Withdrawal deadline is required').isISO8601(),
    body('yearLevel', 'Year level must be between 1 and 6').isInt({ min: 1, max: 6 }),
    body('semesterNumber', 'Semester number must be between 1 and 12').isInt({ min: 1, max: 12 }),
    body('schedule.dayOfWeek', 'Day of week must be between 1 and 7').isInt({ min: 1, max: 7 }),
    body('schedule.startTime', 'Start time is required').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('schedule.endTime', 'End time is required').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    body('schedule.room', 'Room is required').not().isEmpty()
], async (req, res) => {
    try {
        // Check if user is admin or teacher
        if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if course code already exists
        const existingCourse = await Course.findOne({ courseCode: req.body.courseCode });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        // Verify teacher exists
        const teacher = await User.findById(req.body.teacher);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Invalid teacher' });
        }

        // Verify semester exists
        const semester = await Semester.findById(req.body.semester);
        if (!semester) {
            return res.status(400).json({ message: 'Invalid semester' });
        }

        const course = new Course(req.body);
        await course.save();

        // Populate the course data
        await course.populate('teacher', 'firstName lastName email');
        await course.populate('semester', 'name code academicYear');

        res.status(201).json(course);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/courses/:id
// @desc    Update course
// @access  Private (Admin/Teacher who owns the course)
router.put('/:id', [
    auth,
    body('courseCode', 'Course code is required').not().isEmpty(),
    body('courseName', 'Course name is required').not().isEmpty(),
    body('credits', 'Credits must be between 1 and 6').isInt({ min: 1, max: 6 }),
    body('department', 'Department is required').not().isEmpty(),
    body('major', 'Major is required').not().isEmpty(),
    body('teacher', 'Teacher is required').isMongoId(),
    body('semester', 'Semester is required').isMongoId(),
    body('maxStudents', 'Max students must be at least 1').isInt({ min: 1 }),
    body('registrationDeadline', 'Registration deadline is required').isISO8601(),
    body('withdrawalDeadline', 'Withdrawal deadline is required').isISO8601(),
    body('yearLevel', 'Year level must be between 1 and 6').isInt({ min: 1, max: 6 }),
    body('semesterNumber', 'Semester number must be between 1 and 12').isInt({ min: 1, max: 12 })
], async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // Check if course code already exists (excluding current course)
        const existingCourse = await Course.findOne({
            courseCode: req.body.courseCode,
            _id: { $ne: req.params.id }
        });
        if (existingCourse) {
            return res.status(400).json({ message: 'Course code already exists' });
        }

        // Verify teacher exists
        const teacher = await User.findById(req.body.teacher);
        if (!teacher || teacher.role !== 'teacher') {
            return res.status(400).json({ message: 'Invalid teacher' });
        }

        // Verify semester exists
        const semester = await Semester.findById(req.body.semester);
        if (!semester) {
            return res.status(400).json({ message: 'Invalid semester' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        )
            .populate('teacher', 'firstName lastName email')
            .populate('semester', 'name code academicYear');

        res.json(updatedCourse);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/courses/:id
// @desc    Delete course
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if course has any registrations
        const Registration = require('../models/Registration');
        const registrationCount = await Registration.countDocuments({ course: req.params.id });
        if (registrationCount > 0) {
            return res.status(400).json({
                message: 'Cannot delete course with existing registrations'
            });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/courses/:id/toggle-status
// @desc    Toggle course active status
// @access  Private (Admin/Teacher who owns the course)
router.put('/:id/toggle-status', auth, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check authorization
        if (req.user.role !== 'admin' && course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        course.isActive = !course.isActive;
        await course.save();

        await course.populate('teacher', 'firstName lastName email');
        await course.populate('semester', 'name code academicYear');

        res.json(course);
    } catch (error) {
        console.error(error.message);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
