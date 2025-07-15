import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { transporter } from '../config/email.js';
import crypto from 'crypto';
import OnboardingForm from '../models/OnboardingForm.js';
import WelcomeMessage from '../models/WelcomeMessage.js';
import nodemailer from 'nodemailer';
import { getOnboardingProgress } from '../controllers/onboardingController.js';
import Employee from '../models/Employee.js';

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
    let query = { role: 'employee' };

    if (status) {
      query.status = status;
    }

    const employees = await User.find(query).sort({ createdAt: -1 });
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
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });
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
        const existingEmployee = await User.findOne({ email: candidate.email });
        if (existingEmployee) {
          results.failed.push({
            email: candidate.email,
            reason: 'Email already exists'
          });
          continue;
        }

        // Generate employee ID
        const lastEmployee = await User.findOne({ role: 'employee' }).sort({ employeeId: -1 });
        const lastId = lastEmployee ? parseInt(lastEmployee.employeeId.slice(1)) : 0;
        const newId = `E${(lastId + 1).toString().padStart(4, '0')}`;

        // Generate random password
        const password = generatePassword(8);
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new employee
        const newEmployee = new User({
          employeeId: newId,
          password: hashedPassword,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || '',
          department: candidate.department || 'IT',
          position: candidate.position || 'Employee',
          role: 'employee',
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
    const employees = await User.find().sort({ createdAt: -1 });

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
    const employee = await User.findOne({ _id: req.params.id, role: 'employee' });

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

    // Make sure each recipient has a role
    const recipientsWithRole = recipients.map(r => ({
      name: r.name,
      email: r.email,
      // If you already know the role, use it; otherwise, default to 'candidate'
      role: r.role
    }));

    // Generate a unique token for this form submission
    const formToken = crypto.randomBytes(16).toString('hex');

    // Store the form data in the database
    const formData = new OnboardingForm({
      token: formToken,
      title: formTitle,
      fields: fields,
      recipients: recipientsWithRole,
      createdAt: new Date()
    });

    await formData.save();
    console.log('Form data saved with token:', formToken);

    // Send email to each recipient and collect results
    const results = [];
    for (const recipient of recipientsWithRole) {
      console.log('Processing recipient:', recipient);
      // Create the correct onboarding URL based on recipient type
      let onboardingUrl;
      if (recipient.role === 'candidate') {
        onboardingUrl = `http://localhost:5173/candidate/onboarding?token=${formToken}&email=${encodeURIComponent(recipient.email)}`;
      } else if (recipient.role === 'employee') {
        onboardingUrl = `http://localhost:5173/employee/onboarding?token=${formToken}&email=${encodeURIComponent(recipient.email)}`;
      } else {
        onboardingUrl = `http://localhost:5173/employee/onboarding?token=${formToken}&email=${encodeURIComponent(recipient.email)}`;
      }

      // Create email content with link to onboarding dashboard
      const emailContent = `
        <h1>${formTitle}</h1>
        <p>You have been requested to complete an onboarding form. Please click the link below to access the form:</p>
        <div style="margin: 20px 0;">
          <a href="${onboardingUrl}" style="background: linear-gradient(to right, #FFD08E, #FF6868, #926FF3); color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Onboarding Form</a>
        </div>
        <p>If the button above doesn't work, copy and paste this URL into your browser:</p>
        <p>${onboardingUrl}</p>
      `;

      const mailOptions = {
        from: 'rexettit@gmail.com',
        to: recipient.email,
        subject: `${formTitle} - Please Complete Your Onboarding Form`,
        html: emailContent
      };

      try {
        await transporter.sendMail(mailOptions);
        results.push({
          email: recipient.email,
          success: true
        });
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Form sent successfully',
      results
    });
  } catch (error) {
    console.error('Error sending form:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending form',
      error: error.message
    });
  }
});

