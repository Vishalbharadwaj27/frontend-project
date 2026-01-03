const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const envPath = path.join(__dirname, '../../.env');

if (!fs.existsSync(envPath)) {
  const jwtSecret = crypto.randomBytes(64).toString('hex');
  const envContent = `JWT_SECRET=${jwtSecret}\nMONGODB_URI=mongodb://127.0.0.1:27017/task_manager\n`;
  fs.writeFileSync(envPath, envContent);
  console.log('.env file created with JWT_SECRET and MONGODB_URI');
}

require('dotenv').config();