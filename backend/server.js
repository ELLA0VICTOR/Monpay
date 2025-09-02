import dotenv from 'dotenv';
dotenv.config({ path: './.env' }); // Load env first!

import app from './src/app.js';

console.log("Loaded MONGO_URI from server.js:", process.env.MONGO_URI);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`MonPay backend running on :${port}`);
});
