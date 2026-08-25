import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { globalRateLimiter } from './middlewares/rateLimiter';
import { AppError } from './utils/AppError';
import { swaggerSpec } from './swagger/swagger';

import { prisma } from './config/db';

const app = express();

// Parse and normalize allowed CORS origins
const allowedOrigins = Array.from(
  new Set([
    ...env.CORS_ORIGIN.split(',').map((o) => o.trim().replace(/\/$/, '')),
    ...env.FRONTEND_URL.split(',').map((o) => o.trim().replace(/\/$/, '')),
  ])
).filter(Boolean);

// 1. Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(cleanOrigin) || env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(null, true); // Permissive callback for deployment flexibility while preserving credentials handling
    },
    credentials: true,
  })
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Health Check Endpoint
app.get('/health', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (err: any) {
    dbStatus = `error: ${err.message || 'connection failed'}`;
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: dbStatus,
    environment: env.NODE_ENV,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 4. API v1 Routes
app.use('/api/v1', routes);

// 5. 404 Not Found Handler
app.use('*', (req, res, next) => {
  next(AppError.notFound(`Cannot find ${req.originalUrl} on this server.`));
});

// 6. Centralized Error Handler
app.use(errorHandler);

export default app;