// Send welcome messages via email
router.post('/send-welcome-message', async (req, res) => {
  try {
    const { type, messages, recipients } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No welcome messages provided'
      });
    }

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recipients provided'
      });
    }

    // Send email to each recipient and collect results
    const results = [];
    for (const recipient of recipients) {
      console.log('Processing welcome message recipient:', recipient);

      // Generate a unique token for this welcome message
      const welcomeToken = crypto.randomBytes(16).toString('hex');
      
      // Store welcome messages in database with role
      for (const message of messages) {
        await WelcomeMessage.create({
          recipientEmail: recipient.email,
          title: message.title,
          content: message.content,
          sentAt: new Date(),
          token: welcomeToken,
          role: recipient.role || 'candidate'
        });
      }

      // Create HTML content for welcome message email
      let emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: left; margin-bottom: 30px;">
            <h1 style="color: #333; margin-bottom: 10px;">Welcome to Rexett!</h1>
            <p style="color: #666; font-size: 16px;">We're excited to have you on board!</p>
          </div>
          
          <div style="text-align: left; margin: 30px 0;">
            <p style="color: #555; font-size: 16px; margin-bottom: 20px;">
              You have new welcome messages waiting for you in your dashboard.
            </p>
            <div style="margin: 20px 0;">
              <a href="http://localhost:5173/employee/onboarding?welcome=${welcomeToken}&email=${encodeURIComponent(recipient.email)}" 
                 style="background: linear-gradient(to right, #FFD08E, #FF6868, #926FF3); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                View Welcome Messages
              </a>
            </div>
            <p style="color: #999; font-size: 14px; margin-top: 10px;">
              Click the button above to access your welcome messages in your employee dashboard.
            </p>
          </div>
          
          <div style="text-align: left; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 14px;">
              If you have any questions, please don't hesitate to reach out to our team.
            </p>
            <p style="color: #999; font-size: 14px;">
              Best regards,<br>The Rexett Team
            </p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: 'rexettit@gmail.com',
        to: recipient.email,
        subject: 'Welcome to Rexett - Your Onboarding Journey Begins!',
        html: emailContent
      };

      try {
        await transporter.sendMail(mailOptions);
        
        // Save each welcome message to the database
        for (const message of messages) {
          await WelcomeMessage.create({
            recipientEmail: recipient.email,
            title: message.title,
            content: message.content,
            sentAt: new Date()
          });
        }
        
        results.push({
          email: recipient.email,
          success: true
        });
        console.log(`Welcome message sent successfully to ${recipient.email}`);
      } catch (error) {
        console.error(`Error sending welcome message to ${recipient.email}:`, error);
        results.push({
          email: recipient.email,
          success: false,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: 'Welcome messages sent successfully',
      results
    });
  } catch (error) {
    console.error('Error sending welcome messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending welcome messages',
      error: error.message
    });
  }
});

// Get welcome messages by recipient email
router.get('/welcome-messages-by-recipient/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.query;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }

    const query = { recipientEmail: email };
    if (role) query.role = role;

    const messages = await WelcomeMessage.find(query).sort({ sentAt: -1 });

    res.json({
      success: true,
      messages: messages.map(msg => ({
        title: msg.title,
        content: msg.content,
        sentAt: msg.sentAt
      }))
    });
  } catch (error) {
    console.error('Error fetching welcome messages:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching welcome messages',
      error: error.message
    });
  }
});

// Get welcome messages by token
router.get('/welcome-messages-by-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token parameter is required'
      });
    }

    const messages = await WelcomeMessage.find({ 
      token: token 
    }).sort({ sentAt: -1 });

    if (messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No welcome messages found for this token'
      });
    }

    res.json({
      success: true,
      messages: messages.map(msg => ({
        title: msg.title,
        content: msg.content,
        sentAt: msg.sentAt
      }))
    });
  } catch (error) {
    console.error('Error fetching welcome messages by token:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching welcome messages',
      error: error.message
    });
  }
});

// Fetch form data by token
router.get('/form/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const formData = await OnboardingForm.findOne({ token });

    if (!formData) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    res.json({
      success: true,
      form: {
        title: formData.title,
        fields: formData.fields,
        recipients: formData.recipients,
        createdAt: formData.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ success: false, message: 'Error fetching form data', error: error.message });
  }
});

// Submit completed form
router.post('/submit/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { completedFields, recipientEmail } = req.body;

    if (!token || !recipientEmail) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: token and recipientEmail are required'
      });
    }

    // Find the form by token
    const formData = await OnboardingForm.findOne({ token });

    if (!formData) {
      return res.status(404).json({ success: false, message: 'Form not found' });
    }

    // Check if this email is actually a recipient for this form
    const isRecipient = formData.recipients.some(r => r.email === recipientEmail);
    if (!isRecipient) {
      return res.status(403).json({
        success: false,
        message: 'The provided email is not authorized to submit this form'
      });
    }

    // Mark this form as completed by this recipient
    const updatedForm = await OnboardingForm.findOneAndUpdate(
      { token, 'recipients.email': recipientEmail },
      {
        $set: {
          'recipients.$.completedAt': new Date(),
          'recipients.$.completedFields': completedFields
        }
      },
      { new: true }
    );

    if (!updatedForm) {
      return res.status(400).json({ success: false, message: 'Failed to update form completion status' });
    }

    res.json({ success: true, message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ success: false, message: 'Error submitting form', error: error.message });
  }
});

// Fetch forms by recipient email (for admin view)
router.get('/forms-by-recipient/:email', async (req, res) => {
  try {
    const { email } = req.params;

    // Find all forms where this email is a recipient
    const forms = await OnboardingForm.find({
      'recipients.email': email
    });

    if (!forms || forms.length === 0) {
      return res.json({ success: true, forms: [] });
    }

    res.json({
      success: true,
      forms
    });
  } catch (error) {
    console.error('Error fetching recipient forms:', error);
    res.status(500).json({ success: false, message: 'Error fetching recipient forms', error: error.message });
  }
});

