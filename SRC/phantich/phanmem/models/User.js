import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcrypt';
import sequelize from '../db/index.js';

class User extends Model {
	async comparePassword(candidate) {
		return bcrypt.compare(candidate, this.password);
	}
	get fullName() {
		return `${this.firstName} ${this.lastName}`.trim();
	}
}

User.init(
	{
		id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
		firstName: { type: DataTypes.STRING, allowNull: false },
		lastName: { type: DataTypes.STRING, allowNull: false },
		email: { type: DataTypes.STRING, allowNull: false, unique: true },
		password: { type: DataTypes.STRING, allowNull: false },
		role: { type: DataTypes.ENUM('student', 'teacher', 'admin'), defaultValue: 'student' },
		studentId: { type: DataTypes.STRING },
		department: { type: DataTypes.STRING },
		gpa: { type: DataTypes.FLOAT, defaultValue: 0 },
		avatarUrl: { type: DataTypes.STRING },
	},
	{
		sequelize,
		modelName: 'User',
		timestamps: true,
		hooks: {
			beforeCreate: async (user) => {
				if (user.password) user.password = await bcrypt.hash(user.password, 10);
			},
			beforeUpdate: async (user) => {
				if (user.changed('password')) user.password = await bcrypt.hash(user.password, 10);
			},
		},
	}
);

export default User;
