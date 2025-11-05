import express from 'express';
import mongoose from 'mongoose';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { Event } from '../models/Event.js';
import { SwapRequest } from '../models/SwapRequest.js';

const router = express.Router();

router.use(authMiddleware);

// GET /api/swappable-slots → all events with status SWAPPABLE except user's own
router.get('/swappable-slots', async (req, res) => {
  try {
    const events = await Event.find({
      status: 'SWAPPABLE',
      userId: { $ne: new mongoose.Types.ObjectId(req.user.userId) }
    }).sort({ startTime: 1 });
    return res.json(events);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch swappable slots' });
  }
});

// GET /api/requests?type=incoming|outgoing → list swap requests for user
router.get('/requests', async (req, res) => {
  try {
    const type = req.query.type;
    const filter =
      type === 'incoming'
        ? { recipientId: req.user.userId }
        : type === 'outgoing'
        ? { requesterId: req.user.userId }
        : { $or: [{ recipientId: req.user.userId }, { requesterId: req.user.userId }] };

    const requests = await SwapRequest.find(filter)
      .sort({ createdAt: -1 })
      .populate('mySlotId')
      .populate('theirSlotId');
    return res.json(requests);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch requests' });
  }
});

// POST /api/swap-request → body: { mySlotId, theirSlotId }
router.post('/swap-request', async (req, res) => {
  try {
    const { mySlotId, theirSlotId } = req.body;
    if (!mySlotId || !theirSlotId) {
      return res.status(400).json({ message: 'mySlotId and theirSlotId are required' });
    }

    const [mySlot, theirSlot] = await Promise.all([
      Event.findById(mySlotId),
      Event.findById(theirSlotId)
    ]);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both events not found' });
    }

    if (String(mySlot.userId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'You do not own the provided mySlotId' });
    }

    if (String(theirSlot.userId) === String(req.user.userId)) {
      return res.status(400).json({ message: 'Cannot create a swap request with your own slot' });
    }

    if (mySlot.status !== 'SWAPPABLE' || theirSlot.status !== 'SWAPPABLE') {
      return res.status(400).json({ message: 'Both events must be SWAPPABLE' });
    }

    const swap = await SwapRequest.create({
      requesterId: req.user.userId,
      recipientId: theirSlot.userId,
      mySlotId,
      theirSlotId,
      status: 'PENDING'
    });

    await Promise.all([
      Event.findByIdAndUpdate(mySlotId, { status: 'SWAP_PENDING' }),
      Event.findByIdAndUpdate(theirSlotId, { status: 'SWAP_PENDING' })
    ]);

    return res.status(201).json(swap);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to create swap request' });
  }
});

// POST /api/swap-response/:requestId → body: { accepted: true/false }
router.post('/swap-response/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { accepted } = req.body;

    const swap = await SwapRequest.findById(requestId);
    if (!swap || swap.status !== 'PENDING') {
      return res.status(404).json({ message: 'Swap request not found or not pending' });
    }

    if (String(swap.recipientId) !== String(req.user.userId)) {
      return res.status(403).json({ message: 'Not authorized to respond to this request' });
    }

    const [mySlot, theirSlot] = await Promise.all([
      Event.findById(swap.mySlotId),
      Event.findById(swap.theirSlotId)
    ]);

    if (!mySlot || !theirSlot) {
      return res.status(404).json({ message: 'One or both events not found' });
    }

    if (!accepted) {
      await Promise.all([
        Event.findByIdAndUpdate(swap.mySlotId, { status: 'SWAPPABLE' }),
        Event.findByIdAndUpdate(swap.theirSlotId, { status: 'SWAPPABLE' })
      ]);
      swap.status = 'REJECTED';
      await swap.save();
      return res.json({ success: true, status: 'REJECTED' });
    }

    // Accepted: swap userIds and mark BUSY
    const requesterId = mySlot.userId; // owner of mySlot
    const recipientId = theirSlot.userId; // owner of theirSlot (should be req.user.userId)

    mySlot.userId = recipientId;
    theirSlot.userId = requesterId;
    mySlot.status = 'BUSY';
    theirSlot.status = 'BUSY';
    await Promise.all([mySlot.save(), theirSlot.save()]);

    swap.status = 'ACCEPTED';
    await swap.save();

    return res.json({ success: true, status: 'ACCEPTED' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to process swap response' });
  }
});

export default router;


