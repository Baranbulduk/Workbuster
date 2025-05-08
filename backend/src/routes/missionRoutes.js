import express from 'express';
import Mission from '../models/Mission.js';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { transporter } from '../config/email.js';

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

// Email notification functions
const sendMissionCreationEmail = async (mission, project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'New Mission Created',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>A new mission "${mission.missionName}" has been created for the project "${project.projectName}".</p>
        <p>Mission Details:</p>
        <ul>
          <li>Start Date: ${new Date(mission.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(mission.endDate).toLocaleDateString()}</li>
          <li>Assigned To: ${mission.assignedTo}</li>
          <li>Priority: ${mission.priority}</li>
          <li>Status: ${mission.status}</li>
        </ul>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending mission creation email:', error);
  }
};

const sendMissionUpdateEmail = async (mission, project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Mission Update Notification',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>The mission "${mission.missionName}" for project "${project.projectName}" has been updated.</p>
        <p>Updated Mission Details:</p>
        <ul>
          <li>Start Date: ${new Date(mission.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(mission.endDate).toLocaleDateString()}</li>
          <li>Assigned To: ${mission.assignedTo}</li>
          <li>Priority: ${mission.priority}</li>
          <li>Status: ${mission.status}</li>
        </ul>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending mission update email:', error);
  }
};

const sendMissionDeletionEmail = async (mission, project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Mission Deletion Notification',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>The mission "${mission.missionName}" for project "${project.projectName}" has been deleted from our system.</p>
        <p>If you did not request this deletion, please contact us immediately.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending mission deletion email:', error);
  }
};

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
    
    // Get project and client information
    const project = await Project.findById(mission.project);
    if (project) {
      const client = await Client.findById(project.client);
      if (client) {
        await sendMissionCreationEmail(mission, project, client);
      }
    }
    
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
    
    // Get project and client information
    const project = await Project.findById(mission.project);
    if (project) {
      const client = await Client.findById(project.client);
      if (client) {
        await sendMissionUpdateEmail(mission, project, client);
      }
    }
    
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
    
    // Get project and client information before deletion
    const project = await Project.findById(mission.project);
    if (project) {
      const client = await Client.findById(project.client);
      if (client) {
        await sendMissionDeletionEmail(mission, project, client);
      }
    }
    
    await mission.deleteOne();
    res.json({ message: 'Mission deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 