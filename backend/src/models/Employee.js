import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
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
    type: String
  },
  position: {
    type: String,
    required: true
  },
  department: {
    type: String,
    default: 'IT'
  },
  status: {
    type: String,
    enum: ['active', 'on-leave', 'terminated'],
    default: 'active'
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  onboardingStep: {
    type: Number,
    default: 1
  },
  welcomeSent: {
    type: Date
  },
  formCompleted: {
    type: Date
  },
  tasks: {
    type: Number,
    default: 0
  },
  forms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OnboardingForm'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Auto-generate employeeId if not provided
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const lastEmployee = await this.constructor.findOne().sort({ createdAt: -1 });
    let nextNum = 1;
    if (lastEmployee && lastEmployee.employeeId && /^EM\d+$/.test(lastEmployee.employeeId)) {
      nextNum = parseInt(lastEmployee.employeeId.replace('EM', '')) + 1;
    }
    this.employeeId = `EM${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee; 