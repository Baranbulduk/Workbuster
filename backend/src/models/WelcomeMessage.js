import mongoose from 'mongoose';

const welcomeMessageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
  order: { type: Number, required: true },
  locked: { type: Boolean, default: false },
}, { timestamps: true });

const WelcomeMessage = mongoose.model('WelcomeMessage', welcomeMessageSchema);
export default WelcomeMessage; 