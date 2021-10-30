/* eslint-disable no-underscore-dangle */
/**
 * Title: User handler
 * Description: Handle user related routes
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const dataLibrary = require("../../lib/data");
const utilities = require("../../helpers/utilities");
const {
    _token: { verify: verifyToken },
} = require("./tokenHandler");

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
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length > 0
            ? requestProps.queryStringObj.userName
            : null;
    if (userName) {
        // Verify the token
        const tokenId =
            typeof requestProps.headersObj.tokenid === "string" &&
            requestProps.headersObj.tokenid.trim().length >= 10
                ? requestProps.headersObj.tokenid
                : null;

        if (tokenId) {
            verifyToken(tokenId, userName, (verified) => {
                if (verified) {
                    // lookup the user
                    dataLibrary.read("users", userName, (err, user) => {
                        if (!err && user) {
                            const userData = utilities.parseJSON(user);
                            // remove the password from the userData object for security
                            delete userData.password;
                            callback(200, userData);
                        } else {
                            callback(404, {
                                error: "Your requested user's data couldn't find.",
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: "Authentication failed for incorrect token.",
                    });
                }
            });
        } else {
            callback(400, {
                error: "Please provide a token contains 10 characters.",
            });
        }
    } else {
        callback(400, {
            error: "Please provide an username.",
        });
    }
};

// Post method
userHandler._users.post = (requestProps, callback) => {
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
        dataLibrary.read("users", userName, (readError) => {
            if (readError) {
                // The username & phone number is valid
                const userObj = {
                    firstName,
                    lastName,
                    userName,
                    phoneNumber,
                    password,
                    tosAgreement,
                };
                dataLibrary.create("users", userName, userObj, (createError) => {
                    if (!createError) {
                        // User create done!
                        callback(200, {
                            message: `Successfully created a user data.`,
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
                    error: "The username maybe already taken. Please use another one.",
                });
            }
        });
    } else {
        callback(400, {
            error: "There is a problem in your request.",
        });
    }
};

// Put method
userHandler._users.put = (requestProps, callback) => {
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
    if (userName) {
        if (firstName || lastName || password) {
            // Verify the token
            const tokenId =
                typeof requestProps.headersObj.tokenid === "string" &&
                requestProps.headersObj.tokenid.trim().length >= 10
                    ? requestProps.headersObj.tokenid
                    : null;

            if (tokenId) {
                verifyToken(tokenId, userName, (verified) => {
                    if (verified) {
                        // lookup the user
                        dataLibrary.read("users", userName, (readError, user) => {
                            if (!readError && user) {
                                const userData = utilities.parseJSON(user);
                                if (firstName) {
                                    userData.firstName = firstName;
                                }
                                if (lastName) {
                                    userData.lastName = lastName;
                                }
                                if (password) {
                                    userData.password = password;
                                }
                                if (phoneNumber) {
                                    userData.phoneNumber = phoneNumber;
                                }
                                dataLibrary.update("users", userName, userData, (updateError) => {
                                    if (!updateError) {
                                        callback(200, {
                                            message: "Successfully updated user data.",
                                        });
                                    } else {
                                        callback(500, {
                                            error: "There is an error occurs to update user data.",
                                        });
                                    }
                                });
                            } else {
                                callback(405, {
                                    error: "Your requested user couldn't find.",
                                });
                            }
                        });
                    } else {
                        callback(403, {
                            error: "Authentication failed for incorrect token.",
                        });
                    }
                });
            } else {
                callback(400, {
                    error: "Please provide a token contains 10 characters.",
                });
            }
        } else {
            callback(400, {
                error: "Please provide the data which you want to update.",
            });
        }
    } else {
        callback(400, {
            error: "Your requested username couldn't found. Please try again!",
        });
    }
};

// Delete method
userHandler._users.delete = (requestProps, callback) => {
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length > 0
            ? requestProps.queryStringObj.userName
            : null;
    if (userName) {
        // Verify the token
        const tokenId =
            typeof requestProps.headersObj.tokenid === "string" &&
            requestProps.headersObj.tokenid.trim().length >= 10
                ? requestProps.headersObj.tokenid
                : null;

        if (tokenId) {
            verifyToken(tokenId, userName, (verified) => {
                if (verified) {
                    // Lookup the user
                    dataLibrary.read("users", userName, (readError, readData) => {
                        if (!readError && readData) {
                            dataLibrary.delete("users", userName, (userDeleteError) => {
                                if (!userDeleteError) {
                                    // callback(200, {
                                    //     message: "Successfully deleted the user.",
                                    // });
                                    dataLibrary.delete("tokens", tokenId, (tokenDeleteError) => {
                                        if (!tokenDeleteError) {
                                            callback(200, {
                                                message:
                                                    "Successfully deleted the user & user's token.",
                                            });
                                        } else {
                                            callback(500, {
                                                error: "Couldn't delete the user's token.",
                                            });
                                        }
                                    });
                                } else {
                                    callback(500, {
                                        error: "Couldn't delete the user.",
                                    });
                                }
                            });
                        } else {
                            callback(400, {
                                error: "Your requested user couldn't found.",
                            });
                        }
                    });
                } else {
                    callback(403, {
                        error: "Authentication failed for incorrect token.",
                    });
                }
            });
        } else {
            callback(400, {
                error: "Please provide a token contains 10 characters.",
            });
        }
    } else {
        callback(400, {
            error: "Please provide an username.",
        });
    }
};

// Export module
module.exports = userHandler;
