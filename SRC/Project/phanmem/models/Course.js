const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  courseName: {
    type: String,
    required: true,
    trim: true
  },
  credits: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  description: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  major: {
    type: String,
    required: true,
    trim: true
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  prerequisiteCodes: [{
    type: String,
    trim: true
  }],
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: true
  },
  schedule: {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 1, // Monday
      max: 7  // Sunday
    },
    startTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    endTime: {
      type: String,
      required: true,
      match: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
    },
    room: {
      type: String,
      required: true,
      trim: true
    }
  },
  maxStudents: {
    type: Number,
    required: true,
    min: 1
  },
  currentStudents: {
    type: Number,
    default: 0,
    min: 0
  },
  registrationDeadline: {
    type: Date,
    required: true
  },
  withdrawalDeadline: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  courseType: {
    type: String,
    enum: ['mandatory', 'elective', 'general'],
    default: 'elective'
  },
  yearLevel: {
    type: Number,
    required: true,
    min: 1,
    max: 6
  },
  semesterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CourseSchema.index({ courseCode: 1 });
CourseSchema.index({ semester: 1 });
CourseSchema.index({ teacher: 1 });
CourseSchema.index({ department: 1, major: 1 });
CourseSchema.index({ yearLevel: 1, semesterNumber: 1 });
CourseSchema.index({ 'schedule.dayOfWeek': 1, 'schedule.startTime': 1 });

// Virtual for available spots
CourseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.currentStudents;
});

// Virtual for full schedule string
CourseSchema.virtual('scheduleString').get(function() {
  const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return `${days[this.schedule.dayOfWeek]} ${this.schedule.startTime}-${this.schedule.endTime} (${this.schedule.room})`;
});

// Check if course is full
CourseSchema.methods.isFull = function() {
  return this.currentStudents >= this.maxStudents;
};

// Check if registration is open
CourseSchema.methods.isRegistrationOpen = function() {
  const now = new Date();
  return now <= this.registrationDeadline && this.isActive;
};

// Check if withdrawal is allowed
CourseSchema.methods.isWithdrawalAllowed = function() {
  const now = new Date();
  return now <= this.withdrawalDeadline && this.isActive;
};

// Validate that end time is after start time
CourseSchema.pre('save', function(next) {
  const startTime = this.schedule.startTime.split(':').map(Number);
  const endTime = this.schedule.endTime.split(':').map(Number);
  
  const startMinutes = startTime[0] * 60 + startTime[1];
  const endMinutes = endTime[0] * 60 + endTime[1];
  
  if (endMinutes <= startMinutes) {
    return next(new Error('End time must be after start time'));
  }
  
  next();
});

// Validate that withdrawal deadline is after registration deadline
CourseSchema.pre('save', function(next) {
  if (this.withdrawalDeadline <= this.registrationDeadline) {
    return next(new Error('Withdrawal deadline must be after registration deadline'));
  }
  next();
});

// Ensure virtual fields are serialized
CourseSchema.set('toJSON', {
  virtuals: true
});

module.exports = mongoose.model('Course', CourseSchema);
