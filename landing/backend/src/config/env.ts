import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  mongoUri: required('MONGODB_URI'),
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5174')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
};
