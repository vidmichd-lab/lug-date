import express from 'express';
import adminRoutes from './routes/admin';
import { config } from './config';
import { initErrorMonitoring } from './monitoring';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './logger';
import { sendCriticalAlert } from './alerts';

// Initialize error monitoring (Yandex Cloud Logging + Catcher)
initErrorMonitoring();

const app = express();
const PORT = config.port;

// Request logging middleware (before routes)
app.use(requestLogger);

app.use(express.json());

// CORS для админки
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'backend' });
});

// API routes
app.use('/api/admin', adminRoutes);
// Example routes (uncomment when implementing)
// import matchesRoutes from './routes/matches';
// import photosRoutes from './routes/photos';
// app.use('/api/v1/matches', matchesRoutes);
// app.use('/api/v1/photos', photosRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error({ error, type: 'uncaught_exception' });
  await sendCriticalAlert('Uncaught Exception - Server may crash', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error({ error, type: 'unhandled_rejection', promise });
  await sendCriticalAlert('Unhandled Promise Rejection', error);
});

app.listen(PORT, () => {
  logger.info({
    type: 'server_started',
    port: PORT,
    environment: config.nodeEnv,
    database: config.database.database || 'not configured',
  });
  console.log(`Backend server running on port ${PORT} in ${config.nodeEnv} mode`);
  console.log(`Database: ${config.database.database || 'not configured'}`);
});

