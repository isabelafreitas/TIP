require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { testConnection } = require('./src/config/database');
const { attachWebSocket } = require('./src/websocket/chat.ws');

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
const { startEscrowJob } = require('./src/jobs/escrow.job');
const { startReviewsJob } = require('./src/jobs/reviews.job');
const { startAnnouncementsJob } = require('./src/jobs/announcements.job');
const { startNonAttendanceJob } = require('./src/jobs/nonattendance.job');
const { startCancellationsJob } = require('./src/jobs/cancellations.job');
const { startExpireAnnouncementsJob } = require('./src/jobs/expireAnnouncements.job');
const { startAutoReleasePaymentsJob } = require('./src/jobs/autoReleasePayments.job');
const { startExpireReviewsJob } = require('./src/jobs/expireReviews.job');
const { startResetCancellationCountsJob } = require('./src/jobs/resetCancellationCounts.job');
const { startCleanupSessionsJob } = require('./src/jobs/cleanupSessions.job');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS: allow all origins in dev, restrict in production
app.use(cors({
  origin: NODE_ENV === 'production'
    ? (process.env.FRONTEND_URL || 'http://localhost:3001')
    : '*',
  credentials: NODE_ENV === 'production',
}));

app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1', timestamp: new Date().toISOString() });
});

// ── API v1 Routes ─────────────────────────────────────────────────────────────
const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, usersRoutes);
app.use(`${API}/providers`, providersRoutes);
app.use(`${API}/announcements`, announcementsRoutes);
app.use(`${API}/services`, servicesRoutes);
app.use(`${API}/payments`, paymentsRoutes);
app.use(`${API}/disputes`, disputesRoutes);
app.use(`${API}/reviews`, reviewsRoutes);
app.use(`${API}/chat`, chatRoutes);
app.use(`${API}/saved`, savedRoutes);

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
  try {
    await testConnection();
  } catch (dbErr) {
    console.warn('[Boot] Database connection failed (continuing without DB):', dbErr.message);
  }

  const server = http.createServer(app);

  // Attach WebSocket
  const chatWs = attachWebSocket(server);
  app.locals.chatWs = chatWs;

  // Start scheduled jobs
  startEscrowJob();
  startReviewsJob();
  startAnnouncementsJob();
  startNonAttendanceJob();
  startCancellationsJob();
  startExpireAnnouncementsJob();
  startAutoReleasePaymentsJob();
  startExpireReviewsJob();
  startResetCancellationCountsJob();
  startCleanupSessionsJob();

  server.listen(PORT, () => {
    console.log(`\n🚀 TIP backend running on http://localhost:${PORT}`);
    console.log(`   API: http://localhost:${PORT}/api/v1`);
    console.log(`   WS:  ws://localhost:${PORT}/ws`);
    console.log(`   ENV: ${NODE_ENV}\n`);
  });
}

boot().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
