const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');


const app = express();
app.use(cors());


// Logging middleware para ver todas las peticiones entrantes
app.use((req, res, next) => {
  console.log(`[API-GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});

// Proxy para tweet-service

app.use('/tweets', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/tweets': '/tweets' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> tweet-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

app.use('/users', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/users': '/users' },
}));

// Aquí puedes agregar más microservicios (auth, feed, etc)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway corriendo en puerto ${PORT}`);
});
