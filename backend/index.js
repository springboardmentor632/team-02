const dns = require('node:dns');

// Force Node.js SRV lookups through public DNS
dns.setServers(['8.8.8.8', '1.1.1.1']);

// Load environment variables before importing local modules
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const policyRoutes = require('./routes/policy');
const schemeRoutes = require('./routes/scheme');
const eligibilityRoutes = require('./routes/eligibility');
const notificationRoutes = require('./routes/notification');
const feedbackRoutes = require('./routes/feedback');
const reportRoutes = require('./routes/report');
const searchRoutes = require('./routes/search');
const statsRoutes = require('./routes/stats');
const auditLogRoutes = require('./routes/auditLog');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'PolicyGPT backend is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/api/eligibility', eligibilityRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit-logs', auditLogRoutes);

app.use(errorHandler);

const startServer = async () => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is missing from .env — auth routes will fail');
    }

    await connectDB();
    app.listen(PORT, () => {
      console.log(`PolicyGPT backend listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();