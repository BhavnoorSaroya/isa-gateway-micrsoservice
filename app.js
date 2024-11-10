const express = require('express');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const crypto = require('crypto');
const cookie = require('cookie');
const e = require('express');
const { json } = require('body-parser');

const app = express();
const publicKey = fs.readFileSync('public.pem'); // Load your public key
const privateKey = fs.readFileSync('private_signer_key.pem', 'utf8');
const testingMode = false; // Set to true if running in testing mode

// URLs for services
const UPMS_URL = testingMode ? 'http://localhost:5001' : 'https://isa-database-microservice.onrender.com';
const AUTH_URL = testingMode ? 'http://localhost:5000' : 'https://auth-microservice-of4o.onrender.com';
const FRONTEND_URL = testingMode ? 'http://localhost:8080' : 'https://isa-facade.azurewebsites.net';
const AI_URL = testingMode ? 'http://localhost:8081' : 'https://coming-soon.azurewebsites.net';

// List of public routes that don't need authentication
const publicRoutes =   ['/login',
                        '/password-reset', 
                        '/register',
                        '/reset',
                        '/forgot-password',
                        '/forgot',
                        '/',
                        '/message',
                        '/favicon.ico',
                    ];
                        
// List of routes that we allow auth within header rather than cookie
const headerAuthRoutes = ['/reset-password', '/password-reset'];

// Static files do not require JWT verification
app.use('/static', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/static': '/static' },
}));


// Middleware for JWT validation
function verifyToken(req, res, next) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies['jwt'];
    // Skip JWT verification for public routes
    if (publicRoutes.includes(req.path)) {
        // console.log('public route');
        return next();
    }
    if (headerAuthRoutes.includes(req.path)) { //only check for the header if the route is in the headerAuthRoutes
        console.log('header auth route');
        // return next();
        const token = req.headers['authorization']?.split(' ')[1];
        // console.log(token);
        if (!token) {
            console.log('no token entered here');
            return res.status(401).send('Access Denied: No Token Provided! this one, this three');
        }

        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
            if (err) {
                console.log('invalid token');
                return res.status(403).send('Invalid Token');
                
            }
            
            if (decoded == undefined) {
                return res.status(403).send('Invalid Token');
            }
            // console.log("made it to this point, token:", token);
            req.headers['x-user-email'] = decoded.email; // Include the email from the JWT payload
            const email = decoded.email;
            // console.log('verified email is: ' + decoded.email);
            
        });
        // console.log('final print');
        // console.log(email);
        return next();
    } else{
        console.log('standard auth route');
        
    }

    
   
    if (!token) {
        return res.status(401).send('Access Denied: No Token Provided! this two');
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid Token');
        }

        req.headers['x-user-email'] = decoded.email; // Include the email from the JWT payload
        // console.log('verified email is: ' + decoded.email);
        next();
    });
}

// Middleware to add a signature to each request
function signRequest(payload) {
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'base64'); // Base64-encoded signature
}

app.use((req, res, next) => {
    // console.log('Request:', JSON.stringify(req.headers));
    const payload = req.method + req.url;
    // console.log('req body:', (JSON.stringify(req.body)));
    // console.log('payload:', payload);
    const signature = signRequest(payload);
    req.headers['x-gateway-signature'] = signature;
    next();
});

// Use JWT verification middleware for routes except the public ones
app.use(verifyToken);
// app.use(express.json());

// Proxy routes to the appropriate services
app.get('/login', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/login': '/login' },
}));

app.post('/login', createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/login': '/login' },
}));

app.post('/register', createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/register': '/register' },
}));

app.post('/forgot-password', createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/forgot-password': '/forgot-password' },
}));

//this route is used for testing only
app.get('/protected', createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { '^/protected': '/protected' },
}));


//routes to facade service
app.get("/dashboard", createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/dashboard': '/dashboard' },
}));

app.get("/password-reset", createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/password-reset': '/password-reset' },
}));

app.get('/forgot', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/forgot': '/forgot' },
}));

app.get('/', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/': '/' },
}));

app.get('/register', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/register': '/register' },
}));

app.get('/message', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/message': '/message'},
}));


app.post('/reset-password', createProxyMiddleware({
    target: UPMS_URL,
    changeOrigin: true,
}));

app.get('/favicon.ico', createProxyMiddleware({
    target: FRONTEND_URL,
    changeOrigin: true,
    pathRewrite: { '^/favicon.ico': '/favicon.ico' },
}));


// Start the server
app.listen(8080, () => {
    console.log('API Gateway with Authentication is running on http://localhost:3000');
});