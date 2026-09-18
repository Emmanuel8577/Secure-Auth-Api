import https from 'https';

export const startKeepAlive = () => {
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://secured-auth-api.onrender.com/health';
  const FOURTEEN_MINUTES = 14 * 60 * 1000;

  setInterval(() => {
    https.get(RENDER_URL, (res) => {
      console.log(`[KeepAlive] Pinged ${RENDER_URL} - Status: ${res.statusCode}`);
    }).on('error', (err) => {
      console.error(`[KeepAlive] Ping failed: ${err.message}`);
    });
  }, FOURTEEN_MINUTES);
};