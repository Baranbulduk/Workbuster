import mongoose from 'mongoose';

const missionSchema = new mongoose.Schema({
  missionName: {
    type: String,
    required: true
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeamMember',
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['not-started', 'in-progress', 'completed', 'blocked'],
    default: 'not-started'
  },
  description: {
    type: String,
    required: true
  },
  deliverables: [{
    type: String
  }]
}, {
  timestamps: true
});

const Mission = mongoose.model('Mission', missionSchema);

export default Mission; 