// Fetch forms assigned to employee (for employee view)
router.get('/my-forms/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.query;

    // Find all forms where this email and role is a recipient
    const forms = await OnboardingForm.find({
      recipients: {
        $elemMatch: {
          email,
          ...(role ? { role } : {})
        }
      }
    });

    res.json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ success: false, message: 'Error fetching forms', error: error.message });
  }
});

// Send onboarding form to employee
router.post('/send-form/:employeeId', async (req, res) => {
  try {
    const employee = await User.findOne({ _id: req.params.employeeId, role: 'employee' });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Generate a unique token for this form
    const token = crypto.randomBytes(32).toString('hex');

    // Create or update onboarding form
    let form = await OnboardingForm.findOne({ title: 'Employee Onboarding' });
    if (!form) {
      form = new OnboardingForm({
        title: 'Employee Onboarding',
        token,
        fields: [
          {
            id: 'personal_info',
            type: 'section',
            label: 'Personal Information',
            required: true
          },
          {
            id: 'emergency_contact',
            type: 'section',
            label: 'Emergency Contact',
            required: true
          },
          {
            id: 'bank_details',
            type: 'section',
            label: 'Bank Details',
            required: true
          }
        ]
      });
    }

    // Add or update recipient
    const recipientIndex = form.recipients.findIndex(r => r.email === employee.email);
    if (recipientIndex === -1) {
      form.recipients.push({
        name: `${employee.firstName} ${employee.lastName}`,
        email: employee.email,
        role: 'employee' // or 'candidate'
      });
    }

    await form.save();

    // Send email with form link
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'rexettit@gmail.com',
        pass: 'prmursgwotixwilt'
      }
    });

    const mailOptions = {
      from: 'rexettit@gmail.com',
      to: employee.email,
      subject: 'Complete Your Onboarding Form',
      html: `
        <h1>Welcome to Rexett!</h1>
        <p>Please complete your onboarding form by clicking the button below:</p>
        <a href="http://localhost:5173/employee/onboarding?token=${token}&email=${encodeURIComponent(employee.email)}" 
           style="display: inline-block; padding: 10px 20px; background: linear-gradient(to right, #FFD08E, #FF6868, #926FF3); color: white; text-decoration: none; border-radius: 5px;">
          Complete Onboarding Form
        </a>
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: 'Onboarding form sent successfully' });
  } catch (error) {
    console.error('Error sending onboarding form:', error);
    res.status(500).json({ message: 'Error sending onboarding form' });
  }
});

// Get onboarding form by token
router.get('/form/:token', async (req, res) => {
  try {
    const form = await OnboardingForm.findOne({ token: req.params.token });
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form' });
  }
});

// Submit onboarding form
router.post('/submit-form/:token', async (req, res) => {
  try {
    const { email, completedFields } = req.body;
    const form = await OnboardingForm.findOne({ token: req.params.token });

    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    const recipient = form.recipients.find(r => r.email === email);
    if (!recipient) {
      return res.status(403).json({ message: 'You are not authorized to submit this form' });
    }

    recipient.completedFields = completedFields;
    recipient.completedAt = new Date();
    await form.save();

    res.json({ message: 'Form submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting form' });
  }
});

// Get onboarding progress for all employees
router.get('/progress', async (req, res) => {
  try {
    console.log('Fetching onboarding progress for all employees');

    // Get all employees with their forms
    const employees = await Employee.find()
      .populate('forms')
      .lean();

    console.log(`Found ${employees.length} employees`);

    // Calculate progress for each employee
    const progressData = employees.map(employee => {
      const formsData = employee.forms || [];
      let notStarted = 0;
      let inProgress = 0;
      let completed = 0;

      formsData.forEach(form => {
        if (!form) return;

        const recipient = form.recipients?.find(r => r.email === employee.email);
        if (!recipient) {
          notStarted++;
        } else if (recipient.completedAt) {
          completed++;
        } else if (recipient.completedFields) {
          inProgress++;
        } else {
          notStarted++;
        }
      });

      const totalForms = formsData.length || 0;
      const progress = totalForms > 0 ? Math.round((completed / totalForms) * 100) : 0;

      let status = 'Not Started';
      if (progress === 100) {
        status = 'Complete';
      } else if (progress > 0) {
        status = 'In Progress';
      }

      return {
        employeeId: employee._id,
        status,
        progress,
        completed,
        totalForms,
        notStarted,
        inProgress,
        currentStep: employee.onboardingStep || 1,
        welcomeSent: employee.welcomeSent,
        formCompleted: completed > 0
      };
    });

    console.log('Successfully calculated progress for all employees');
    res.json(progressData);
  } catch (error) {
    console.error('Error in GET /progress:', error);
    res.status(500).json({
      message: 'Server error',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router; 