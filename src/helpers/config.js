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

// Export module
module.exports = config;
