const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const router = express.Router();

const testingMode = true;

// URLs for services
const UPMS_URL = testingMode ? 'http://localhost:5001' : 'https://isa-database-microservice.onrender.com';
const AUTH_URL = testingMode ? 'http://localhost:5000' : 'https://auth-microservice-of4o.onrender.com';
const FRONTEND_URL = testingMode ? 'http://localhost:8080' : 'https://isa-facade.azurewebsites.net';
const AI_URL = testingMode ? 'http://localhost:8081' : 'https://ai-microservice-x34z.onrender.com';

// Static files do not require JWT verification
router.use(
  '/static',
  createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/static': '/static' },
  })
);

// Public routes
const publicRoutes = ['/', '/login', '/register', '/forgot', '/message', '/favicon.ico'];
publicRoutes.forEach((route) => {
  router.get(
    route,
    createProxyMiddleware({
      target: FRONTEND_URL,
      changeOrigin: true,
    })
  );
});

// Authentication routes
router.post(
  '/login',
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
  })
);

router.post(
  '/register',
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
  })
);

router.post(
  '/forgot-password',
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
  })
);

// Protected routes
router.get(
  '/dashboard',
  createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
  })
);

router.get(
  '/password-reset',
  createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
  })
);

router.post(
  '/reset-password',
  createProxyMiddleware({
    target: UPMS_URL,
    changeOrigin: true,
  })
);

router.post(
  '/detect',
  createProxyMiddleware({
    target: AI_URL,
    changeOrigin: true,
  })
);

router.get(
  '/favicon.ico',
  createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
  })
);

// Testing route
router.get(
  '/protected',
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
  })
);

module.exports = router;
