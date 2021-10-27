/**
 * Title: Request & response handler
 * Description: Handle everything about request and response
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const url = require("url");
const { StringDecoder } = require("string_decoder");
const routes = require("./routes");
const utilities = require("./utilities");

// Module scaffolding
const reqResHandler = {};

// Defination of handler function
reqResHandler.handle = (req, res) => {
    // request handling
    const parsedUrl = url.parse(req.url, true);
    const pathName = parsedUrl.pathname.trim().replace(/^\/+|\/+$/gi, "");
    const method = req.method.toLowerCase();
    const { query: queryStringObj } = parsedUrl;
    const { headers: headersObj } = req;
    const decoder = new StringDecoder("utf-8");
    let reqBody = "";
    const requestProps = {
        parsedUrl,
        pathName,
        method,
        queryStringObj,
        headersObj,
    };
    const chosenHandler = routes[pathName] ? routes[pathName] : routes.notFound;

    req.on("data", (buffer) => {
        reqBody += decoder.write(buffer);
    });
    req.on("end", () => {
        reqBody += decoder.end();
        requestProps.reqBody = utilities.parseJSON(reqBody);

        chosenHandler(requestProps, (status, payload) => {
            const statusCode = typeof status === "number" ? status : 500;
            const payLoad = typeof payload === "object" ? payload : {};
            const payLoadString = JSON.stringify(payLoad);

            // response handling
            res.writeHead(statusCode, { "Content-Type": "application.json" });
            res.end(payLoadString);
        });
    });
};

// Export module
module.exports = reqResHandler;
