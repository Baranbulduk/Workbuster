import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample notes data (replace with database in production)
let notes = [
  {
    id: 1,
    candidateId: '681b3a24be109ba4ab18c55e',
    content: 'Initial interview went well. Strong technical skills.',
    type: 'interview',
    createdAt: new Date('2024-03-15T10:00:00Z'),
    createdBy: 'John Smith'
  },
  {
    id: 2,
    candidateId: '681b3a24be109ba4ab18c55e',
    content: 'Reference check completed. All positive feedback.',
    type: 'reference',
    createdAt: new Date('2024-03-16T14:30:00Z'),
    createdBy: 'Jane Doe'
  }
];

// Get notes for a specific candidate
router.get('/', (req, res) => {
  const { candidate } = req.query;
  if (!candidate) {
    return res.status(400).json({ message: 'Candidate ID is required' });
  }

  const candidateNotes = notes.filter(note => note.candidateId === candidate);
  res.json(candidateNotes);
});

// Create a new note
router.post('/', [
  body('candidateId').notEmpty().withMessage('Candidate ID is required'),
  body('content').notEmpty().withMessage('Note content is required'),
  body('type').isIn(['interview', 'reference', 'general', 'feedback']).withMessage('Invalid note type'),
  body('createdBy').notEmpty().withMessage('Creator name is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newNote = {
    id: notes.length + 1,
    ...req.body,
    createdAt: new Date()
  };

  notes.push(newNote);
  res.status(201).json(newNote);
});

// Update a note
router.put('/:id', [
  body('content').optional().notEmpty().withMessage('Note content cannot be empty'),
  body('type').optional().isIn(['interview', 'reference', 'general', 'feedback']).withMessage('Invalid note type')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  notes[noteIndex] = {
    ...notes[noteIndex],
    ...req.body,
    updatedAt: new Date()
  };

  res.json(notes[noteIndex]);
});

// Delete a note
router.delete('/:id', (req, res) => {
  const noteIndex = notes.findIndex(n => n.id === parseInt(req.params.id));
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  notes = notes.filter(n => n.id !== parseInt(req.params.id));
  res.status(204).send();
});

export default router; 