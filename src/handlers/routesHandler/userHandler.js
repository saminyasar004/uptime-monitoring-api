/**
 * Title: User handler
 * Description: Handle user CRUD
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const dataLibrary = require("../../lib/data");
const utilities = require("../../helpers/utilities");

// Module scaffolding
const userHandler = {};

// Defination of handle function
userHandler.handle = (requestProps, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProps.method) > -1) {
        userHandler._users[requestProps.method](requestProps, callback);
    } else {
        // Don't accept request
        callback(405);
    }
};

// Utilities
userHandler._users = {};

// Get method
userHandler._users.get = (requestProps, callback) => {
    const firstName =
        typeof requestProps.reqBody.firstName === "string" &&
        requestProps.reqBody.firstName.trim().length > 0
            ? requestProps.reqBody.firstName
            : null;
    const lastName =
        typeof requestProps.reqBody.lastName === "string" &&
        requestProps.reqBody.lastName.trim().length > 0
            ? requestProps.reqBody.lastName
            : null;
    const userName =
        typeof requestProps.reqBody.userName === "string" &&
        requestProps.reqBody.userName.trim().length > 0
            ? requestProps.reqBody.userName
            : null;
    const phoneNumber =
        typeof requestProps.reqBody.phoneNumber === "string" &&
        requestProps.reqBody.phoneNumber.trim().length === 11
            ? requestProps.reqBody.phoneNumber
            : null;
    const password =
        typeof requestProps.reqBody.password === "string" &&
        requestProps.reqBody.password.trim().length > 0
            ? utilities.encrypt(requestProps.reqBody.password)
            : null;
    const tosAgreement =
        typeof requestProps.reqBody.tosAgreement === "boolean"
            ? requestProps.reqBody.tosAgreement
            : null;

    if (firstName && lastName && userName && phoneNumber && password && tosAgreement) {
        // make sure that the user doesn't exists in our file system
        dataLibrary.read("users", `${userName}_${phoneNumber}`, (err, user) => {
            if (err) {
                // The username & phone number is valid
                const userObj = {
                    firstName,
                    lastName,
                    userName,
                    phoneNumber,
                    password,
                    tosAgreement,
                };
                dataLibrary.create("users", `${userName}_${phoneNumber}`, userObj, (err) => {
                    if (!err) {
                        // User create done!
                        callback(200, {
                            message: `Successfully created ${userName}'s user data.`,
                        });
                    } else {
                        // couldn't create a user file
                        callback(500, {
                            error: "Couldn't create a user.",
                        });
                    }
                });
            } else {
                // The username or phone number is not valid
                callback(405, {
                    error: "The username or phone number maybe already taken. Please use another one.",
                });
            }
        });
    } else {
        callback(400, {
            error: "There is a problem in your request.",
        });
    }
};

// Post method
userHandler._users.post = (requestProps, callback) => {
    // Code here
};

// Put method
userHandler._users.put = (requestProps, callback) => {
    callback(200, {
        message: "This is from put method",
    });
};

// Delete method
userHandler._users.delete = (requestProps, callback) => {
    callback(200, {
        message: "This is from delete method",
    });
};

// Export module
module.exports = userHandler;
