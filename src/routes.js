/**
 * Title: Route handler
 * Description: Handle all about routing
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const { handle: notFoundHandler } = require("./handlers/routesHandler/notFoundHandler");
const { handle: sampleHandler } = require("./handlers/routesHandler/sampleHandler");

// Routes object
const routes = {
    sample: sampleHandler,
    notFound: notFoundHandler,
};

// Export module
module.exports = routes;
