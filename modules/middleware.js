const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const cookie = require('cookie');

class Middleware {
  constructor() {
    this.publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH || 'public.pem', 'utf8');
    this.privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH || 'private_signer_key.pem', 'utf8');
    this.testingMode = true;
    this.publicRoutes = [
      '/login',
      '/password-reset',
      '/register',
      '/reset',
      '/forgot-password',
      '/forgot',
      '/',
      '/message',
      '/favicon.ico',
      '/docs',
      '/docs/',
      '/docs/favicon-32x32.png',
      '/docs/swagger-ui-standalone-preset.js',
      '/docs/swagger-ui-bundle.js',
      '/docs/swagger-ui.css',
      '/api-docs',
    ];
    this.headerAuthRoutes = ['/reset-password', '/password-reset'];
  }

  signRequest(req, res, next) {
    const payload = req.method + req.url;
    const signature = this.createSignature(payload);
    req.headers['x-gateway-signature'] = signature;
    next();
  }

  verifyToken(req, res, next) {
    const token = this.getToken(req);

    if (this.publicRoutes.includes(req.path)) {
      return next();
    }

    if (this.headerAuthRoutes.includes(req.path)) {
      if (!token) {
        return res.status(401).send('Access Denied: No Token Provided!');
      }
      return this._verifyJwt(token, req, res, next);
    }

    if (!token) {
      return res.status(401).send('Access Denied: No Token Provided!');
    }

    this._verifyJwt(token, req, res, next);
  }

  getToken(req) {
    if (this.headerAuthRoutes.includes(req.path)) {
      return req.headers['authorization']?.split(' ')[1];
    } else {
      const cookies = cookie.parse(req.headers.cookie || '');
      return cookies['jwt'];
    }
  }

  verifyJwt(token, req, res, next) {
    jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err || !decoded) {
        return res.status(403).send('Invalid Token');
      }
      req.headers['x-user-email'] = decoded.email;
      next();
    });
  }

  createSignature(payload) {
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(this.privateKey, 'base64');
  }
}

module.exports = Middleware;
