import express from 'express';

const router = express.Router();

// Sample statistics data (replace with database queries in production)
const statistics = {
  candidates: {
    total: 150,
    active: 120,
    placed: 80,
    inProgress: 40,
    byStatus: {
      'New': 30,
      'Screening': 25,
      'Interview': 35,
      'Offer': 20,
      'Hired': 40
    }
  },
  projects: {
    total: 45,
    active: 30,
    completed: 15,
    byStatus: {
      'Planning': 10,
      'In Progress': 20,
      'On Hold': 5,
      'Completed': 15
    }
  },
  clients: {
    total: 25,
    active: 20,
    new: 5,
    byIndustry: {
      'Technology': 10,
      'Healthcare': 5,
      'Finance': 5,
      'Manufacturing': 5
    }
  },
  revenue: {
    monthly: [45000, 52000, 48000, 55000, 60000, 58000],
    quarterly: [145000, 173000],
    yearly: 518000
  },
  performance: {
    placementRate: 75,
    averageTimeToFill: 45,
    clientSatisfaction: 92,
    candidateSatisfaction: 88
  }
};

// Get all statistics
router.get('/', (req, res) => {
  res.json(statistics);
});

// Get candidate statistics
router.get('/candidates', (req, res) => {
  res.json(statistics.candidates);
});

// Get project statistics
router.get('/projects', (req, res) => {
  res.json(statistics.projects);
});

// Get client statistics
router.get('/clients', (req, res) => {
  res.json(statistics.clients);
});

// Get revenue statistics
router.get('/revenue', (req, res) => {
  res.json(statistics.revenue);
});

// Get performance metrics
router.get('/performance', (req, res) => {
  res.json(statistics.performance);
});

export default router; 