/**
 * Title: Configuration for this project
 * Description: All essential configuration for this API project
 * Author: Samin Yasar
 * Date: 27/October/2021
 */

// Dependencies

// Module scaffolding
const config = {};

// Set a secret key to encrypt user password
config.secretKey = "fksdjfhiwrywkhfdszbxcmnbriewfkhdshfbnzmc";

// Set a minimum characters length for a user token
config.minTokenLength = 10;

// Set a maximum checks for a user
config.maxChecks = 5;

// Configure the twilio
config.twilio = {
    fromPhoneNumber: "+17128827983",
    accountSid: "AC0ade43362a720ea92baa12a6e5417057",
    authToken: "7490e021bcfe599c4d8142cf038bb5b6",
    secretKey: "FnoS3SQkuvwLAeefc6Sr63awJuB3b0xh",
};

// Export module
module.exports = config;
