import express from 'express';
import User from '../../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get all employees
router.get('/', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single employee
router.get('/:id', async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
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
  const last = await User.findOne({ role: 'employee' }).sort({ createdAt: -1 });
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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
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
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: 'Employee with this email already exists.' });
    }
    const employeeId = await generateEmployeeId();
    const passwordPlain = generatePassword();
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);
    const newEmployee = new User({
      employeeId,
      password: hashedPassword,
      firstName,
      lastName,
      email,
      phone,
      department: department || 'IT',
      position: position || '-',
      role: 'employee',
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
        const existingEmployee = await User.findOne({ email: emp.email });
        if (existingEmployee) {
          results.failed.push({
            email: emp.email,
            reason: 'Email already exists'
          });
          continue;
        }

        // Generate employee ID
        const employeeId = await generateEmployeeId();

        // Generate random password and hash it
        const passwordPlain = generatePassword(8);
        const hashedPassword = await bcrypt.hash(passwordPlain, 10);

        // Create new employee
        const newEmployee = new User({
          employeeId,
          password: hashedPassword,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: emp.phone || '',
          department: emp.department || 'IT',
          position: emp.position || 'Employee',
          role: 'employee',
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
        await sendCredentialsEmail(emp.email, employeeId, passwordPlain);

        results.success.push({
          employeeId,
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
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
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
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
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
        const existingEmployee = await User.findOne({ email: emp.email });
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
        const hashedPassword = await bcrypt.hash(plainPassword, 10);

        // Create new employee
        const newEmployee = new User({
          employeeId,
          password: hashedPassword,
          firstName: emp.firstName || '',
          lastName: emp.lastName || '',
          email: emp.email || '',
          phone: emp.phone || '',
          department: emp.department || 'IT',
          position: emp.position || 'Employee',
          role: 'employee',
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

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log('User found:', {
      id: user._id,
      email: user.email,
      role: user.role
    });

    // Check if the user is an admin (they should use the admin login instead)
    if (user.role === 'admin') {
      console.log('Admin user attempting to use employee login');
      return res.status(403).json({ message: 'Please use the admin login page' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Create JWT token
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    // Return user data (excluding password) and token
    const userData = user.toObject();
    delete userData.password;

    console.log('Login successful for user:', email);
    res.json({
      success: true,
      token,
      employee: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Verify employee token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(401).json({ valid: false, message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.user.id);

      if (!user || user.role !== 'employee') {
        return res.status(401).json({ valid: false, message: 'Invalid token' });
      }

      // Check if token is about to expire (less than 1 day remaining)
      const tokenExp = decoded.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      const timeUntilExpiry = tokenExp - now;
      const oneDay = 24 * 60 * 60 * 1000;

      if (timeUntilExpiry < oneDay) {
        // Generate new token
        const newToken = jwt.sign(
          { user: { id: user._id, role: user.role } },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '7d' }
        );
        
        return res.json({ 
          valid: true, 
          user: { id: user._id, role: user.role },
          token: newToken,
          tokenRefreshed: true
        });
      }

      res.json({ valid: true, user: { id: user._id, role: user.role } });
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          valid: false, 
          message: 'Token expired',
          expired: true
        });
      }
      console.error('Token verification error:', error);
      res.status(401).json({ valid: false, message: 'Invalid token' });
    }
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

export default router; 