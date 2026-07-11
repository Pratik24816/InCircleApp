import { Router } from 'express';
import { z } from 'zod';
import { HttpError } from '../middleware/errorHandler.js';
import {
  CircleFeedbackModel,
  toCircleFeedbackJson,
} from '../models/CircleFeedback.js';

const avatarIds = [
  'hyped',
  'amazed',
  'in-love',
  'curious',
  'inspired',
  'happy',
  'ready',
  'impressed',
  'intrigued',
  'thoughtful',
  'thrilled',
  'believer',
] as const;

const categories = ['concept', 'suggestion', 'feature', 'feedback', 'hype', 'other'] as const;

const createSchema = z.object({
  avatarId: z.enum(avatarIds),
  name: z.string().trim().max(64).default('Anonymous'),
  message: z.string().trim().min(8, 'Message must be at least 8 characters').max(280),
  category: z.enum(categories),
});

export const circleFeedbackRouter = Router();

circleFeedbackRouter.get('/', async (req, res, next) => {
  try {
    const parsed = Number(req.query.limit ?? 100);
    const limit = Number.isNaN(parsed) ? 100 : Math.min(Math.max(parsed, 1), 200);

    const rows = await CircleFeedbackModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json(rows.map(toCircleFeedbackJson));
  } catch (err) {
    next(err);
  }
});

circleFeedbackRouter.post('/', async (req, res, next) => {
  try {
    const dto = createSchema.parse(req.body);
    const count = await CircleFeedbackModel.countDocuments();

    const row = await CircleFeedbackModel.create({
      avatarId: dto.avatarId,
      name: dto.name || 'Anonymous',
      message: dto.message,
      category: dto.category,
      fireCount: 0,
      memberNumber: count + 1,
    });

    res.status(201).json(toCircleFeedbackJson(row));
  } catch (err) {
    next(err);
  }
});

circleFeedbackRouter.post('/:id/react', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!/^[a-f\d]{24}$/i.test(id)) {
      throw new HttpError(400, 'Invalid member id');
    }

    const row = await CircleFeedbackModel.findByIdAndUpdate(
      id,
      { $inc: { fireCount: 1 } },
      { new: true },
    );

    if (!row) {
      throw new HttpError(404, 'Circle member not found');
    }

    res.json(toCircleFeedbackJson(row));
  } catch (err) {
    next(err);
  }
});
