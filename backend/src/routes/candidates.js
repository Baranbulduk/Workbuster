import express from 'express';
import { getAdminId, requireAdmin } from '../middleware/auth.js';
import Candidate from '../../models/Candidate.js';

const router = express.Router();

// Get all candidates
router.get('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const candidates = await Candidate.find({ createdBy: adminId });
    res.json(candidates);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new candidate
router.post('/', requireAdmin, async (req, res) => {
  try {
    const adminId = getAdminId(req);
    if (!adminId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const candidate = new Candidate({
      ...req.body,
      createdBy: adminId
    });

    await candidate.save();
    res.status(201).json(candidate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 