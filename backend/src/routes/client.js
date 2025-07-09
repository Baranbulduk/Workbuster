import express from 'express';
import Client from '../models/Client.js';
import { transporter } from '../config/email.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    console.log('Returning clients:', clients.map(c => ({ id: c._id, companyName: c.companyName, address: c.address })));
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all colleagues (all clients)
router.get('/colleagues', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single client
router.get('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Email notification functions
const sendRegistrationEmail = async (client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Welcome to Our Platform',
      html: `
        <h1>Welcome ${client.contactPerson}!</h1>
        <p>Thank you for registering your company ${client.companyName} with us.</p>
        <p>We're excited to have you on board and look forward to working with you.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending registration email:', error);
  }
};

const sendUpdateEmail = async (client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Your Company Information Has Been Updated',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>Your company ${client.companyName}'s information has been successfully updated in our system.</p>
        <p>If you did not make these changes, please contact us immediately.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending update email:', error);
  }
};

const sendDeletionEmail = async (client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Your Company Account Has Been Deleted',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>We're sorry to see you go. Your company ${client.companyName}'s account has been deleted from our system.</p>
        <p>If you did not request this deletion, please contact us immediately.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending deletion email:', error);
  }
};

// Password generator
const generatePassword = () => crypto.randomBytes(8).toString('hex');

// Welcome email for clients
const sendWelcomeEmail = async (client, plainPassword) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Welcome to Our Platform - Your Login Credentials',
      html: `
        <h1>Welcome ${client.contactPerson}!</h1>
        <p>Your company ${client.companyName} has been registered with us.</p>
        <p><b>Login Email:</b> ${client.email}<br/>
        <b>Password:</b> ${plainPassword}</p>
        <p>Please log in and change your password after your first login.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Create a new client
router.post('/', async (req, res) => {
  try {
    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    // Handle address field conversion
    let addressData = req.body.address;
    if (req.body.address && typeof req.body.address === 'string') {
      const addressParts = req.body.address.split(',').map(part => part.trim());
      addressData = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        country: addressParts[4] || ''
      };
    }

    const client = new Client({
      companyName: req.body.companyName,
      contactPerson: req.body.contactPerson,
      email: req.body.email,
      phone: req.body.phone,
      address: addressData,
      industry: req.body.industry,
      companySize: req.body.companySize,
      website: req.body.website,
      description: req.body.description,
      status: req.body.status,
      password: hashedPassword
    });
    console.log('Creating client with data:', { ...req.body, address: addressData, password: '[HIDDEN]' });
    const newClient = await client.save();
    console.log('Created client:', newClient);
    await sendWelcomeEmail(newClient, plainPassword);
    res.status(201).json(newClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a client
router.put('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Handle address field conversion
    if (req.body.address && typeof req.body.address === 'string') {
      const addressParts = req.body.address.split(',').map(part => part.trim());
      req.body.address = {
        street: addressParts[0] || '',
        city: addressParts[1] || '',
        state: addressParts[2] || '',
        zipCode: addressParts[3] || '',
        country: addressParts[4] || ''
      };
    }

    Object.assign(client, req.body);
    const updatedClient = await client.save();

    // Send update email
    await sendUpdateEmail(updatedClient);

    res.json(updatedClient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a client
router.delete('/:id', async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    // Store client info before deletion
    const clientInfo = { ...client.toObject() };

    await client.deleteOne();

    // Send deletion email
    await sendDeletionEmail(clientInfo);

    res.json({ message: 'Client deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Import clients from CSV
router.post('/import', async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No client data provided'
      });
    }

    const results = {
      success: [],
      failed: []
    };

    for (const item of items) {
      try {
        // Check if client with this email already exists
        const existingClient = await Client.findOne({ email: item.email });
        if (existingClient) {
          results.failed.push({
            email: item.email,
            reason: 'Email already exists'
          });
          continue;
        }

        const plainPassword = generatePassword();
        const hashedPassword = await bcrypt.hash(plainPassword, 10);
        // Create client object
        const clientData = {
          companyName: item.companyName || item.company || '',
          contactPerson: item.contactPerson || item.contact || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
          email: item.email || '',
          phone: item.phone || '',
          address: {
            street: item.street || '',
            city: item.city || '',
            state: item.state || '',
            zipCode: item.zipCode || item.postalCode || '',
            country: item.country || ''
          },
          industry: item.industry || 'Other',
          companySize: item.companySize || item.size || '1-10',
          website: item.website || '',
          description: item.description || item.notes || '',
          status: item.status || 'active',
          password: hashedPassword
        };

        // Create and save the client
        const client = new Client(clientData);
        const newClient = await client.save();

        // Try to send welcome email
        try {
          await sendWelcomeEmail(newClient, plainPassword);
        } catch (emailError) {
          console.error('Error sending welcome email:', emailError);
          // Don't throw the error, just log it
        }

        results.success.push(newClient);
      } catch (itemError) {
        console.error('Error importing client item:', itemError);
        results.failed.push({
          item,
          error: itemError.message
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: `Imported ${results.success.length} clients. ${results.failed.length} failed.`,
      results
    });
  } catch (error) {
    console.error('Error importing clients:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Client login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const client = await Client.findOne({ email });
    if (!client) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isMatch = await bcrypt.compare(password, client.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    // Create JWT token
    const payload = { user: { id: client._id, role: 'client' } };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    const clientData = client.toObject();
    delete clientData.password;
    res.json({ success: true, token, client: clientData });
  } catch (error) {
    res.status(500).json({ message: 'Error during login' });
  }
});

// Client verify-token
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ valid: false, message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const client = await Client.findById(decoded.user.id);
    if (!client) return res.status(401).json({ valid: false, message: 'Invalid token' });
    // Optionally refresh token if expiring soon
    const tokenExp = decoded.exp * 1000;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let newToken = null;
    if (tokenExp - now < oneDay) {
      const payload = { user: { id: client._id, role: 'client' } };
      newToken = jwt.sign(payload, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
    }
    res.status(200).json({
      valid: true,
      token: newToken || token,
      client: {
        id: client._id,
        companyName: client.companyName,
        contactPerson: client.contactPerson,
        email: client.email,
        // ...add other fields as needed
      }
    });
  } catch (error) {
    res.status(500).json({ valid: false, message: 'Error verifying token' });
  }
});

export default router; 