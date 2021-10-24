/**
 * Title: Uptime monitoring application
 * Description: A RESTful API to monitor up or down time of user defined links
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const http = require("http");

const { handle: reqResHandler } = require("./src/reqResHandler");

// Module scaffolding
const app = {};

// Configuration
app.config = {
    port: 3000,
};

// Defination of the init function
app.init = () => {
    // Create server
    const server = http.createServer(reqResHandler);

    // Listen the server
    server.listen(app.config.port, () => {
        console.log(`Listening on port: ${app.config.port}.`);
    });
};

// Initialize app
app.init();
