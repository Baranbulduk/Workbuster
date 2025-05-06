require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const candidateRoutes = require('./routes/candidateRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!' });
});

// Routes
app.use('/api/candidates', candidateRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoCreate: true, // Enable automatic collection creation
  autoIndex: true   // Enable automatic index creation
})
.then(() => {
  console.log('Connected to MongoDB');
  // Start server only after successful database connection
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
})
.catch(err => {
  console.error('Could not connect to MongoDB:', err);
  process.exit(1); // Exit if cannot connect to database
}); 