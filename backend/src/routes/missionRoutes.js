import express from 'express';
import Mission from '../models/Mission.js';

const router = express.Router();

// Get all missions
router.get('/', async (req, res) => {
  try {
    const missions = await Mission.find();
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single mission
router.get('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }
    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new mission
router.post('/', async (req, res) => {
  const mission = new Mission({
    missionName: req.body.missionName,
    project: req.body.project,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    assignedTo: req.body.assignedTo,
    priority: req.body.priority,
    status: req.body.status,
    description: req.body.description,
    deliverables: req.body.deliverables
  });

  try {
    const newMission = await mission.save();
    res.status(201).json(newMission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a mission
router.put('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    Object.assign(mission, req.body);
    const updatedMission = await mission.save();
    res.json(updatedMission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a mission
router.delete('/:id', async (req, res) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) {
      return res.status(404).json({ message: 'Mission not found' });
    }

    await mission.deleteOne();
    res.json({ message: 'Mission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 