/**
 * Title: Uptime monitoring application
 * Description: A RESTful API to monitor up or down time of user defined links
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const http = require("http");

const { handle: reqResHandler } = require("./src/reqResHandler");
const environment = require("./src/environment");
const dataLibrary = require("./src/lib/data");

// Module scaffolding
const app = {};

// Configuration
app.config = {};

// ? Testing dataLibrary
// TODO: remove it later
// dataLibrary.create("samin", "facebook", { username: "saminyasar004" }, (err) => {
//     if (!err) {
//         console.log("Successfully created file");
//     } else {
//         console.log(err);
//     }
// });
// dataLibrary.update("samin", "facebook", { fname: "mahmud" }, (err) => {
//     if (!err) {
//         console.log("Successfully updated");
//     } else {
//         console.log(err);
//     }
// });
// dataLibrary.delete("samin", "facebook", (err) => {
//     if (!err) {
//         console.log("successfully deleted");
//     } else {
//         console.log(err);
//     }
// });

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
