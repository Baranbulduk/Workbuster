import mongoose from 'mongoose';

const recipientSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  completedAt: {
    type: Date,
    default: null
  },
  completedFields: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  }
});

const fieldSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  required: {
    type: Boolean,
    default: false
  },
  options: {
    type: [String],
    default: undefined
  }
});

const onboardingFormSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  fields: [fieldSchema],
  recipients: [recipientSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the 'updatedAt' field on save
onboardingFormSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const OnboardingForm = mongoose.model('OnboardingForm', onboardingFormSchema);

export default OnboardingForm; 