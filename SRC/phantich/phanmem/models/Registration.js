import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/index.js';

class Registration extends Model {}

Registration.init(
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
		studentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
		courseId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
		semesterId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
		status: { type: DataTypes.ENUM('pending', 'approved', 'dropped'), defaultValue: 'pending' },
		score: { type: DataTypes.FLOAT },
		grade: { type: DataTypes.STRING },
	},
	{ sequelize, modelName: 'Registration', timestamps: true, indexes: [{ unique: true, fields: ['studentId', 'courseId', 'semesterId'] }] }
);

export default Registration;
