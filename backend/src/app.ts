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

const app = express();

// 1. Security & Core Middlewares
app.use(helmet());
app.use(
  cors({
    origin: [env.CORS_ORIGIN, env.FRONTEND_URL],
    credentials: true,
  })
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 2. Swagger API Documentation Endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 3. Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
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
