import express from 'express';
import TeamMember from '../models/TeamMember.js';

const router = express.Router();

// Get all team members
router.get('/', async (req, res) => {
  try {
    const teamMembers = await TeamMember.find();
    res.json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single team member
router.get('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }
    res.json(teamMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new team member
router.post('/', async (req, res) => {
  const teamMember = new TeamMember({
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
    department: req.body.department,
    skills: req.body.skills,
    availability: req.body.availability
  });

  try {
    const newTeamMember = await teamMember.save();
    res.status(201).json(newTeamMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a team member
router.put('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    Object.assign(teamMember, req.body);
    const updatedTeamMember = await teamMember.save();
    res.json(updatedTeamMember);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a team member
router.delete('/:id', async (req, res) => {
  try {
    const teamMember = await TeamMember.findById(req.params.id);
    if (!teamMember) {
      return res.status(404).json({ message: 'Team member not found' });
    }

    await teamMember.deleteOne();
    res.json({ message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 