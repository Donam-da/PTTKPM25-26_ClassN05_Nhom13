import { DataTypes, Model } from 'sequelize';
import sequelize from '../db/index.js';

class Semester extends Model {}

Semester.init(
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
		name: { type: DataTypes.STRING, allowNull: false },
		year: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
		startDate: { type: DataTypes.DATE, allowNull: false },
		endDate: { type: DataTypes.DATE, allowNull: false },
		isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
	},
	{ sequelize, modelName: 'Semester', timestamps: true }
);

export default Semester;
