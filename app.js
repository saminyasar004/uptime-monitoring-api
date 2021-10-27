/**
 * Title: Uptime monitoring application
 * Description: A RESTful API to monitor up or down time of user defined links
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const http = require("http");
const { handle: reqResHandler } = require("./src/helpers/reqResHandler");
const environment = require("./src/helpers/environment");

// Module scaffolding
const app = {};

// Configuration
app.config = {};

// Defination of the init function
app.init = () => {
    // Create server
    const server = http.createServer(reqResHandler);

    // Listen the server
    server.listen(environment.port, () => {
        console.log(`Listening on port: ${environment.port}.`);
    });
};

// Initialize app
app.init();
