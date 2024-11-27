const jwt = require('jsonwebtoken');
const cookie = require('cookie');

module.exports = (publicKey) => {
  const publicRoutes = [
    '/login',
    '/password-reset',
    '/register',
    '/reset',
    '/forgot-password',
    '/forgot',
    '/',
    '/message',
    '/favicon.ico',
  ];

  const headerAuthRoutes = ['/reset-password', '/password-reset'];

  return (req, res, next) => {
    const cookies = cookie.parse(req.headers.cookie || '');
    let token = cookies['jwt'];

    // Skip JWT verification for public routes
    if (publicRoutes.includes(req.path)) {
      return next();
    }

    // Check for token in headers for specific routes
    if (headerAuthRoutes.includes(req.path)) {
      token = req.headers['authorization']?.split(' ')[1];
      if (!token) {
        console.log('Access Denied: No Token Provided in header');
        return res.status(401).send('Access Denied: No Token Provided!');
      }
    }

    // If no token is found
    if (!token) {
      console.log('Access Denied: No Token Provided in cookies');
      return res.status(401).send('Access Denied: No Token Provided!');
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err || !decoded) {
        console.log('Invalid Token');
        return res.status(403).send('Invalid Token');
      }
      req.headers['x-user-email'] = decoded.email;
      next();
    });
  };
};
