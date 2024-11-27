require('dotenv').config();
const Server = require('./modules/server');

const PORT = process.env.PORT || 8080;
const server = new Server(PORT);
server.start();
