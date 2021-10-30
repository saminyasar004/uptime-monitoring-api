/**
 * Title: Utilities
 * Description: Important utility functions
 * Author: Samin Yasar
 * Date: 27/October/2021
 */

// Dependencies
const crypto = require("crypto");
const config = require("./config");

// Module scaffolding
const utilities = {};

/**
 * Parse JSON string into a valid javascript object
 *
 * @param {JSON} jsonString - The valid json string data
 * @returns {Object} - The valid javascript object
 */
utilities.parseJSON = (jsonString) => {
    let output;
    try {
        output = JSON.parse(jsonString);
    } catch {
        output = {};
    }
    return output;
};

/**
 * Encrypt a string
 *
 * @param {String} str - The exact string to be encrypted
 * @returns {String} - The encrypted result of the passes string
 */
utilities.encrypt = (str) => {
    if (typeof str === "string" && str.trim().length > 0) {
        return crypto.createHmac("sha256", config.secretKey).update(str).digest("hex");
    }
    return null;
};

/**
 * Create a random string according to passes string length
 *
 * @param {Number} strLen - The length of the string
 * @returns {String} - A random string with `strLen` length;
 */
utilities.createRandomString = (len) => {
    const strLen = typeof len === "number" && len >= 10 ? len : 10;
    const acceptedCharacters = "abcdefghijklmnopqrstuvwxyz1234567890";
    let randomCharacters = "";
    for (let i = 1; i <= strLen; i += 1) {
        randomCharacters +=
            acceptedCharacters[Math.floor(Math.random() * acceptedCharacters.length)];
    }
    return randomCharacters;
};

// Export module
module.exports = utilities;
