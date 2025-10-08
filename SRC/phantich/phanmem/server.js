import dotenv from 'dotenv';
import express from 'express';
import sequelize from './db/index.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import courseRoutes from './routes/courses.js';
import registrationRoutes from './routes/registrations.js';
import semesterRoutes from './routes/semesters.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(helmet());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
res.json({ status: 'ok' });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/semesters', semesterRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (err) {
		console.error('Failed to start server', err);
		process.exit(1);
	}
}

start();
