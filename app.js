require('dotenv').config();
const Server = require('./modules/server');

const port = process.env.PORT || 8000;
const server = new Server(port);

server.start();