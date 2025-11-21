const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// --- Routes Mounting ---

// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/events', eventRoutes);

// مسار تجريبي عشان تتأكد ان السيرفر شغال
app.get('/', (req, res) => {
    res.send('API is running...');
});

// --- Global Error Handling ---

// 6. التعامل مع المسارات الغلط (404)
app.all('*', (req, res, next) => {
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl} on this server!`
    });
});

// 7. التعامل مع أخطاء السيرفر (Global Error Handler)
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;