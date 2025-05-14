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

// Bulk import employees
router.post('/bulk', async (req, res) => {
  try {
    const { employees } = req.body;
    
    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No employees data provided' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const emp of employees) {
      try {
        // Check if employee with this email already exists
        const existingEmployee = await Employee.findOne({ email: emp.email });
        if (existingEmployee) {
          results.failed.push({
            email: emp.email,
            reason: 'Email already exists'
          });
          continue;
        }

        // Generate employee ID
        const lastEmployee = await Employee.findOne().sort({ employeeId: -1 });
        const lastId = lastEmployee ? parseInt(lastEmployee.employeeId.slice(1)) : 0;
        const newId = `E${(lastId + 1).toString().padStart(4, '0')}`;

        // Generate random password
        const password = generatePassword(8);

        // Create new employee
        const newEmployee = new Employee({
          employeeId: newId,
          password,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          department: emp.department || 'IT',
          position: emp.position || 'Employee',
          status: emp.status || 'Active',
          hireDate: emp.hireDate || new Date(),
          salary: emp.salary || 0,
          address: {
            street: emp.address?.street || '',
            city: emp.address?.city || '',
            state: emp.address?.state || '',
            zipCode: emp.address?.zipCode || '',
            country: emp.address?.country || ''
          }
        });

        await newEmployee.save();

        // Send credentials email
        await sendCredentialsEmail(emp.email, newId, password);

        results.success.push({
          employeeId: newId,
          email: emp.email
        });
      } catch (error) {
        console.error(`Error processing employee ${emp.email}:`, error);
        results.failed.push({
          email: emp.email,
          reason: error.message
        });
      }
    }

    res.json({
      success: true,
      results,
      message: `Successfully imported ${results.success.length} employees. ${results.failed.length} failed.`
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import employees',
      error: error.message
    });
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

// Import employees from CSV
router.post('/import', async (req, res) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No employee data provided' 
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const emp of items) {
      try {
        // Check if employee with this email already exists
        const existingEmployee = await Employee.findOne({ email: emp.email });
        if (existingEmployee) {
          results.failed.push({
            email: emp.email,
            reason: 'Email already exists'
          });
          continue;
        }

        // Generate employee ID
        const employeeId = await generateEmployeeId();

        // Generate random password
        const plainPassword = generatePassword(8);
        const password = await bcrypt.hash(plainPassword, 10);

        // Create new employee
        const newEmployee = new Employee({
          employeeId,
          password,
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          department: emp.department || 'IT',
          position: emp.position || 'Employee',
          status: emp.status || 'Active',
          hireDate: emp.hireDate || new Date(),
          salary: emp.salary || 0,
          address: {
            street: emp.street || '',
            city: emp.city || '',
            state: emp.state || '',
            zipCode: emp.zipCode || '',
            country: emp.country || ''
          },
          skills: emp.skills ? emp.skills.split(',').map(skill => skill.trim()) : []
        });

        const savedEmployee = await newEmployee.save();

        // Send credentials email
        try {
          await sendCredentialsEmail(emp.email, employeeId, plainPassword);
        } catch (emailError) {
          console.error(`Error sending credentials email to ${emp.email}:`, emailError);
          // Don't fail if email sending fails
        }

        results.success.push(savedEmployee);
      } catch (error) {
        console.error(`Error processing employee ${emp.email || 'unknown'}:`, error);
        results.failed.push({
          item: emp,
          error: error.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} employees. ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error importing employees:', error);
    return res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

export default router; 