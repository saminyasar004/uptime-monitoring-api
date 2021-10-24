/**
 * Title: Sample page handler
 * Description: Return the corresponding data for sample page
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies

// Module scaffolding
const sampleHandler = {};

// Defination of handle function
sampleHandler.handle = (requestProps, callback) => {
    console.log(requestProps);

    callback(200, {
        message: "This is sample page.",
    });
};

// Export module
module.exports = sampleHandler;
