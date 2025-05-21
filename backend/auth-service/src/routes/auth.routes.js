const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');
const validate = require('../validators/auth.validator');
const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');
const { ROLES } = require('../config/constants');

// Auth routes
router.post('/register', validate.register, register);
router.post('/login', validate.login, login);

// User management routes
router.get('/users', authMiddleware, async (req, res, next) => {
  try {
    // Allow admin to fetch all users
    if (req.user.role === 'admin') {
      const users = await User.find({}, '-password');
      return res.json(users);
    }
    
    // Allow company users to fetch warehouse managers
    if (req.user.role === 'company') {
      const users = await User.find({ role: 'warehouse-manager' }, '-password');
      return res.json(users);
    }

    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    next(err);
  }
});

router.post('/users', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { username, email, password, role } = req.body;
    const user = new User({ username, email, password, role });
    await user.save();
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
});

router.put('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role },
      { new: true, runValidators: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    next(err);
  }
});

router.delete('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await User.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

router.get('/users/:id', authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const user = await User.findById(req.params.id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.get('/roles', (req, res) => {
  res.json(Object.values(ROLES));
});

module.exports = router;