
// Swagger
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('./config/swagger');
require('dotenv').config(); 
require('express-async-errors'); // auto-catch async errors
const app = require('./src/app'); 
const connectDB = require('./src/config/db'); 

// 2. التعامل مع الأخطاء غير المتوقعة (Uncaught Exceptions)
process.on('uncaughtException', (err) => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    process.exit(1);
});

connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`App running on port ${PORT}... 🚀`);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});