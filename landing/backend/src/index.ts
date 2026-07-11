import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { connectDb } from './db/connect.js';
import { errorHandler } from './middleware/errorHandler.js';
import { circleFeedbackRouter } from './routes/circleFeedback.js';
import { waitlistRouter } from './routes/waitlist.js';

async function main() {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins,
      methods: ['GET', 'POST', 'OPTIONS'],
    }),
  );
  app.use(express.json({ limit: '32kb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'hopiin-landing-api' });
  });

  app.use('/circle-feedback', circleFeedbackRouter);
  app.use('/waitlist', waitlistRouter);

  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`Hopiin landing API listening on http://localhost:${env.port}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
