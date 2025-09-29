

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('[API-GATEWAY] Error:', err);
  res.status(500).json({ error: 'Error interno del API Gateway' });
});
// Proxy para auth-service
app.use('/auth', createProxyMiddleware({
  target: 'http://localhost:3002',
  changeOrigin: true,
  pathRewrite: { '^/auth': '/' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> auth-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Logging middleware para ver todas las peticiones entrantes
app.use((req, res, next) => {
  console.log(`[API-GATEWAY] ${req.method} ${req.originalUrl}`);
  next();
});

// Proxy para tweet-service



app.use('/tweets', createProxyMiddleware({
  target: 'http://localhost:3003',
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
  target: 'http://localhost:3005', // user-service puerto
  changeOrigin: true,
  pathRewrite: { '^/users': '/users' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> user-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Proxy para uploads (imágenes de perfil)
app.use('/uploads', createProxyMiddleware({
  target: 'http://localhost:3005',
  changeOrigin: true,
  pathRewrite: { '^/uploads': '/uploads' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> user-service (uploads)`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));


// Aquí puedes agregar más microservicios (auth, feed, etc)
app.use('/notifications', createProxyMiddleware({
  target: 'http://localhost:3008', // puerto del notification-service
  changeOrigin: true,
  pathRewrite: { '^/notifications': '/notifications' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> notification-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));
// Proxy para feed-service
app.use('/feed', createProxyMiddleware({
  target: 'http://localhost:3006', // Puerto del feed-service
  changeOrigin: true,
  pathRewrite: { '^/feed': '/feed' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> feed-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Proxy para search-service
app.use('/search', createProxyMiddleware({
  target: 'http://localhost:3004', // Puerto personalizado para search-service
  changeOrigin: true,
  pathRewrite: { '^/search': '/search' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> search-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

// Proxy para gork-service (.NET)
app.use('/api/gork', createProxyMiddleware({
  target: 'http://localhost:3007', // Puerto del gork-service .NET
  changeOrigin: true,
  pathRewrite: { '^/api/gork': '/api/gork' },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`[API-GATEWAY] Proxying ${req.method} ${req.originalUrl} -> gork-service`);
  },
  onError: (err, req, res) => {
    console.error('[API-GATEWAY] Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway corriendo en puerto ${PORT}`);
});
