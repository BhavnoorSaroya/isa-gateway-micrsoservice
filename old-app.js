const express = require('express');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const publicKey = fs.readFileSync('public.pem'); // Load your public key
//for now we are using the same private key as the auth service, this will be changed for final deployment. 
const privateKey = fs.readFileSync('private_signer_key.pem', 'utf8');
const testingMode = true; // Set to true if running in testing mode


if (!testingMode){
    const UPMS_URL = 'https://isa-upms.azurewebsites.net'; // URL of the User Profile Management Service
    const AUTH_URL = 'https://isa-safer-cadseffbdhf8dwdy.canadacentral-01.azurewebsites.net'; // URL of the Authentication Service
    const FRONTEND_URL = 'https://isa-facade.azurewebsites.net'; // URL of the Frontend Service
    const AI_URL = 'https://coming-soon.azurewebsites.net'; // URL of the AI Service
} else {
    const UPMS_URL = 'http://localhost:5000'; // URL of the User Profile Management Service
    const AUTH_URL = 'http://localhost:5001'; // URL of the Authentication Service
    const FRONTEND_URL = 'http://localhost:8080'; // URL of the Frontend Service
    const AI_URL = 'http://localhost:8081'; // URL of the AI Service
}

function signRequest(payload) {
    //each request gets a signature from a private key, this is used to verify the request on the recieiving services. 
    const sign = crypto.createSign('SHA256');
    sign.update(payload);
    sign.end();
    return sign.sign(privateKey, 'base64'); // Base64-encoded signature
}


// Middleware for JWT validation
function verifyToken(req, res, next) {
    const token = req.cookies['jwt']; // Look for the JWT token in the HTTP-only cookie

    if (!token) {
        // return res.status(401).send('Access Denied: No Token Provided!');
        // return res.redirect('http://auth-service-url/login'); // Redirect to login page
    }

    jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
        if (err) {
            return res.status(403).send('Invalid Token');
        }

        // // Add decoded user info to request headers
        // req.headers['x-user-id'] = decoded.userId;  // Customize based on your JWT payload
        // req.headers['x-user-role'] = decoded.role;   // Include other relevant fields as needed
        req.headers['x-user-email'] = decoded.email;  // Include the email from the JWT payload

        next();
    });
}

// function verifyTokenFromAuthHeader(req, res, next) {
//     const token = req.headers['authorization']?.split(' ')[1];

//     if (!token) {
//         return res.status(401).send('Access Denied: No Token Provided!');
//     }

//     jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (err, decoded) => {
//         if (err) {
//             return res.status(403).send('Invalid Token');
//         }

//         // Add decoded user info to request headers
//         req.headers['x-user-email'] = decoded.email;  // Include the email from the JWT payload
//         next();
//     });
// }

// Middleware to add signature to request
app.use((req, res, next) => {
    const payload = req.method + req.url + JSON.stringify(req.body);
    const signature = signRequest(payload);
    req.headers['x-gateway-signature'] = signature;
    next();
});


// Use verification middleware before routing to services
app.use(verifyToken);


// Example route to Service 1
app.use('/service1', createProxyMiddleware({
    target: 'http://service1-url',
    changeOrigin: true,
    pathRewrite: { '^/service1': '' },
}));

app.use

// Additional service routes...

app.listen(3000, () => {
    console.log('API Gateway with Authentication is running on http://localhost:3000');
});
