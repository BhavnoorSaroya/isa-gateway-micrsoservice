// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const fs = require('fs');
// const cookie = require('cookie');

// class Middleware {
//   constructor() {
//     this.publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH || 'public.pem', 'utf8');
//     this.privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH || 'private_signer_key.pem', 'utf8');
//     this.testingMode = true;
//     this.publicRoutes = [
//       '/login',
//       '/reset',
//       '/register',
//       '/forgot-password',
//       '/forgot',
//       '/',
//       '/message',
//       '/favicon.ico',
//       '/docs',
//       '/docs/',
//       '/docs/favicon-32x32.png',
//       '/docs/swagger-ui-standalone-preset.js',
//       '/docs/swagger-ui-bundle.js',
//       '/docs/swagger-ui.css',
//       '/api-docs',
//     ];
//     this.headerAuthRoutes = ['/reset-password', '/reset'];
//   }

//   signRequest(req, res, next) {
//     const payload = req.method + req.url;
//     console.log("Signing request for: ", payload);
//     const signature = this.createSignature(payload);
//     req.headers['x-gateway-signature'] = signature;
//     next();
//   }

//   createSignature(payload) {
//     const sign = crypto.createSign('SHA256');
//     sign.update(payload);
//     sign.end();
//     return sign.sign(this.privateKey, 'base64');
//   }

//   verifyToken(req, res, next) {
//     const token = this.getToken(req);

//     if (this.publicRoutes.includes(req.path)) {
//       console.log("Not Needed !")
//       return next();
//     }

//     if (this.headerAuthRoutes.includes(req.path)) {
//       if (!token) {
//         return res.status(401).send('Access Denied: No Token Provided (Header Auth)!');
//       }
//       return this.verifyJwt(token, req, res, next);
//     }

//     if (!token) {
//       return res.status(401).send('Access Denied: No Token Provided!');
//     }

//     this.verifyJwt(token, req, res, next);
//   }

//   // Set token depending on if route is in headerAuthRoutes
//   getToken(req) {
//     if (this.headerAuthRoutes.includes(req.path)) {
//       return req.headers['authorization']?.split(' ')[1];
//     } else {
//       const cookies = cookie.parse(req.headers.cookie || '');
//       return cookies['jwt'];
//     }
//   }

//   verifyJwt(token, req, res, next) {
//     jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
//       if (err || !decoded) {
//         return res.status(403).send('Invalid Token: JWT Verification');
//       }
//       req.headers['x-user-email'] = decoded.email;
//       next();
//     });
//   }

// }

// module.exports = Middleware;