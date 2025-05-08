import express from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Sample documents data (replace with database in production)
let documents = [
  {
    id: 1,
    title: 'Project Proposal',
    description: 'Initial project proposal document',
    type: 'pdf',
    size: '2.5MB',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-03-01T10:00:00Z',
    sharedWith: ['team1', 'team2'],
    category: 'proposals',
    status: 'active'
  },
  {
    id: 2,
    title: 'Meeting Minutes',
    description: 'Minutes from the last team meeting',
    type: 'docx',
    size: '1.2MB',
    uploadedBy: 'Jane Smith',
    uploadedAt: '2024-03-15T14:30:00Z',
    sharedWith: ['team1'],
    category: 'meetings',
    status: 'active'
  }
];

// Get all documents
router.get('/', (req, res) => {
  const { category, type, search } = req.query;
  let filteredDocuments = [...documents];

  if (category) {
    filteredDocuments = filteredDocuments.filter(doc => doc.category === category);
  }

  if (type) {
    filteredDocuments = filteredDocuments.filter(doc => doc.type === type);
  }

  if (search) {
    const searchLower = search.toLowerCase();
    filteredDocuments = filteredDocuments.filter(doc => 
      doc.title.toLowerCase().includes(searchLower) ||
      doc.description.toLowerCase().includes(searchLower)
    );
  }

  res.json(filteredDocuments);
});

// Get a specific document
router.get('/:id', (req, res) => {
  const document = documents.find(d => d.id === parseInt(req.params.id));
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }
  res.json(document);
});

// Upload a new document
router.post('/', upload.single('file'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sharedWith').isArray().withMessage('Shared with must be an array')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const newDocument = {
    id: documents.length + 1,
    title: req.body.title,
    description: req.body.description || '',
    type: path.extname(req.file.originalname).slice(1),
    size: (req.file.size / (1024 * 1024)).toFixed(2) + 'MB',
    uploadedBy: req.body.uploadedBy || 'Anonymous',
    uploadedAt: new Date().toISOString(),
    sharedWith: req.body.sharedWith || [],
    category: req.body.category,
    status: 'active',
    filePath: req.file.path
  };

  documents.push(newDocument);
  res.status(201).json(newDocument);
});

// Update document metadata
router.put('/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('sharedWith').isArray().withMessage('Shared with must be an array')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const documentIndex = documents.findIndex(d => d.id === parseInt(req.params.id));
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }

  documents[documentIndex] = {
    ...documents[documentIndex],
    ...req.body
  };

  res.json(documents[documentIndex]);
});

// Delete a document
router.delete('/:id', (req, res) => {
  const documentIndex = documents.findIndex(d => d.id === parseInt(req.params.id));
  if (documentIndex === -1) {
    return res.status(404).json({ message: 'Document not found' });
  }

  documents = documents.filter(d => d.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Download a document
router.get('/:id/download', (req, res) => {
  const document = documents.find(d => d.id === parseInt(req.params.id));
  if (!document) {
    return res.status(404).json({ message: 'Document not found' });
  }

  // In a real implementation, this would serve the actual file
  // For now, we'll just send a mock response
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', `attachment; filename=${document.title}.${document.type}`);
  res.send('Mock file content for document ' + document.id);
});

export default router; 