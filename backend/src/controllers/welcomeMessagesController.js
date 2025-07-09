import WelcomeMessage from '../models/WelcomeMessage.js';

export const getAllWelcomeMessages = async (req, res) => {
  try {
    const messages = await WelcomeMessage.find().sort({ order: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createWelcomeMessage = async (req, res) => {
  try {
    const { title, content, isDefault, locked } = req.body;
    const count = await WelcomeMessage.countDocuments();
    const message = new WelcomeMessage({
      title,
      content,
      isDefault: !!isDefault,
      order: count,
      locked: !!locked,
    });
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateWelcomeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, locked } = req.body;
    const message = await WelcomeMessage.findById(id);
    if (!message) return res.status(404).json({ error: 'Not found' });
    if (typeof title === 'string') message.title = title;
    if (typeof content === 'string') message.content = content;
    if (typeof locked === 'boolean') message.locked = locked;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteWelcomeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await WelcomeMessage.findById(id);
    if (!message) return res.status(404).json({ error: 'Not found' });
    if (message.isDefault) return res.status(400).json({ error: 'Cannot delete default message' });
    await message.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const reorderWelcomeMessages = async (req, res) => {
  try {
    const { order } = req.body; // [{id, order}]
    if (!Array.isArray(order)) return res.status(400).json({ error: 'Invalid order array' });
    for (const { id, order: newOrder } of order) {
      await WelcomeMessage.findByIdAndUpdate(id, { order: newOrder });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const sendWelcomeMessages = async (req, res) => {
  try {
    const { recipients, messageIds } = req.body;
    
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: 'Recipients are required' });
    }

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ error: 'Message IDs are required' });
    }

    // Fetch the welcome messages
    const messages = await WelcomeMessage.find({ _id: { $in: messageIds } }).sort({ order: 1 });
    
    if (messages.length === 0) {
      return res.status(404).json({ error: 'No messages found' });
    }

    // For now, just return success without sending emails
    // TODO: Implement email sending when email configuration is ready
    res.json({
      success: true,
      message: `Successfully prepared ${messages.length} welcome messages for ${recipients.length} recipients`,
      results: {
        successful: recipients.map(r => ({ email: r.email, success: true })),
        failed: []
      }
    });

  } catch (err) {
    console.error('Error sending welcome messages:', err);
    res.status(500).json({ error: err.message });
  }
}; 