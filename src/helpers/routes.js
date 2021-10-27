/**
 * Title: Route handler
 * Description: Handle all about routing
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const { handle: userHandler } = require("../handlers/routesHandler/userHandler");
const { handle: sampleHandler } = require("../handlers/routesHandler/sampleHandler");
const { handle: notFoundHandler } = require("../handlers/routesHandler/notFoundHandler");

// Routes object
const routes = {
    user: userHandler,
    sample: sampleHandler,
    notFound: notFoundHandler,
};

// Export module
module.exports = routes;
