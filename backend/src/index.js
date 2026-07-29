const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const app = express();

const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const localDevelopmentOrigin = /^http:\/\/(?:localhost|127\.0\.0\.1):51\d{2}$/;

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    const isAllowedLocalOrigin =
      process.env.NODE_ENV !== 'production'
      && typeof origin === 'string'
      && localDevelopmentOrigin.test(origin);
    if (!origin || allowedOrigins.includes(origin) || isAllowedLocalOrigin) {
      return callback(null, true);
    }
    return callback(new Error('Origen no permitido por CORS'));
  },
}));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'friendia-backend' });
});

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: Number(process.env.CHAT_RATE_LIMIT) || 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados mensajes. Espera un momento antes de continuar.' },
});

// Importamos las rutas que crearemos después
app.use('/api/perfiles', require('./routes/perfiles'));
app.use('/api/diario', require('./routes/diario'));
app.use('/api/emociones', require('./routes/emociones'));
app.use('/api/chat', chatLimiter, require('./routes/chat'));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
}

module.exports = app;
