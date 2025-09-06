const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Proxy para tweet-service
app.use('/tweets', createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathRewrite: { '^/tweets': '/tweets' },
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
