import express from 'express';
import Employee from '../../models/Employee.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper: Generate next employeeId (EM0001, EM0002, ...)
async function generateEmployeeId() {
  const last = await Employee.findOne().sort({ createdAt: -1 });
  let nextNum = 1;
  if (last && last.employeeId && /^EM\d+$/.test(last.employeeId)) {
    nextNum = parseInt(last.employeeId.replace('EM', '')) + 1;
  }
  return `EM${String(nextNum).padStart(4, '0')}`;
}

// Helper: Generate random password
function generatePassword(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let pass = '';
  for (let i = 0; i < length; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// Helper: Send email
async function sendCredentialsEmail(to, employeeId, password) {
  // Configure your SMTP here
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your SMTP
    auth: {
      user: 'rexettit@gmail.com',
      pass: 'prmursgwotixwilt'
    }
  });
  const mailOptions = {
    from: 'rexettit@gmail.com',
    to,
    subject: 'Your Employee Account Credentials',
    text: `Welcome!\n\nYour Employee ID: ${employeeId}\nPassword: ${password}\n\nPlease log in and change your password after first login.`
  };
  await transporter.sendMail(mailOptions);
}

// POST /api/employees
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, department, position, address, city, country, postalCode } = req.body;
    // Check if email already exists
    if (await Employee.findOne({ email })) {
      return res.status(400).json({ message: 'Employee with this email already exists.' });
    }
    const employeeId = await generateEmployeeId();
    const passwordPlain = generatePassword();
    const password = await bcrypt.hash(passwordPlain, 10);
    const newEmployee = new Employee({
      employeeId,
      password,
      firstName,
      lastName,
      email,
      phone,
      department: department || 'IT',
      position: position || '-',
      address: {
        street: address || '',
        city: city || '',
        zipCode: postalCode || '',
        country: country || ''
      },
      status: 'Active',
      hireDate: new Date(),
      salary: 0
    });
    await newEmployee.save();
    await sendCredentialsEmail(email, employeeId, passwordPlain);
    res.status(201).json({ message: 'Employee created and credentials sent via email.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating employee.' });
  }
});

// Update employee
router.put('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    Object.assign(employee, req.body);
    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    await employee.deleteOne();
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 