// server.js
const express = require('express');
const fs = require('fs');
const verifyToken = require('./verifyToken');
const signRequest = require('./signRequest');
const routes = require('./routes');

class Server {
  constructor(port) {
    this.app = express();
    this.port = port;
    this.loadKeys();
    this.setupMiddlewares();
    this.setupRoutes();
  }

  loadKeys() {
    this.publicKey = fs.readFileSync(process.env.PUBLIC_KEY_PATH || 'public.pem', 'utf8');
    this.privateKey = fs.readFileSync(process.env.PRIVATE_KEY_PATH || 'private.pem', 'utf8');
  }

  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(signRequest(this.privateKey));
    this.app.use(verifyToken(this.publicKey));
  }

  setupRoutes() {
    this.app.use('/', routes);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`API Gateway with Authentication is running on port ${this.port}`);
    });
  }
}

module.exports = Server;

