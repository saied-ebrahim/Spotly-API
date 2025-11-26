import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import uploadRoutes from './routes/upload-routes.js';



const app = express();
app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Router عام لكل API v1
const apiV1 = express.Router();

// --- Routes Mounting تحت /api/v1 ---
apiV1.use('/', uploadRoutes);
// apiV1.use('/auth', authRoutes);
// apiV1.use('/events', eventRoutes);

// ربط كل راوترات v1 على /api/v1 مرة واحدة بس
app.use('/api/v1', apiV1);

// --- Global Error Handling ---

// 6. التعامل مع المسارات الغلط (404)
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`,
  });
});

// 7. التعامل مع أخطاء السيرفر (Global Error Handler)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

export default app;