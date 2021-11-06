/**
 * Title: Server management
 * Description: Server related stuffs for this project
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const http = require("http");
const { handle: reqResHandler } = require("./reqResHandler");
const environment = require("./environment");

// Module scaffolding
const server = {};

// Configuration
server.config = {};

// Defination of the init function
server.init = () => {
    // Create a http server
    const httpServer = http.createServer(reqResHandler);

    // Listen the server
    httpServer.listen(environment.port, () => {
        console.log(`Listening on port: ${environment.port}.`);
    });
};

// Export module
module.exports = server;

// // Initialize app
// server.init();
