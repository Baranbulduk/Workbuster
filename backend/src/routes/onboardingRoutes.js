import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample onboarding data (replace with database in production)
let onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to the Team',
    description: 'Introduction to company culture and values',
    type: 'welcome',
    status: 'completed',
    completedAt: '2024-03-01T10:00:00Z',
    assignedTo: 'John Doe',
    documents: [
      {
        name: 'Company Handbook',
        type: 'pdf',
        required: true
      },
      {
        name: 'Code of Conduct',
        type: 'pdf',
        required: true
      }
    ]
  },
  {
    id: 2,
    title: 'System Access Setup',
    description: 'Setting up access to company systems and tools',
    type: 'technical',
    status: 'in_progress',
    startedAt: '2024-03-02T09:00:00Z',
    assignedTo: 'IT Support',
    documents: [
      {
        name: 'System Access Form',
        type: 'docx',
        required: true
      }
    ]
  }
];

// Get all onboarding steps
router.get('/', (req, res) => {
  const { status, type } = req.query;
  let filteredSteps = [...onboardingSteps];

  if (status) {
    filteredSteps = filteredSteps.filter(step => step.status === status);
  }

  if (type) {
    filteredSteps = filteredSteps.filter(step => step.type === type);
  }

  res.json(filteredSteps);
});

// Get a specific onboarding step
router.get('/:id', (req, res) => {
  const step = onboardingSteps.find(s => s.id === parseInt(req.params.id));
  if (!step) {
    return res.status(404).json({ message: 'Onboarding step not found' });
  }
  res.json(step);
});

// Create a new onboarding step
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['welcome', 'technical', 'training', 'documentation']).withMessage('Invalid step type'),
  body('assignedTo').notEmpty().withMessage('Assigned to is required')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newStep = {
    id: onboardingSteps.length + 1,
    ...req.body,
    status: 'pending',
    documents: req.body.documents || []
  };

  onboardingSteps.push(newStep);
  res.status(201).json(newStep);
});

// Update an onboarding step
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('type').optional().isIn(['welcome', 'technical', 'training', 'documentation']).withMessage('Invalid step type'),
  body('status').optional().isIn(['pending', 'in_progress', 'completed']).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const stepIndex = onboardingSteps.findIndex(s => s.id === parseInt(req.params.id));
  if (stepIndex === -1) {
    return res.status(404).json({ message: 'Onboarding step not found' });
  }

  const updatedStep = {
    ...onboardingSteps[stepIndex],
    ...req.body
  };

  if (req.body.status === 'completed' && !updatedStep.completedAt) {
    updatedStep.completedAt = new Date().toISOString();
  }

  if (req.body.status === 'in_progress' && !updatedStep.startedAt) {
    updatedStep.startedAt = new Date().toISOString();
  }

  onboardingSteps[stepIndex] = updatedStep;
  res.json(updatedStep);
});

// Delete an onboarding step
router.delete('/:id', (req, res) => {
  const stepIndex = onboardingSteps.findIndex(s => s.id === parseInt(req.params.id));
  if (stepIndex === -1) {
    return res.status(404).json({ message: 'Onboarding step not found' });
  }

  onboardingSteps = onboardingSteps.filter(s => s.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Mark a document as completed
router.post('/:id/documents/:documentName/complete', (req, res) => {
  const step = onboardingSteps.find(s => s.id === parseInt(req.params.id));
  if (!step) {
    return res.status(404).json({ message: 'Onboarding step not found' });
  }

  const document = step.documents.find(d => d.name === req.params.documentName);
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  document.completed = true;
  document.completedAt = new Date().toISOString();

  res.json(document);
});

export default router; 