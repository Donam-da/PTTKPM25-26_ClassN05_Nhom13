const mongoose = require('mongoose');

const RegistrationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Semester',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'withdrawn', 'completed'],
        default: 'pending'
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    approvalDate: {
        type: Date
    },
    withdrawalDate: {
        type: Date
    },
    grade: {
        letter: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F', 'I', 'W'],
            required: false,
            default: undefined
        },
        points: {
            type: Number,
            min: 0,
            max: 4,
            default: undefined
        }
    },
    attendance: {
        totalClasses: {
            type: Number,
            default: 0,
            min: 0
        },
        attendedClasses: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    notes: {
        type: String,
        trim: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    rejectionReason: {
        type: String,
        trim: true
    },
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    waitlistPosition: {
        type: Number,
        min: 1
    },
    isWaitlisted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
RegistrationSchema.index({ student: 1, semester: 1 });
RegistrationSchema.index({ course: 1, semester: 1 });
RegistrationSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true });
RegistrationSchema.index({ status: 1 });
RegistrationSchema.index({ registrationDate: 1 });
RegistrationSchema.index({ semester: 1, status: 1 });
RegistrationSchema.index({ isWaitlisted: 1, waitlistPosition: 1 });

// Virtual for attendance percentage
RegistrationSchema.virtual('attendancePercentage').get(function () {
    if (this.attendance.totalClasses === 0) return 0;
    return Math.round((this.attendance.attendedClasses / this.attendance.totalClasses) * 100);
});

// Virtual for pass/fail status
RegistrationSchema.virtual('isPassing').get(function () {
    if (!this.grade.points) return null;
    return this.grade.points >= 2.0; // C- or better
});

// Methods
RegistrationSchema.methods.approve = function (approvedBy) {
    this.status = 'approved';
    this.approvalDate = new Date();
    this.approvedBy = approvedBy;
    this.isWaitlisted = false;
    this.waitlistPosition = undefined;
    return this.save();
};

RegistrationSchema.methods.reject = function (reason, rejectedBy) {
    this.status = 'rejected';
    this.rejectionReason = reason;
    this.approvedBy = rejectedBy;
    return this.save();
};

RegistrationSchema.methods.withdraw = function () {
    this.status = 'withdrawn';
    this.withdrawalDate = new Date();
    return this.save();
};

RegistrationSchema.methods.complete = function (grade) {
    this.status = 'completed';
    if (grade) {
        this.grade = grade;
    }
    return this.save();
};

RegistrationSchema.methods.addToWaitlist = function (position) {
    this.isWaitlisted = true;
    this.waitlistPosition = position;
    this.status = 'pending';
    return this.save();
};

// Static methods
RegistrationSchema.statics.getStudentRegistrations = function (studentId, semesterId, status) {
    const query = { student: studentId };
    if (semesterId) query.semester = semesterId;
    if (status) query.status = status;

    return this.find(query)
        .populate('course', 'courseCode courseName credits teacher schedule')
        .populate('semester', 'name code academicYear')
        .sort({ registrationDate: -1 });
};

RegistrationSchema.statics.getCourseRegistrations = function (courseId, status) {
    const query = { course: courseId };
    if (status) query.status = status;

    return this.find(query)
        .populate('student', 'firstName lastName studentId email')
        .sort({ registrationDate: 1 });
};

RegistrationSchema.statics.getSemesterRegistrations = function (semesterId, status) {
    const query = { semester: semesterId };
    if (status) query.status = status;

    return this.find(query)
        .populate('student', 'firstName lastName studentId major year')
        .populate('course', 'courseCode courseName credits')
        .sort({ registrationDate: -1 });
};

RegistrationSchema.statics.getWaitlistedRegistrations = function (courseId) {
    return this.find({
        course: courseId,
        isWaitlisted: true,
        status: 'pending'
    })
        .populate('student', 'firstName lastName studentId email')
        .sort({ waitlistPosition: 1 });
};

// Calculate total credits for a student in a semester
RegistrationSchema.statics.getStudentCredits = async function (studentId, semesterId) {
    const registrations = await this.find({
        student: studentId,
        semester: semesterId,
        status: { $in: ['approved', 'completed'] }
    }).populate('course', 'credits');

    return registrations.reduce((total, reg) => total + reg.course.credits, 0);
};

// Pre-save middleware
RegistrationSchema.pre('save', function (next) {
    // Validate attendance
    if (this.attendance.attendedClasses > this.attendance.totalClasses) {
        return next(new Error('Attended classes cannot exceed total classes'));
    }

    // Set grade points based on letter grade
    if (this.grade.letter && !this.grade.points) {
        const gradePoints = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0, 'I': null, 'W': null
        };
        this.grade.points = gradePoints[this.grade.letter];
    }

    next();
});

// Post-save middleware to update course student count
RegistrationSchema.post('save', async function (doc) {
    try {
        const Course = mongoose.model('Course');
        const approvedCount = await mongoose.model('Registration').countDocuments({
            course: doc.course,
            status: 'approved'
        });

        await Course.findByIdAndUpdate(doc.course, {
            currentStudents: approvedCount
        });
    } catch (error) {
        console.error('Error updating course student count:', error);
    }
});

// Post-remove middleware to update course student count
RegistrationSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        try {
            const Course = mongoose.model('Course');
            const approvedCount = await mongoose.model('Registration').countDocuments({
                course: doc.course,
                status: 'approved'
            });

            await Course.findByIdAndUpdate(doc.course, {
                currentStudents: approvedCount
            });
        } catch (error) {
            console.error('Error updating course student count:', error);
        }
    }
});

// Ensure virtual fields are serialized
RegistrationSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Registration', RegistrationSchema);
