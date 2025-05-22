import express from 'express';
import { getAdminId, requireAdmin } from '../middleware/auth.js';
import Client from '../../models/Client.js';

const router = express.Router();

// Get all clients
router.get('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const clients = await Client.find({ createdBy: adminId });
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new client
router.post('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const client = new Client({
      ...req.body,
      createdBy: adminId
    });

    await client.save();
    res.status(201).json(client);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 