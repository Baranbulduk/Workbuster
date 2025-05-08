import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample reports data (replace with database in production)
let reports = [
  {
    id: 1,
    title: 'Monthly Project Progress Report',
    description: 'Overview of project milestones and achievements',
    type: 'monthly',
    date: '2024-03-01',
    content: 'Project is progressing well with all milestones met on time.',
    author: 'John Doe',
    status: 'published'
  },
  {
    id: 2,
    title: 'Quarterly Financial Review',
    description: 'Financial performance analysis for Q1 2024',
    type: 'quarterly',
    date: '2024-03-15',
    content: 'Revenue increased by 15% compared to previous quarter.',
    author: 'Jane Smith',
    status: 'review'
  }
];

// Get all reports
router.get('/', (req, res) => {
  const { startDate, endDate } = req.query;
  let filteredReports = [...reports];

  if (startDate && endDate) {
    filteredReports = filteredReports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
    });
  }

  res.json(filteredReports);
});

// Get a specific report
router.get('/:id', (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }
  res.json(report);
});

// Create a new report
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['monthly', 'quarterly', 'annual', 'custom']).withMessage('Invalid report type'),
  body('date').isDate().withMessage('Valid date is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('status').isIn(['draft', 'review', 'approved', 'published']).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newReport = {
    id: reports.length + 1,
    ...req.body
  };

  reports.push(newReport);
  res.status(201).json(newReport);
});

// Update a report
router.put('/:id', [
  body('title').notEmpty().withMessage('Title is required'),
  body('type').isIn(['monthly', 'quarterly', 'annual', 'custom']).withMessage('Invalid report type'),
  body('date').isDate().withMessage('Valid date is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('status').isIn(['draft', 'review', 'approved', 'published']).withMessage('Invalid status')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const reportIndex = reports.findIndex(r => r.id === parseInt(req.params.id));
  if (reportIndex === -1) {
    return res.status(404).json({ message: 'Report not found' });
  }

  reports[reportIndex] = {
    ...reports[reportIndex],
    ...req.body
  };

  res.json(reports[reportIndex]);
});

// Delete a report
router.delete('/:id', (req, res) => {
  const reportIndex = reports.findIndex(r => r.id === parseInt(req.params.id));
  if (reportIndex === -1) {
    return res.status(404).json({ message: 'Report not found' });
  }

  reports = reports.filter(r => r.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Download report (mock implementation)
router.get('/:id/download', (req, res) => {
  const report = reports.find(r => r.id === parseInt(req.params.id));
  if (!report) {
    return res.status(404).json({ message: 'Report not found' });
  }

  // In a real implementation, this would generate a PDF or other document format
  // For now, we'll just send a text response
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=report-${report.id}.pdf`);
  res.send('Mock PDF content for report ' + report.id);
});

export default router; 