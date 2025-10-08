import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/index.js';

class Course extends Model {}

Course.init(
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
		code: { type: DataTypes.STRING, allowNull: false, unique: true },
		title: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.TEXT },
		credits: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
		teacherId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true },
	},
	{ sequelize, modelName: 'Course', timestamps: true }
);

export default Course;
