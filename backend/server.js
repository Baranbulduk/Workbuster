import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Admin API' });
});

// Import routes
import candidate from './src/routes/candidate.js';
import client from './src/routes/client.js';
import statistics from './src/routes/statistics.js';
import settings from './src/routes/settings.js';
import onboarding from './src/routes/onboarding.js';
import note from './src/routes/note.js';
import log from './src/routes/log.js';
import authRoutes from './src/routes/auth.js';
import employeeRoutes from './src/routes/employees.js';

// Routes
app.use('/api/candidates', candidate);
app.use('/api/clients', client);
app.use('/api/statistics', statistics);
app.use('/api/settings', settings);
app.use('/api/onboarding', onboarding);
app.use('/api/notes', note);
app.use('/api/logs', log);
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/rexett', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => {
    console.log('Connected to MongoDB');

    // Start server only after successful database connection
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }); 