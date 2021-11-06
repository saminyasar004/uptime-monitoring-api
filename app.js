/**
 * Title: Initial file
 * Description: Project initial file to starts server and workers
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const server = require("./src/helpers/server");
const worker = require("./src/helpers/worker");

// Module scaffolding
const app = {};

// Definition of the initialize function of the app
app.init = () => {
    // Start the server
    server.init();

    // Start the workers
    worker.init();
};

// Initialize the app
app.init();
