import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample schedule data (replace with database in production)
let schedules = [
  {
    id: 1,
    title: 'Team Meeting',
    description: 'Weekly team sync-up',
    startTime: new Date('2024-03-20T10:00:00Z'),
    endTime: new Date('2024-03-20T11:00:00Z'),
    type: 'meeting',
    participants: ['John Doe', 'Jane Smith'],
    location: 'Conference Room A',
    status: 'scheduled'
  },
  {
    id: 2,
    title: 'Client Presentation',
    description: 'Project progress presentation',
    startTime: new Date('2024-03-21T14:00:00Z'),
    endTime: new Date('2024-03-21T15:30:00Z'),
    type: 'presentation',
    participants: ['John Doe', 'Client Team'],
    location: 'Virtual Meeting',
    status: 'scheduled'
  }
];

// Get all schedules
router.get('/', (req, res) => {
  res.json(schedules);
});

// Get schedule by ID
router.get('/:id', (req, res) => {
  const schedule = schedules.find(s => s.id === parseInt(req.params.id));
  if (!schedule) {
    return res.status(404).json({ message: 'Schedule not found' });
  }
  res.json(schedule);
});

// Create new schedule
router.post('/', [
  body('title').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('type').notEmpty(),
  body('participants').isArray()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newSchedule = {
    id: schedules.length + 1,
    ...req.body,
    status: 'scheduled'
  };
  schedules.push(newSchedule);
  res.status(201).json(newSchedule);
});

// Update schedule
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('type').optional().notEmpty(),
  body('participants').optional().isArray()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const index = schedules.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Schedule not found' });
  }

  schedules[index] = { ...schedules[index], ...req.body };
  res.json(schedules[index]);
});

// Delete schedule
router.delete('/:id', (req, res) => {
  const index = schedules.findIndex(s => s.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Schedule not found' });
  }
  schedules.splice(index, 1);
  res.status(204).send();
});

export default router; 