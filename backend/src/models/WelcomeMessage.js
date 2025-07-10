import mongoose from 'mongoose';

const WelcomeMessageSchema = new mongoose.Schema({
  recipientEmail: { 
    type: String, 
    required: true,
    index: true // Add index for faster queries
  },
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  sentAt: { 
    type: Date, 
    default: Date.now 
  },
  token: {
    type: String,
    required: true,
    index: true
  },
  messageType: {
    type: String,
    default: 'welcome-message'
  }
});

export default mongoose.model('WelcomeMessage', WelcomeMessageSchema); 