const express = require('express');
const { body, validationResult } = require('express-validator');
const Registration = require('../models/Registration');
const Course = require('../models/Course');
const User = require('../models/User');
const Semester = require('../models/Semester');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/registrations
// @desc    Get all registrations with filters
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const {
      student,
      course,
      semester,
      status,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    // Students can only see their own registrations
    if (req.user.role === 'student') {
      filter.student = req.user.id;
    } else if (student) {
      filter.student = student;
    }

    if (course) filter.course = course;
    if (semester) filter.semester = semester;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;

    const registrations = await Registration.find(filter)
      .populate('student', 'firstName lastName studentId email')
      .populate({
        path: 'course',
        select: 'courseCode courseName credits teacher schedule major yearLevel semesterNumber maxStudents currentStudents',
        populate: { path: 'teacher', select: 'firstName lastName email' }
      })
      .populate('semester', 'name code academicYear')
      .populate('approvedBy', 'firstName lastName')
      .sort({ registrationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Registration.countDocuments(filter);

    res.json({
      registrations,
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

// @route   POST /api/registrations
// @desc    Register for a course
// @access  Private (Students only)
router.post('/', [
  auth,
  body('courseId', 'Course ID is required').isMongoId(),
  body('semesterId', 'Semester ID is required').isMongoId()
], async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can register for courses' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { courseId, semesterId } = req.body;

    // Check if course exists and is active
    const course = await Course.findById(courseId);
    if (!course || !course.isActive) {
      return res.status(400).json({ message: 'Course not found or inactive' });
    }

    // Check if semester exists and registration is open (or course allows registration by its own deadline)
    const semester = await Semester.findById(semesterId);
    const semesterOpen = semester ? semester.isRegistrationOpen() : false;
    const courseOpen = course.isRegistrationOpen();
    if (!semester || (!semesterOpen && !courseOpen)) {
      return res.status(400).json({ message: 'Semester not found or registration closed' });
    }

    // Check if student is already registered for this course in this semester
    const existingRegistration = await Registration.findOne({
      student: req.user.id,
      course: courseId,
      semester: semesterId
    });

    if (existingRegistration) {
      return res.status(400).json({ message: 'Already registered for this course' });
    }

    // Check if course is full
    if (course.isFull()) {
      return res.status(400).json({ message: 'Course is full' });
    }

    // Check if student has enough credits available
    const student = await User.findById(req.user.id);
    if (student.currentCredits + course.credits > student.maxCredits) {
      return res.status(400).json({
        message: `Cannot register. Would exceed maximum credits (${student.maxCredits})`
      });
    }

    // Check prerequisites
    if (course.prerequisites && course.prerequisites.length > 0) {
      const completedCourses = await Registration.find({
        student: req.user.id,
        status: 'completed',
        'grade.finalGrade': { $in: ['A', 'B+', 'B', 'C+', 'C'] }
      }).populate('course');

      const completedCourseIds = completedCourses.map(r => r.course._id.toString());
      const missingPrerequisites = course.prerequisites.filter(
        prereq => !completedCourseIds.includes(prereq.toString())
      );

      if (missingPrerequisites.length > 0) {
        const prereqCourses = await Course.find({ _id: { $in: missingPrerequisites } });
        return res.status(400).json({
          message: 'Prerequisites not met',
          missingPrerequisites: prereqCourses.map(c => ({ id: c._id, code: c.courseCode, name: c.courseName }))
        });
      }
    }

    // Create registration
    const registration = new Registration({
      student: req.user.id,
      course: courseId,
      semester: semesterId,
      status: 'pending',
      paymentAmount: course.fee
    });

    await registration.save();

    // Update course current students count
    course.currentStudents += 1;
    await course.save();

    // Update student current credits
    student.currentCredits += course.credits;
    await student.save();

    // Populate fields for response
    await registration.populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode courseName credits' },
      { path: 'semester', select: 'name academicYear' }
    ]);

    res.json(registration);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/approve
// @desc    Approve a registration
// @access  Private (Admin/Teacher)
router.put('/:id/approve', auth, async (req, res) => {
  try {
    // Check if user is admin or teacher
    if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('course');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Teachers can only approve registrations for their own courses
    if (req.user.role === 'teacher' && registration.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to approve this registration' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({ message: 'Registration is not pending' });
    }

    registration.status = 'approved';
    registration.approvalDate = new Date();
    registration.approvedBy = req.user.id;

    await registration.save();

    // Populate fields for response
    await registration.populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode courseName credits' },
      { path: 'semester', select: 'name academicYear' },
      { path: 'approvedBy', select: 'firstName lastName' }
    ]);

    res.json(registration);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/reject
// @desc    Reject a registration
// @access  Private (Admin/Teacher)
router.put('/:id/reject', [
  auth,
  body('reason', 'Rejection reason is required').not().isEmpty()
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

    const { reason } = req.body;

    const registration = await Registration.findById(req.params.id)
      .populate('course');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Teachers can only reject registrations for their own courses
    if (req.user.role === 'teacher' && registration.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to reject this registration' });
    }

    if (registration.status !== 'pending') {
      return res.status(400).json({ message: 'Registration is not pending' });
    }

    registration.status = 'rejected';
    registration.notes.push({
      content: `Registration rejected: ${reason}`,
      author: req.user.id
    });

    await registration.save();

    // Update course current students count
    const course = await Course.findById(registration.course._id);
    course.currentStudents = Math.max(0, course.currentStudents - 1);
    await course.save();

    // Update student current credits
    const student = await User.findById(registration.student);
    student.currentCredits = Math.max(0, student.currentCredits - course.credits);
    await student.save();

    // Populate fields for response
    await registration.populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode courseName credits' },
      { path: 'semester', select: 'name academicYear' }
    ]);

    res.json(registration);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/drop
// @desc    Drop a course
// @access  Private (Students only)
router.put('/:id/drop', auth, async (req, res) => {
  try {
    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can drop courses' });
    }

    const registration = await Registration.findById(req.params.id)
      .populate('course')
      .populate('semester');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Check if student owns this registration
    if (registration.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (registration.status !== 'approved') {
      return res.status(400).json({ message: 'Can only drop approved registrations' });
    }

    // Check if drop deadline has passed
    if (new Date() > registration.semester.addDropEndDate) {
      return res.status(400).json({ message: 'Drop deadline has passed' });
    }

    registration.status = 'dropped';
    registration.dropDate = new Date();

    await registration.save();

    // Update course current students count
    const course = await Course.findById(registration.course._id);
    course.currentStudents = Math.max(0, course.currentStudents - 1);
    await course.save();

    // Update student current credits
    const student = await User.findById(req.user.id);
    student.currentCredits = Math.max(0, student.currentCredits - registration.course.credits);
    await student.save();

    res.json(registration);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/registrations/:id/grade
// @desc    Update grades for a registration
// @access  Private (Teacher/Admin)
router.put('/:id/grade', [
  auth,
  body('attendance').optional().isInt({ min: 0, max: 100 }),
  body('midterm').optional().isInt({ min: 0, max: 100 }),
  body('final').optional().isInt({ min: 0, max: 100 }),
  body('finalGrade').optional().isIn(['A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F', 'I', 'W'])
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

    const { attendance, midterm, final, finalGrade } = req.body;

    const registration = await Registration.findById(req.params.id)
      .populate('course');

    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    // Teachers can only grade their own courses
    if (req.user.role === 'teacher' && registration.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to grade this registration' });
    }

    // Update grades
    if (attendance !== undefined) registration.grade.attendance = attendance;
    if (midterm !== undefined) registration.grade.midterm = midterm;
    if (final !== undefined) registration.grade.final = final;
    if (finalGrade !== undefined) registration.grade.finalGrade = finalGrade;

    // Calculate GPA if all grades are present
    if (attendance !== undefined && midterm !== undefined && final !== undefined) {
      const course = await Course.findById(registration.course._id);
      const totalScore = (attendance * course.gradingPolicy.attendance / 100) +
        (midterm * course.gradingPolicy.midterm / 100) +
        (final * course.gradingPolicy.final / 100);

      // Convert score to GPA (simplified)
      if (totalScore >= 90) registration.grade.gpa = 4.0;
      else if (totalScore >= 85) registration.grade.gpa = 3.7;
      else if (totalScore >= 80) registration.grade.gpa = 3.3;
      else if (totalScore >= 75) registration.grade.gpa = 3.0;
      else if (totalScore >= 70) registration.grade.gpa = 2.7;
      else if (totalScore >= 65) registration.grade.gpa = 2.3;
      else if (totalScore >= 60) registration.grade.gpa = 2.0;
      else registration.grade.gpa = 0.0;
    }

    await registration.save();

    // Populate fields for response
    await registration.populate([
      { path: 'student', select: 'firstName lastName studentId email' },
      { path: 'course', select: 'courseCode courseName credits' },
      { path: 'semester', select: 'name academicYear' }
    ]);

    res.json(registration);
  } catch (error) {
    console.error(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Registration not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 