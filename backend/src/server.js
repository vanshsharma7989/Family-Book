// const app = require('./app');
// const config = require('./config/env');
// const { connectDB } = require('./config/db');

// async function start() {
//   try {
//     await connectDB();
//     app.listen(config.port, () => {
//       console.log(`[Server] Family Book API listening on port ${config.port} (${config.nodeEnv})`);
//     });
//   } catch (err) {
//     console.error('[Server] Failed to start:', err.message);
//     process.exit(1);
//   }
// }

// start();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = require('./app');
const config = require('./config/env');
const { connectDB } = require('./config/db');

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => {
      console.log(`[Server] Family Book API listening on port ${config.port} (${config.nodeEnv})`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err.message);
    process.exit(1);
  }
}

start();