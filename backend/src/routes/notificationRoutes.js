import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample notifications data (replace with database in production)
let notifications = [
  {
    id: 1,
    title: 'New Candidate Application',
    message: 'John Doe has applied for the Senior Developer position',
    type: 'candidate',
    isRead: false,
    createdAt: new Date('2024-03-15T10:00:00Z')
  },
  {
    id: 2,
    title: 'Project Update',
    message: 'Project "Website Redesign" has been updated',
    type: 'project',
    isRead: true,
    createdAt: new Date('2024-03-14T15:30:00Z')
  }
];

// Get all notifications
router.get('/', (req, res) => {
  res.json(notifications);
});

// Mark notification as read
router.patch('/:id/read', (req, res) => {
  const notification = notifications.find(n => n.id === parseInt(req.params.id));
  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notification.isRead = true;
  res.json(notification);
});

// Mark all notifications as read
router.patch('/read-all', (req, res) => {
  notifications = notifications.map(n => ({ ...n, isRead: true }));
  res.json(notifications);
});

// Delete notification
router.delete('/:id', (req, res) => {
  const index = notifications.findIndex(n => n.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Notification not found' });
  }
  notifications.splice(index, 1);
  res.status(204).send();
});

export default router; 