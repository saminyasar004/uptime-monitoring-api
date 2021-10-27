/**
 * Title: Not found handler
 * Description: Return 404 Not found response
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies

// Module scaffolding
const notFoundHandler = {};

// Defination of handle function
notFoundHandler.handle = (requestProps, callback) => {
    console.log(requestProps);

    callback(404, {
        error: "Not found!",
    });
};

// Export module
module.exports = notFoundHandler;
