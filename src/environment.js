/**
 * Title: Environment setup
 * Description: Configuration environment related things
 * Author: Samin Yasar
 * Date: 25/October/2021
 */

// Dependencies

// Module scaffolding
const environment = {};

// Environment related variables
environment.development = {
    port: 3000,
    envName: "Development",
};

environment.production = {
    port: 8080,
    envName: "Production",
};

// Determine which environment was passed
const currentEnvironment =
    typeof process.env.NODE_ENV === "string" ? process.env.NODE_ENV : "development";

// Check if the given environment value will not appear
const environmentToExport =
    typeof environment[currentEnvironment] === "object"
        ? environment[currentEnvironment]
        : environment.development;

// Export corresponding environment object
module.exports = environmentToExport;
