require('module-alias/register');
const mongoose = require('mongoose');
const { globSync } = require('glob');
const path = require('path');

// Make sure we are running node 7.6+
const [major, minor] = process.versions.node.split('.').map(parseFloat);
if (major < 20) {
  console.log('Please upgrade your node.js version at least 20 or greater. 👌\n ');
  process.exit();
}

// import environmental variables from our variables.env file
require('dotenv').config({ path: '.env' });
require('dotenv').config({ path: '.env.local' });

// MongoDB connection with better error handling for Cloud Run
if (!process.env.DATABASE) {
  console.error('❌ DATABASE environment variable is not set!');
  process.exit(1);
}

mongoose.connect(process.env.DATABASE, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
});

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

mongoose.connection.on('error', (error) => {
  console.error(
    `1. 🔥 MongoDB Connection Error → check your .env file and DATABASE variable`
  );
  console.error(`2. 🚫 Error Details → ${error.message}`);
});

mongoose.connection.once('open', () => {
  console.log('✅ MongoDB Connected Successfully');
});

const modelsFiles = globSync('./src/models/**/*.js');

for (const filePath of modelsFiles) {
  require(path.resolve(filePath));
}

// Start our app!
const app = require('./app');

// Cloud Run sets PORT environment variable
const PORT = parseInt(process.env.PORT) || 8080;
app.set('port', PORT);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Express server running on PORT: ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 MongoDB: ${process.env.DATABASE ? 'Connected' : 'Not configured'}`);
});

// Graceful shutdown for Cloud Run
process.on("SIGTERM", async () => {
  try {
    console.log("⚠️  SIGTERM signal received: closing HTTP server");

    await new Promise((resolve) => server.close(resolve));

    await mongoose.connection.close();
    console.log("MongoDB connection closed");

    process.exit(0);
  } catch (err) {
    console.error("Error during shutdown:", err);
    process.exit(1);
  }
});


// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
});
