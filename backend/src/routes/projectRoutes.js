import express from 'express';
import Project from '../models/Project.js';
import Client from '../models/Client.js';
import { transporter } from '../config/email.js';

const router = express.Router();

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Email notification functions
const sendProjectCreationEmail = async (project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'New Project Created',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>A new project "${project.projectName}" has been created for ${client.companyName}.</p>
        <p>Project Details:</p>
        <ul>
          <li>Start Date: ${new Date(project.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(project.endDate).toLocaleDateString()}</li>
          <li>Budget: $${project.budget}</li>
          <li>Status: ${project.status}</li>
        </ul>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending project creation email:', error);
  }
};

const sendProjectUpdateEmail = async (project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Project Update Notification',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>The project "${project.projectName}" for ${client.companyName} has been updated.</p>
        <p>Updated Project Details:</p>
        <ul>
          <li>Start Date: ${new Date(project.startDate).toLocaleDateString()}</li>
          <li>End Date: ${new Date(project.endDate).toLocaleDateString()}</li>
          <li>Budget: $${project.budget}</li>
          <li>Status: ${project.status}</li>
        </ul>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending project update email:', error);
  }
};

const sendProjectDeletionEmail = async (project, client) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: client.email,
      subject: 'Project Deletion Notification',
      html: `
        <h1>Hello ${client.contactPerson},</h1>
        <p>The project "${project.projectName}" for ${client.companyName} has been deleted from our system.</p>
        <p>If you did not request this deletion, please contact us immediately.</p>
        <p>Best regards,<br>Your Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending project deletion email:', error);
  }
};

// Create a new project
router.post('/', async (req, res) => {
  const project = new Project({
    projectName: req.body.projectName,
    client: req.body.client,
    startDate: req.body.startDate,
    endDate: req.body.endDate,
    budget: req.body.budget,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    teamMembers: req.body.teamMembers
  });

  try {
    const newProject = await project.save();
    
    // Get client information
    const client = await Client.findById(project.client);
    if (client) {
      await sendProjectCreationEmail(project, client);
    }
    
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a project
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    Object.assign(project, req.body);
    const updatedProject = await project.save();
    
    // Get client information
    const client = await Client.findById(project.client);
    if (client) {
      await sendProjectUpdateEmail(project, client);
    }
    
    res.json(updatedProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a project
router.delete('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Get client information before deletion
    const client = await Client.findById(project.client);
    if (client) {
      await sendProjectDeletionEmail(project, client);
    }
    
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router; 