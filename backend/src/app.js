import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import employeeRoutes from './routes/employees.js';
import onboardingRoutes from './routes/onboardingRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/onboarding', onboardingRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Server error', 
    error: err.message,
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app; 