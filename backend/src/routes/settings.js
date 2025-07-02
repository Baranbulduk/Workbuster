import express from 'express';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Sample settings data (replace with database in production)
let settings = {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: true,
    desktop: false
  },
  display: {
    itemsPerPage: 10,
    showAvatars: true,
    compactMode: false
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false
  },
  preferences: {
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  }
};

// Get all settings
router.get('/', (req, res) => {
  res.json(settings);
});

// Get specific setting category
router.get('/:category', (req, res) => {
  const { category } = req.params;
  if (!settings[category]) {
    return res.status(404).json({ message: 'Settings category not found' });
  }
  res.json(settings[category]);
});

// Update settings
router.put('/', [
  body('theme').optional().isIn(['light', 'dark']).withMessage('Invalid theme'),
  body('language').optional().isIn(['en', 'es', 'fr', 'de']).withMessage('Invalid language'),
  body('notifications').optional().isObject().withMessage('Notifications must be an object'),
  body('display').optional().isObject().withMessage('Display must be an object'),
  body('privacy').optional().isObject().withMessage('Privacy must be an object'),
  body('preferences').optional().isObject().withMessage('Preferences must be an object')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  settings = {
    ...settings,
    ...req.body
  };

  res.json(settings);
});

// Update specific setting category
router.put('/:category', [
  body().isObject().withMessage('Invalid settings data')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { category } = req.params;
  if (!settings[category]) {
    return res.status(404).json({ message: 'Settings category not found' });
  }

  settings[category] = {
    ...settings[category],
    ...req.body
  };

  res.json(settings[category]);
});

// Reset settings to default
router.post('/reset', (req, res) => {
  settings = {
    theme: 'light',
    language: 'en',
    notifications: {
      email: true,
      push: true,
      desktop: false
    },
    display: {
      itemsPerPage: 10,
      showAvatars: true,
      compactMode: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    },
    preferences: {
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h'
    }
  };

  res.json(settings);
});

export default router; 