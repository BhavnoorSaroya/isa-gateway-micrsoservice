// const express = require('express');
// const Middleware = require('./middleware');
// const Routes = require('./routes');

// class Server {
//   constructor(port) {
//     this.app = express();
//     this.port = port;
//     this.middleware = new Middleware();
//     this.routeConfig = new Routes(this.middleware);
//     this.setupMiddlewares();
//     this.setupRoutes();
//   }

//   setupMiddlewares() {
//     this.app.use((req, res, next) => {
//       console.log(`Incoming request: ${req.method} ${req.url}`);
//       next();
//     });
//     this.app.use(express.json());
//     this.app.use(this.middleware.signRequest.bind(this.middleware));
//     this.app.use(this.middleware.verifyToken.bind(this.middleware));
//   }

//   setupRoutes() {
//     this.routeConfig.configureRoutes(this.app);
//   }

//   start() {
//     this.app.listen(this.port, () => {
//       console.log(`API Gateway with Authentication is running on port ${this.port}`);
//     });
//   }
// }

// module.exports = Server;