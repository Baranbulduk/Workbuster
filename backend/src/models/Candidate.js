import mongoose from 'mongoose';

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
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  skills: [{
    type: String
  }],
  experience: {
    type: Number,
    required: true
  },
  education: {
    degree: String,
    field: String,
    institution: String,
    graduationYear: Number
  },
  currentRole: String,
  expectedSalary: Number,
  noticePeriod: Number,
  availability: {
    type: String,
    enum: ['immediate', '1-week', '2-weeks', '1-month', 'more-than-1-month'],
    default: '2-weeks'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'hired'],
    default: 'active'
  },
  notes: String,
  resume: String, // URL or path to resume file
  linkedIn: String,
  portfolio: String,
  linkedin: String,
  github: String,
  personId: {
    type: String,
    required: true,
    unique: true
  }
}, {
  timestamps: true
});

const Candidate = mongoose.model('Candidate', candidateSchema);

export default Candidate; 