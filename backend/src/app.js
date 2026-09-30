const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const authRoutes = require('./modules/auth/auth.routes');
const patientsRoutes = require('./modules/patients/patients.routes');
const appointmentsRoutes = require('./modules/appointments/appointments.routes');
const usersRoutes = require('./modules/users/users.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');
const errorHandler = require('./middlewares/errorHandler');
const AppError = require('./utils/AppError');

const app = express();

// Limite les tentatives de connexion (anti brute-force)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Trop de tentatives de connexion, réessayez dans 15 minutes' },
});

app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin.split(',').map((origin) => origin.trim()),
  })
);
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth/login', loginLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientsRoutes);
app.use('/api/appointments', appointmentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res, next) => {
  next(new AppError(`Impossible de trouver ${req.originalUrl} sur ce serveur`, 404));
});

app.use(errorHandler);

module.exports = app;