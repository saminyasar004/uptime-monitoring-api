/* eslint-disable no-underscore-dangle */
/**
 * Title: Token handler
 * Description: Handle token related routes
 * Author: Samin Yasar
 * Date: 24/October/2021
 */

// Dependencies
const dataLibrary = require("../../lib/data");
const utilities = require("../../helpers/utilities");

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
    const tokenId =
        typeof requestProps.queryStringObj.tokenId === "string" &&
        requestProps.queryStringObj.tokenId.trim().length >= 10
            ? requestProps.queryStringObj.tokenId
            : null;
    if (tokenId) {
        // Lookup the token
        dataLibrary.read("tokens", tokenId, (err, tokenData) => {
            if (!err && tokenData) {
                const tokenObj = utilities.parseJSON(tokenData);
                callback(200, tokenObj);
            } else {
                callback(404, {
                    error: "Your requested token couldn't find.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide a token.",
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
                    const tokenId = utilities.createRandomString(20);
                    const validationTime = Date.now() + 60 * 60 * 1000;
                    const tokenObj = {
                        userName,
                        tokenId,
                        validationTime,
                    };
                    // stores the token in file system
                    dataLibrary.create("tokens", tokenId, tokenObj, (createError) => {
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
    const tokenId =
        typeof requestProps.reqBody.tokenId === "string" &&
        requestProps.reqBody.tokenId.trim().length >= 10
            ? requestProps.reqBody.tokenId
            : null;
    const extend = !!(
        typeof requestProps.reqBody.extend === "boolean" && requestProps.reqBody.extend === true
    );

    if (tokenId && extend) {
        dataLibrary.read("tokens", tokenId, (readError, readData) => {
            if (!readError && readData) {
                const tokenData = utilities.parseJSON(readData);
                if (tokenData.validationTime > Date.now()) {
                    tokenData.validationTime = Date.now() + 60 * 60 * 1000;
                    dataLibrary.update("tokens", tokenId, tokenData, (updateError) => {
                        if (!updateError) {
                            callback(200, {
                                message:
                                    "Successfully extend validation time of your requested token.",
                            });
                        } else {
                            callback(500, {
                                error: "Couldn't extend the validation time of your requested token.",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "Your requested token is invalid.",
                    });
                }
            } else {
                callback(404, {
                    error: "Your requested token couldn't find.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide a token id and extend value.",
        });
    }
};

// Delete method
tokenHandler._token.delete = (requestProps, callback) => {
    const tokenId =
        typeof requestProps.queryStringObj.tokenId === "string" &&
        requestProps.queryStringObj.tokenId.trim().length >= 10
            ? requestProps.queryStringObj.tokenId
            : null;

    if (tokenId) {
        // Lookup the tokenId
        dataLibrary.read("tokens", tokenId, (readError, readData) => {
            if (!readError && readData) {
                dataLibrary.delete("tokens", tokenId, (deleteError) => {
                    if (!deleteError) {
                        callback(200, {
                            message: "Successfully deleted the token.",
                        });
                    } else {
                        callback(500, {
                            error: "Couldn't delete the token.",
                        });
                    }
                });
            } else {
                callback(404, {
                    error: "Your requested token couldn't find.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide a token.",
        });
    }
};

// Verify token
tokenHandler._token.verify = (tokenId, userName, callback) => {
    dataLibrary.read("tokens", tokenId, (err, data) => {
        if (!err && data) {
            const tokenData = utilities.parseJSON(data);
            if (tokenData.userName === userName && tokenData.validationTime > Date.now()) {
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
