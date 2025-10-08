const mongoose = require('mongoose');

const SemesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    academicYear: {
        type: String,
        required: true,
        trim: true,
        match: /^\d{4}-\d{4}$/ // Format: 2023-2024
    },
    semesterNumber: {
        type: Number,
        required: true,
        min: 1,
        max: 3 // 1: Fall, 2: Spring, 3: Summer
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    registrationStartDate: {
        type: Date,
        required: true
    },
    registrationEndDate: {
        type: Date,
        required: true
    },
    withdrawalDeadline: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: false
    },
    isCurrent: {
        type: Boolean,
        default: false
    },
    maxCreditsPerStudent: {
        type: Number,
        default: 24,
        min: 1
    },
    minCreditsPerStudent: {
        type: Number,
        default: 12,
        min: 1
    },
    description: {
        type: String,
        trim: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for better query performance
SemesterSchema.index({ code: 1 });
SemesterSchema.index({ academicYear: 1, semesterNumber: 1 });
SemesterSchema.index({ isActive: 1 });
SemesterSchema.index({ isCurrent: 1 });
SemesterSchema.index({ startDate: 1, endDate: 1 });

// Virtual for semester type name
SemesterSchema.virtual('semesterType').get(function () {
    const types = { 1: 'Fall', 2: 'Spring', 3: 'Summer' };
    return types[this.semesterNumber] || 'Unknown';
});

// Virtual for full semester name
SemesterSchema.virtual('fullName').get(function () {
    return `${this.semesterType} ${this.academicYear}`;
});

// Check if semester is currently active for registration
SemesterSchema.methods.isRegistrationOpen = function () {
    const now = new Date();
    return now >= this.registrationStartDate &&
        now <= this.registrationEndDate &&
        this.isActive;
};

// Check if semester is in session
SemesterSchema.methods.isInSession = function () {
    const now = new Date();
    return now >= this.startDate && now <= this.endDate && this.isActive;
};

// Check if withdrawal is allowed
SemesterSchema.methods.isWithdrawalAllowed = function () {
    const now = new Date();
    return now <= this.withdrawalDeadline && this.isActive;
};

// Validate dates
SemesterSchema.pre('save', function (next) {
    // End date must be after start date
    if (this.endDate <= this.startDate) {
        return next(new Error('End date must be after start date'));
    }

    // Registration end must be after registration start
    if (this.registrationEndDate <= this.registrationStartDate) {
        return next(new Error('Registration end date must be after registration start date'));
    }

    // Registration should typically be before semester starts
    if (this.registrationEndDate > this.startDate) {
        console.warn('Warning: Registration ends after semester starts');
    }

    // Withdrawal deadline should be before semester ends
    if (this.withdrawalDeadline > this.endDate) {
        return next(new Error('Withdrawal deadline must be before semester end date'));
    }

    // Min credits should not exceed max credits
    if (this.minCreditsPerStudent > this.maxCreditsPerStudent) {
        return next(new Error('Minimum credits cannot exceed maximum credits'));
    }

    next();
});

// Ensure only one semester can be current at a time
SemesterSchema.pre('save', async function (next) {
    if (this.isCurrent && this.isModified('isCurrent')) {
        try {
            // Set all other semesters to not current
            await this.constructor.updateMany(
                { _id: { $ne: this._id } },
                { isCurrent: false }
            );
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// Static method to get current semester
SemesterSchema.statics.getCurrentSemester = function () {
    return this.findOne({ isCurrent: true, isActive: true });
};

// Static method to get active semesters
SemesterSchema.statics.getActiveSemesters = function () {
    return this.find({ isActive: true }).sort({ startDate: -1 });
};

// Static method to get semesters for registration
SemesterSchema.statics.getRegistrationSemesters = function () {
    const now = new Date();
    return this.find({
        isActive: true,
        registrationStartDate: { $lte: now },
        registrationEndDate: { $gte: now }
    }).sort({ startDate: 1 });
};

// Ensure virtual fields are serialized
SemesterSchema.set('toJSON', {
    virtuals: true
});

module.exports = mongoose.model('Semester', SemesterSchema);
