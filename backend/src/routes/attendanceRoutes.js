import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample attendance data (replace with database in production)
let attendanceRecords = [
  {
    id: 1,
    employeeId: 'EMP001',
    employeeName: 'John Doe',
    date: new Date('2024-03-20'),
    checkIn: new Date('2024-03-20T09:00:00Z'),
    checkOut: new Date('2024-03-20T17:00:00Z'),
    status: 'present',
    workHours: 8,
    notes: 'Regular work day'
  },
  {
    id: 2,
    employeeId: 'EMP002',
    employeeName: 'Jane Smith',
    date: new Date('2024-03-20'),
    checkIn: new Date('2024-03-20T09:15:00Z'),
    checkOut: new Date('2024-03-20T17:30:00Z'),
    status: 'present',
    workHours: 8.25,
    notes: 'Stayed late for project deadline'
  }
];

// Get all attendance records
router.get('/', (req, res) => {
  res.json(attendanceRecords);
});

// Get attendance records by date range
router.get('/range', (req, res) => {
  const { startDate, endDate } = req.query;
  const filteredRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= new Date(startDate) && recordDate <= new Date(endDate);
  });
  res.json(filteredRecords);
});

// Get attendance record by ID
router.get('/:id', (req, res) => {
  const record = attendanceRecords.find(r => r.id === parseInt(req.params.id));
  if (!record) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }
  res.json(record);
});

// Create new attendance record
router.post('/', [
  body('employeeId').notEmpty(),
  body('employeeName').notEmpty(),
  body('date').isISO8601(),
  body('checkIn').isISO8601(),
  body('checkOut').isISO8601(),
  body('status').isIn(['present', 'absent', 'late', 'half-day']),
  body('workHours').isNumeric(),
  body('notes').optional().isString()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const newRecord = {
    id: attendanceRecords.length + 1,
    ...req.body
  };
  attendanceRecords.push(newRecord);
  res.status(201).json(newRecord);
});

// Update attendance record
router.put('/:id', [
  body('checkIn').optional().isISO8601(),
  body('checkOut').optional().isISO8601(),
  body('status').optional().isIn(['present', 'absent', 'late', 'half-day']),
  body('workHours').optional().isNumeric(),
  body('notes').optional().isString()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const index = attendanceRecords.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }

  attendanceRecords[index] = { ...attendanceRecords[index], ...req.body };
  res.json(attendanceRecords[index]);
});

// Delete attendance record
router.delete('/:id', (req, res) => {
  const index = attendanceRecords.findIndex(r => r.id === parseInt(req.params.id));
  if (index === -1) {
    return res.status(404).json({ message: 'Attendance record not found' });
  }
  attendanceRecords.splice(index, 1);
  res.status(204).send();
});

export default router; 