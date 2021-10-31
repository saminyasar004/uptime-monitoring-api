/* eslint-disable no-underscore-dangle */
/**
 * Title: Token handler
 * Description: Handle token related routes
 * Author: Samin Yasar
 * Date: 27/October/2021
 */

// Dependencies
const dataLibrary = require("../../lib/data");
const utilities = require("../../helpers/utilities");
const config = require("../../helpers/config");

// Module scaffolding
const tokenHandler = {};

// Defination of handle function
tokenHandler.handle = (requestProps, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProps.method) > -1) {
        tokenHandler._token[requestProps.method](requestProps, callback);
    } else {
        // Don't accept request
        callback(405);
    }
};

// Utilities
tokenHandler._token = {};

// Get method
tokenHandler._token.get = (requestProps, callback) => {
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length >= 0
            ? requestProps.queryStringObj.userName
            : null;
    if (userName) {
        // Lookup the token
        dataLibrary.read("tokens", userName, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenObj = utilities.parseJSON(tokenData);
                callback(200, tokenObj);
            } else {
                callback(404, {
                    error: "Your requested user's token couldn't find.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide an username to get token.",
        });
    }
};

// Post method
tokenHandler._token.post = (requestProps, callback) => {
    const userName =
        typeof requestProps.reqBody.userName === "string" &&
        requestProps.reqBody.userName.trim().length > 0
            ? requestProps.reqBody.userName
            : null;
    const password =
        typeof requestProps.reqBody.password === "string" &&
        requestProps.reqBody.password.trim().length > 0
            ? utilities.encrypt(requestProps.reqBody.password)
            : null;

    if (userName && password) {
        dataLibrary.read("users", userName, (err, readData) => {
            if (!err && readData) {
                const userData = utilities.parseJSON(readData);
                if (password === userData.password) {
                    const tokenId = utilities.createRandomString(config.minTokenLength, 20);
                    const validationTime = Date.now() + 60 * 60 * 1000;
                    const tokenObj = {
                        userName,
                        tokenId,
                        validationTime,
                    };
                    // stores the token in file system
                    dataLibrary.create("tokens", userName, tokenObj, (createError) => {
                        if (!createError) {
                            callback(200, tokenObj);
                        } else {
                            callback(500, {
                                error: "Couldn't create token file.",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "Your password was incorrect.",
                    });
                }
            } else {
                callback(400, {
                    error: "Your requested user couldn't found.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide your username and password.",
        });
    }
};

// Put method
tokenHandler._token.put = (requestProps, callback) => {
    const userName =
        typeof requestProps.reqBody.userName === "string" &&
        requestProps.reqBody.userName.trim().length >= 0
            ? requestProps.reqBody.userName
            : null;
    const extend = !!(
        typeof requestProps.reqBody.extend === "boolean" && requestProps.reqBody.extend === true
    );

    if (userName && extend) {
        dataLibrary.read("tokens", userName, (readError, readData) => {
            if (!readError && readData) {
                const tokenData = utilities.parseJSON(readData);
                if (tokenData.validationTime > Date.now()) {
                    tokenData.validationTime = Date.now() + 60 * 60 * 1000;
                    dataLibrary.update("tokens", userName, tokenData, (updateError) => {
                        if (!updateError) {
                            callback(200, {
                                message:
                                    "Successfully extend validation time of your requested user's token.",
                            });
                        } else {
                            callback(500, {
                                error: "Couldn't extend the validation time of your requested user's token.",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "Your requested user's token is already expired!",
                    });
                }
            } else {
                callback(404, {
                    error: "Your requested user's have no token.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide a username and extend value.",
        });
    }
};

// Delete method
tokenHandler._token.delete = (requestProps, callback) => {
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length >= 0
            ? requestProps.queryStringObj.userName
            : null;

    if (userName) {
        // Lookup the tokenId
        dataLibrary.read("tokens", userName, (readError, readData) => {
            if (!readError && readData) {
                dataLibrary.delete("tokens", userName, (deleteError) => {
                    if (!deleteError) {
                        callback(200, {
                            message: "Successfully deleted the user's token.",
                        });
                    } else {
                        callback(500, {
                            error: "Couldn't delete the user's token.",
                        });
                    }
                });
            } else {
                callback(404, {
                    error: "Your requested user's have no token.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide a username to delete that token.",
        });
    }
};

// Verify token
tokenHandler._token.verify = (tokenId, userName, callback) => {
    dataLibrary.read("tokens", userName, (err, data) => {
        if (!err && data) {
            const tokenData = utilities.parseJSON(data);
            if (tokenData.tokenId === tokenId && tokenData.validationTime > Date.now()) {
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false);
        }
    });
};

// Export module
module.exports = tokenHandler;
