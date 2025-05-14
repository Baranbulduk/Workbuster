import express from 'express';
import Client from '../models/Client.js';
import { transporter } from '../config/email.js';

const router = express.Router();

// Get all clients
router.get('/', async (req, res) => {
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

// Create a new client
router.post('/', async (req, res) => {
  const client = new Client({
    companyName: req.body.companyName,
    contactPerson: req.body.contactPerson,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address,
    industry: req.body.industry,
    companySize: req.body.companySize,
    website: req.body.website,
    description: req.body.description,
    status: req.body.status
  });

  try {
    const newClient = await client.save();
    
    // Send registration email
    await sendRegistrationEmail(newClient);
    
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
          status: item.status || 'active'
        };
        
        // Create and save the client
        const client = new Client(clientData);
        const newClient = await client.save();
        
        // Try to send registration email
        try {
          await sendRegistrationEmail(newClient);
        } catch (emailError) {
          console.error('Error sending registration email:', emailError);
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

export default router; 