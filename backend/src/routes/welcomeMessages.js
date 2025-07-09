import express from 'express';
import {
  getAllWelcomeMessages,
  createWelcomeMessage,
  updateWelcomeMessage,
  deleteWelcomeMessage,
  reorderWelcomeMessages,
  sendWelcomeMessages
} from '../controllers/welcomeMessagesController.js';

const router = express.Router();

router.get('/', getAllWelcomeMessages);
router.post('/', createWelcomeMessage);
router.post('/send', sendWelcomeMessages);
router.put('/reorder/all', reorderWelcomeMessages);
router.put('/:id', updateWelcomeMessage);
router.delete('/:id', deleteWelcomeMessage);

export default router; 