import express from 'express';
import { requireAdmin, requireEmployee, getAdminId } from '../middleware/rolePermissions.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import Employee from '../models/Employee.js';

const router = express.Router();

// Get all employees (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const employees = await Employee.find({ createdBy: adminId });

    // Format the response
    const formattedEmployees = employees.map(emp => ({
      ...emp.toObject(),
      employeeId: emp.employeeId || `EM${String(emp._id).slice(-4)}`,
      fullName: `${emp.firstName} ${emp.lastName}`,
      name: `${emp.firstName} ${emp.lastName}`
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get employees for employee role
router.get('/colleagues', requireEmployee, async (req, res) => {
  try {
    const employee = req.user;

    if (!employee.createdBy) {
      console.log('Employee has no admin association:', employee._id);
      return res.status(403).json({ message: 'Employee not associated with any admin.' });
    }

    // Get employees created by the same admin
    const employees = await Employee.find({ createdBy: employee.createdBy });
    
    // Format the response
    const formattedEmployees = employees.map(emp => ({
      ...emp.toObject(),
      employeeId: emp.employeeId || `EM${String(emp._id).slice(-4)}`,
      fullName: `${emp.firstName} ${emp.lastName}`,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department || 'IT',
      position: emp.position || 'Employee',
      status: emp.status || 'active',
      hireDate: emp.hireDate || new Date()
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching colleagues:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get a single employee
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Invalid ID format:', id);
      return res.status(400).json({ message: 'Invalid employee ID format' });
    }

    // Find the requested employee
    const employee = await Employee.findById(id)
      .populate('user', 'email')
      .populate('createdBy', 'firstName lastName email')
      .populate('department', 'name')
      .populate('position', 'title')
      .lean(); // Convert to plain JavaScript object

    if (!employee) {
      console.log('Employee not found with ID:', id);
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Handle null populated fields
    const sanitizedEmployee = {
      ...employee,
      user: employee.user || null,
      createdBy: employee.createdBy || null,
      department: employee.department || { name: employee.department || 'IT' },
      position: employee.position || { title: employee.position || 'Employee' }
    };

    res.json(sanitizedEmployee);
  } catch (error) {
    console.error('Error in GET /:id:', {
      error: error.message,
      stack: error.stack,
      id: req.params.id
    });
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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

// Create new employee
router.post('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Generate employee ID
    const employeeId = await generateEmployeeId();

    // Generate random password
    const passwordPlain = generatePassword(8);
    const hashedPassword = await bcrypt.hash(passwordPlain, 10);

    // Create new employee in User model
    const newEmployee = new User({
      employeeId,
      password: hashedPassword,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      department: req.body.department || 'IT',
      position: req.body.position,
      role: 'employee',
      status: 'Active',
      hireDate: new Date(),
      address: req.body.address || {
        street: '',
        city: '',
        zipCode: '',
        country: ''
      },
      createdBy: adminId
    });

    await newEmployee.save();

    // Send credentials email
    try {
      await sendCredentialsEmail(req.body.email, employeeId, passwordPlain);
    } catch (emailError) {
      console.error('Error sending credentials email:', emailError);
      // Don't fail if email sending fails
    }

    // Also create in Employee model for consistency
    const employeeModel = new Employee({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      department: req.body.department || 'IT',
      status: 'active',
      hireDate: new Date(),
      address: req.body.address || {
        street: '',
        city: '',
        zipCode: '',
        country: ''
      },
      createdBy: adminId,
      user: newEmployee._id // Link to the User model
    });

    await employeeModel.save();

    res.status(201).json({
      ...newEmployee.toObject(),
      password: undefined // Don't send password back
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Bulk import employees
router.post('/bulk', requireAdmin, async (req, res) => {
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
        const email = emp.email.trim().toLowerCase();
        const existingEmployee = await User.findOne({ email });
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
          },
          createdBy: getAdminId(req)
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
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, createdBy: adminId },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete employee
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // First find the employee to get their email
    const employee = await Employee.findOne({
      _id: req.params.id,
      createdBy: adminId
    });

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Delete from both Employee and User models
    const [deletedEmployee, deletedUser] = await Promise.all([
      Employee.findOneAndDelete({
        _id: req.params.id,
        createdBy: adminId
      }),
      User.findOneAndDelete({
        email: employee.email,
        role: 'employee',
        createdBy: adminId
      })
    ]);

    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({
      message: 'Employee deleted successfully',
      deletedFromEmployee: !!deletedEmployee,
      deletedFromUser: !!deletedUser
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Import employees from CSV
router.post('/import', requireAdmin, async (req, res) => {
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
          skills: emp.skills ? emp.skills.split(',').map(skill => skill.trim()) : [],
          createdBy: getAdminId(req)
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

    let newToken = null;
    if (timeUntilExpiry < oneDay) {
      // Generate new token
      const payload = {
        user: {
          id: user._id,
          role: user.role
        }
      };
      newToken = jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );
    }

    res.status(200).json({
      valid: true,
      token: newToken || token,
      employee: {
        id: user._id, role: user.role, firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone, department: user.department, position: user.position, status: user.status, hireDate: user.hireDate, salary: user.salary, address: user.address, skills: user.skills
      }
    });

  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

export default router; 