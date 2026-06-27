require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('./src/config/database');
const { setupWebSocket } = require('./src/websocket/chat.ws');

// Routes
const authRoutes = require('./src/routes/auth.routes');
const usersRoutes = require('./src/routes/users.routes');
const providersRoutes = require('./src/routes/providers.routes');
const announcementsRoutes = require('./src/routes/announcements.routes');
const servicesRoutes = require('./src/routes/services.routes');
const paymentsRoutes = require('./src/routes/payments.routes');
const disputesRoutes = require('./src/routes/disputes.routes');
const reviewsRoutes = require('./src/routes/reviews.routes');
const chatRoutes = require('./src/routes/chat.routes');
const savedRoutes = require('./src/routes/saved.routes');

// Cron jobs
const { startExpireAnnouncementsJob } = require('./src/jobs/expireAnnouncements.job');
const { startAutoReleasePaymentsJob } = require('./src/jobs/autoReleasePayments.job');
const { startExpireReviewsJob } = require('./src/jobs/expireReviews.job');
const { startResetCancellationCountsJob } = require('./src/jobs/resetCancellationCounts.job');
const { startCleanupSessionsJob } = require('./src/jobs/cleanupSessions.job');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/providers', providersRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/disputes', disputesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/saved', savedRoutes);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Rota não encontrada' });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ success: false, error: err.message || 'Erro interno' });
});

// ── Boot ──────────────────────────────────────────────────────────────────────
async function boot() {
  await testConnection();

  const server = http.createServer(app);

  // WebSocket
  const wss = setupWebSocket(server);
  app.locals.wss = wss;

  // Start scheduled jobs
  startExpireAnnouncementsJob();
  startAutoReleasePaymentsJob();
  startExpireReviewsJob();
  startResetCancellationCountsJob();
  startCleanupSessionsJob();

  server.listen(PORT, () => {
    console.log(`TIP backend running on http://localhost:${PORT}`);
    console.log(`WebSocket ready on ws://localhost:${PORT}/ws`);
  });
}

boot().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
