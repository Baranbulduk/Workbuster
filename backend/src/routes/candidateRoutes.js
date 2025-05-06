const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');

// Get all candidates
router.get('/', async (req, res) => {
  try {
    const candidates = await Candidate.find();
    res.json(candidates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new candidate
router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', req.body);

    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'position', 'experience', 'skills', 'education', 'availability', 'expectedSalary', 'workPreference', 'location', 'personId'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        missingFields 
      });
    }

    const candidate = new Candidate({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      experience: req.body.experience,
      skills: req.body.skills,
      education: req.body.education,
      availability: req.body.availability,
      expectedSalary: req.body.expectedSalary,
      workPreference: req.body.workPreference,
      location: req.body.location,
      portfolio: req.body.portfolio,
      linkedin: req.body.linkedin,
      github: req.body.github,
      personId: req.body.personId
    });

    const newCandidate = await candidate.save();
    res.status(201).json(newCandidate);
  } catch (error) {
    console.error('Error saving candidate:', error);
    res.status(400).json({ 
      message: error.message,
      details: error.errors
    });
  }
});

module.exports = router; 