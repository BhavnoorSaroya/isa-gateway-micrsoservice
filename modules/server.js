const express = require('express');
const cookieParser = require('cookie-parser');
const Middleware = require('./middleware');
const RouteConfig = require('./routeConfig');

class Server {
  constructor(port) {
    this.app = express();
    this.port = port;
    this.middleware = new Middleware();
    this.routeConfig = new RouteConfig(this.middleware);
    this.setupMiddlewares();
    this.setupRoutes();
  }

  setupMiddlewares() {
    this.app.use(cookieParser());
    this.app.use(express.json());
    this.app.use(this.middleware.signRequest.bind(this.middleware));
    this.app.use(this.middleware.verifyToken.bind(this.middleware));
  }

  setupRoutes() {
    this.routeConfig.configureRoutes(this.app);
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`API Gateway with Authentication is running on port ${this.port}`);
    });
  }
}

module.exports = Server;
