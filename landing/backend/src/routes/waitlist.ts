import { Router } from 'express';
import { z } from 'zod';
import { WaitlistModel } from '../models/WaitlistEntry.js';

const joinSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Please enter a valid email')
    .max(320),
});

export const waitlistRouter = Router();

waitlistRouter.post('/', async (req, res, next) => {
  try {
    const { email } = joinSchema.parse(req.body);

    const existing = await WaitlistModel.findOne({ email }).lean();
    if (existing) {
      res.json({ ok: true, email, alreadyRegistered: true });
      return;
    }

    await WaitlistModel.create({ email, source: 'landing' });
    res.status(201).json({ ok: true, email, alreadyRegistered: false });
  } catch (err) {
    next(err);
  }
});

waitlistRouter.get('/count', async (_req, res, next) => {
  try {
    const count = await WaitlistModel.countDocuments();
    res.json({ count });
  } catch (err) {
    next(err);
  }
});
