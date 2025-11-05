import express from 'express';
import { Event } from '../models/Event.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes below are protected
router.use(authMiddleware);

// GET /api/events - list events for logged-in user
router.get('/', async (req, res) => {
  try {
    const events = await Event.find({ userId: req.user.userId }).sort({ startTime: 1 });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch events' });
  }
});

// POST /api/events - create event for logged-in user
router.post('/', async (req, res) => {
  try {
    const { title, startTime, endTime, status } = req.body;
    if (!title || !startTime || !endTime) {
      return res.status(400).json({ message: 'title, startTime, and endTime are required' });
    }

    const event = await Event.create({
      title,
      startTime,
      endTime,
      status,
      userId: req.user.userId
    });
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create event' });
  }
});

// PUT /api/events/:id - update event (owned by user)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const event = await Event.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      updates,
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update event' });
  }
});

// DELETE /api/events/:id - delete event (owned by user)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await Event.findOneAndDelete({ _id: id, userId: req.user.userId });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete event' });
  }
});

export default router;


