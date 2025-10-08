import sequelize from '../db/index.js';
import User from './User.js';
import Course from './Course.js';
import Semester from './Semester.js';
import Registration from './Registration.js';

// Associations
User.hasMany(Course, { foreignKey: 'teacherId', as: 'teachingCourses' });
Course.belongsTo(User, { foreignKey: 'teacherId', as: 'teacher' });

User.hasMany(Registration, { foreignKey: 'studentId', as: 'registrations' });
Registration.belongsTo(User, { foreignKey: 'studentId', as: 'student' });

Course.hasMany(Registration, { foreignKey: 'courseId', as: 'registrations' });
Registration.belongsTo(Course, { foreignKey: 'courseId', as: 'course' });

Semester.hasMany(Registration, { foreignKey: 'semesterId', as: 'registrations' });
Registration.belongsTo(Semester, { foreignKey: 'semesterId', as: 'semester' });

export { sequelize, User, Course, Semester, Registration };


