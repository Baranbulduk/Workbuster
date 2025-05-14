import express from 'express';
import { body, validationResult } from 'express-validator';
import Employee from '../../models/Employee.js';
import bcrypt from 'bcryptjs';
import { transporter } from '../config/email.js';

const router = express.Router();

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

// Get all onboarding candidates
router.get('/', async (req, res) => {
  try {
  const { status, type } = req.query;
    let query = {};

  if (status) {
      query.status = status;
    }

    const employees = await Employee.find(query).sort({ createdAt: -1 });
    const formattedEmployees = employees.map(emp => ({
      id: emp._id,
      name: `${emp.firstName} ${emp.lastName}`,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      phone: emp.phone,
      position: emp.position,
      department: emp.department,
      status: emp.status,
      hireDate: emp.hireDate,
      onboardingStep: emp.onboardingStep || 1,
      welcomeSent: emp.welcomeSent || emp.hireDate,
      formCompleted: emp.formCompleted || emp.hireDate,
      tasks: emp.tasks || 0
    }));

    res.json(formattedEmployees);
  } catch (error) {
    console.error('Error fetching onboarding candidates:', error);
    res.status(500).json({ message: 'Error fetching onboarding candidates' });
  }
});

// Get a specific onboarding candidate
router.get('/:id', async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Candidate not found' });
  }

    const formattedEmployee = {
      id: employee._id,
      name: `${employee.firstName} ${employee.lastName}`,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      department: employee.department,
      status: employee.status,
      hireDate: employee.hireDate,
      onboardingStep: employee.onboardingStep || 1,
      welcomeSent: employee.welcomeSent || employee.hireDate,
      formCompleted: employee.formCompleted || employee.hireDate,
      tasks: employee.tasks || 0
    };

    res.json(formattedEmployee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import candidates via CSV
router.post('/import', async (req, res) => {
  try {
    const { candidates } = req.body;
    
    if (!Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No candidates data provided' 
      });
  }

    const results = {
      success: [],
      failed: []
    };

    for (const candidate of candidates) {
      try {
        // Check if candidate with this email already exists
        const existingEmployee = await Employee.findOne({ email: candidate.email });
        if (existingEmployee) {
          results.failed.push({
            email: candidate.email,
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
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new employee
        const newEmployee = new Employee({
          employeeId: newId,
          password: hashedPassword,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || '',
          department: candidate.department || 'IT',
          position: candidate.position || 'Employee',
          status: candidate.status || 'Active',
          hireDate: candidate.hireDate || new Date(),
          salary: candidate.salary || 0,
          address: {
            street: candidate.address?.street || '',
            city: candidate.address?.city || '',
            state: candidate.address?.state || '',
            zipCode: candidate.address?.zipCode || '',
            country: candidate.address?.country || ''
          },
          onboardingStep: 1,
          welcomeSent: candidate.hireDate || new Date(),
          formCompleted: candidate.hireDate || new Date(),
          tasks: 0
        });

        await newEmployee.save();

        // Send credentials email
        await sendCredentialsEmail(candidate.email, newId, password);

        results.success.push({
          employeeId: newId,
          email: candidate.email
        });
      } catch (error) {
        console.error(`Error processing candidate ${candidate.email}:`, error);
        results.failed.push({
          email: candidate.email,
          reason: error.message
        });
  }
    }

    res.json({
      success: true,
      results,
      message: `Successfully imported ${results.success.length} candidates. ${results.failed.length} failed.`
    });
  } catch (error) {
    console.error('Error in bulk import:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import candidates',
      error: error.message
    });
  }
});

// Export candidates to CSV
router.get('/export/csv', async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    
    const headers = [
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Position',
      'Department',
      'Status',
      'Hire Date',
      'Onboarding Step',
      'Welcome Sent',
      'Form Completed',
      'Tasks'
    ];

    const rows = employees.map(emp => [
      emp.firstName,
      emp.lastName,
      emp.email,
      emp.phone,
      emp.position,
      emp.department,
      emp.status,
      emp.hireDate.toISOString().split('T')[0],
      emp.onboardingStep || 1,
      emp.welcomeSent ? emp.welcomeSent.toISOString().split('T')[0] : '',
      emp.formCompleted ? emp.formCompleted.toISOString().split('T')[0] : '',
      emp.tasks || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=onboarding_candidates_${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting candidates:', error);
    res.status(500).json({ message: 'Error exporting candidates' });
  }
});

// Update onboarding status
router.put('/:id/status', async (req, res) => {
  try {
    const { onboardingStep, welcomeSent, formCompleted, tasks } = req.body;
    const employee = await Employee.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ message: 'Candidate not found' });
  }

    employee.onboardingStep = onboardingStep || employee.onboardingStep;
    employee.welcomeSent = welcomeSent || employee.welcomeSent;
    employee.formCompleted = formCompleted || employee.formCompleted;
    employee.tasks = tasks || employee.tasks;

    await employee.save();
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send form data via email
router.post('/send-form', async (req, res) => {
  try {
    const { formTitle, fields, recipients } = req.body;
    // Create email content
    const emailContent = `
      <h1>${formTitle}</h1>
      <div style="margin-top: 20px;">
        ${fields.map(field => `
          <div style="margin-bottom: 15px;">
            <strong>${field.label}:</strong>
            <div style="margin-top: 5px;">
              ${field.type === 'file' && field.value ? 
                `<a href="${field.value}" target="_blank">View File</a>` : 
                field.type === 'checkbox' ? 
                  (field.value ? 'Yes' : 'No') :
                field.value || 'Not provided'}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    // Send email to each recipient and collect results
    const results = [];
    for (const recipient of recipients) {
      const mailOptions = {
        from: 'rexettit@gmail.com',
        to: recipient.email,
        subject: formTitle,
        html: emailContent
      };
      try {
        console.log(`Sending email to: ${recipient.email}`);
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${recipient.email}`);
        results.push({ email: recipient.email, success: true });
      } catch (err) {
        console.error(`Error sending email to ${recipient.email}:`, err.message);
        results.push({ email: recipient.email, success: false, error: err.message });
      }
    }

    const failed = results.filter(r => !r.success);
    if (failed.length > 0) {
      console.log('Some emails failed to send:', failed);
      return res.status(500).json({
        success: false,
        message: `Failed to send form to ${failed.length} recipient(s).`,
        results
      });
    }

    console.log('All emails sent successfully.');
    res.json({ success: true, message: 'Form data sent successfully', results });
  } catch (error) {
    console.error('Error sending form data:', error);
    res.status(500).json({ success: false, message: 'Failed to send form data', error: error.message });
  }
});

export default router; 