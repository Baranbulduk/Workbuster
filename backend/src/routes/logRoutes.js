import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample logs data (replace with database in production)
let logs = [
  {
    id: 1,
    candidateId: '681b3a24be109ba4ab18c55e',
    action: 'Profile updated',
    details: 'Updated contact information',
    timestamp: new Date('2024-03-15T09:00:00Z'),
    user: 'John Smith'
  },
  {
    id: 2,
    candidateId: '681b3a24be109ba4ab18c55e',
    action: 'Interview scheduled',
    details: 'Technical interview scheduled for March 20',
    timestamp: new Date('2024-03-15T10:30:00Z'),
    user: 'Jane Doe'
  },
  {
    id: 3,
    candidateId: '681b3a24be109ba4ab18c55e',
    action: 'Document uploaded',
    details: 'Resume updated',
    timestamp: new Date('2024-03-15T14:15:00Z'),
    user: 'John Smith'
  }
];

// Get logs for a specific candidate
router.get('/', (req, res) => {
  const { candidate } = req.query;
  if (!candidate) {
    return res.status(400).json({ message: 'Candidate ID is required' });
  }

  const candidateLogs = logs.filter(log => log.candidateId === candidate);
  res.json(candidateLogs);
});

// Create a new log entry
router.post('/', [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('action').notEmpty().withMessage('Action is required'),
  body('details').notEmpty().withMessage('Details are required'),
  body('user').notEmpty().withMessage('User is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newLog = {
    id: logs.length + 1,
    ...req.body,
    timestamp: new Date()
  };

  logs.push(newLog);
  res.status(201).json(newLog);
});

// Get a specific log entry
router.get('/:id', (req, res) => {
  const log = logs.find(l => l.id === parseInt(req.params.id));
  if (!log) {
    return res.status(404).json({ message: 'Log entry not found' });
  }
  res.json(log);
});

// Delete a log entry (typically not allowed in production, but included for completeness)
router.delete('/:id', (req, res) => {
  const logIndex = logs.findIndex(l => l.id === parseInt(req.params.id));
  if (logIndex === -1) {
    return res.status(404).json({ message: 'Log entry not found' });
  }

  logs = logs.filter(l => l.id !== parseInt(req.params.id));
  res.status(204).send();
});

export default router; 