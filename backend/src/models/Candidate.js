const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phone: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    required: true
  },
  skills: {
    type: String,
    required: true
  },
  education: {
    type: String,
    required: true
  },
  availability: {
    type: String,
    required: true
  },
  expectedSalary: {
    type: String,
    required: true
  },
  workPreference: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  portfolio: String,
  linkedin: String,
  github: String,
  personId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true,
  collection: 'Candidate'
});

module.exports = mongoose.model('Candidate', candidateSchema); 