import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    enum: ['IT', 'HR', 'Finance', 'Marketing', 'Operations', 'Sales'],
    default: 'IT'
  },
  position: {
    type: String,
    default: '-'
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.role === 'employee';
    }
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  salary: {
    type: Number,
    default: 0
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  documents: [{
    type: {
      type: String,
      enum: ['Resume', 'Contract', 'ID', 'Other']
    },
    url: String,
    uploadedAt: Date
  }],
  skills: [String],
  notes: String,
  onboardingStep: {
    type: Number,
    default: 1
  },
  welcomeSent: Date,
  formCompleted: Date,
  tasks: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema); 