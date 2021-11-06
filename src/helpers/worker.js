/**
 * Title: Worker handler
 * Description: Worker related codes
 * Author: Samin Yasar
 * Date: 01/November/2021
 */

// Dependencies
const dataLibrary = require("../lib/data");

// Module scaffolding
const worker = {};

// Lookup all the checks from database
worker.gatherAllChecks = () => {};

// timer to execute the worker process once per minute
worker.loop = () => {
    setInterval(() => {
        worker.gatherAllChecks();
    }, 1000 * 60);
};

// Initilize function definition for the worker
worker.init = () => {
    // Execute all the checks
    worker.gatherAllChecks();

    // Call the loop so that check continue
    worker.loop();
};

// Export module
module.exports = worker;
