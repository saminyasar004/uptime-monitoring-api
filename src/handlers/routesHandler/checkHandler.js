/* eslint-disable no-underscore-dangle */
/**
 * Title: Check handler
 * Description: Handle user defined checks
 * Author: Samin Yasar
 * Date: 30/October/2021
 */

// Dependencies
const dataLibrary = require("../../lib/data");
const utilities = require("../../helpers/utilities");
const config = require("../../helpers/config");
const {
    _token: { verify: verifyToken },
} = require("./tokenHandler");

// Module scaffolding
const checkHandler = {};

// Defination of handle function
checkHandler.handle = (requestProps, callback) => {
    const acceptedMethods = ["get", "post", "put", "delete"];
    if (acceptedMethods.indexOf(requestProps.method) > -1) {
        checkHandler._check[requestProps.method](requestProps, callback);
    } else {
        // Don't accept request
        callback(405);
    }
};

// Utilities
checkHandler._check = {};

// Get method
checkHandler._check.get = (requestProps, callback) => {
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length > 0
            ? requestProps.queryStringObj.userName
            : null;
    if (userName) {
        // Lookup the user
        dataLibrary.read("users", userName, (userReadError, userReadData) => {
            if (!userReadError && userReadData) {
                // get the token id from request header
                const tokenId =
                    typeof requestProps.headersObj.tokenid === "string" &&
                    requestProps.headersObj.tokenid.trim().length >= config.minTokenLength
                        ? requestProps.headersObj.tokenid
                        : null;
                if (tokenId) {
                    // verify the token
                    verifyToken(tokenId, userName, (verified) => {
                        if (verified) {
                            // Lookup the checks for requested user
                            dataLibrary.read(
                                "checks",
                                userName,
                                (checksReadError, checksReadData) => {
                                    if (!checksReadError && checksReadData) {
                                        const checksData = utilities.parseJSON(checksReadData);
                                        callback(200, checksData);
                                    } else {
                                        callback(404, {
                                            error: "Your requested user's have not any check.",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(403, {
                                error: "Authentication failed for incorrect token.",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: `Please provide a token contains ${config.minTokenLength} characters.`,
                    });
                }
            } else {
                callback(404, {
                    error: "Your username couldn't found!",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide your username.",
        });
    }
};

// Post method
checkHandler._check.post = (requestProps, callback) => {
    // validate user input
    const userName =
        typeof requestProps.reqBody.userName === "string" &&
        requestProps.reqBody.userName.trim().length > 0
            ? requestProps.reqBody.userName
            : null;
    const protocol =
        typeof requestProps.reqBody.protocol === "string" &&
        ["http", "https"].indexOf(requestProps.reqBody.protocol.toLowerCase().trim()) > -1
            ? requestProps.reqBody.protocol
            : null;
    const url =
        typeof requestProps.reqBody.url === "string" && requestProps.reqBody.url.trim().length > 0
            ? requestProps.reqBody.url
            : null;
    const method =
        typeof requestProps.reqBody.method === "string" &&
        ["get", "post", "put", "delete"].indexOf(requestProps.reqBody.method.toLowerCase().trim()) >
            -1
            ? requestProps.reqBody.method.toLowerCase().trim()
            : null;
    const successCodes =
        typeof requestProps.reqBody.successCodes === "object" &&
        Array.isArray(requestProps.reqBody.successCodes)
            ? requestProps.reqBody.successCodes
            : null;
    const timeoutSeconds =
        typeof requestProps.reqBody.timeoutSeconds === "number" &&
        requestProps.reqBody.timeoutSeconds % 1 === 0 &&
        requestProps.reqBody.timeoutSeconds >= 1 &&
        requestProps.reqBody.timeoutSeconds <= 5
            ? requestProps.reqBody.timeoutSeconds
            : null;
    const tokenId =
        typeof requestProps.headersObj.tokenid === "string" &&
        requestProps.headersObj.tokenid.trim().length >= config.minTokenLength
            ? requestProps.headersObj.tokenid
            : null;
    if (userName && protocol && url && method && successCodes && timeoutSeconds && tokenId) {
        // verify the token
        verifyToken(tokenId, userName, (verified) => {
            if (verified) {
                // Lookup the user's checks
                dataLibrary.read("users", userName, (readUserError, readUserData) => {
                    if (!readUserError && readUserData) {
                        const userData = utilities.parseJSON(readUserData);
                        // ? checks array for the user file
                        const userChecks =
                            typeof userData.checks === "object" && Array.isArray(userData.checks)
                                ? userData.checks
                                : [];
                        const checkId = utilities.createRandomString(config.minTokenLength, 20);
                        const checkObj = {
                            userName,
                            checkId,
                            protocol,
                            url,
                            method,
                            successCodes,
                            timeoutSeconds,
                        };

                        if (userChecks.length === 0) {
                            // ? checks array for the checks file
                            const checks = [];
                            checks.push(checkObj);
                            checkHandler._check.createNewCheck(userName, { checks }, (created) => {
                                if (created) {
                                    // update the user's checks list at user table
                                    userChecks.push(checkId);
                                    userData.checks = [...userChecks];
                                    dataLibrary.update(
                                        "users",
                                        userName,
                                        userData,
                                        (updateError) => {
                                            if (!updateError) {
                                                callback(200, checkObj);
                                            } else {
                                                callback(500, {
                                                    error: "Couldn't create a check for your requested user.",
                                                });
                                            }
                                        }
                                    );
                                } else {
                                    callback(500, {
                                        error: "Couldn't create a check for your requested user.",
                                    });
                                }
                            });
                        } else if (userChecks.length >= 1 && userChecks.length < config.maxChecks) {
                            // get the existing checks
                            dataLibrary.read(
                                "checks",
                                userName,
                                (readCheckError, readCheckData) => {
                                    if (!readCheckError && readCheckData) {
                                        const checksData = utilities.parseJSON(readCheckData);
                                        checksData.checks.push(checkObj);
                                        // update the checks
                                        dataLibrary.update(
                                            "checks",
                                            userName,
                                            checksData,
                                            (checkUpdateError) => {
                                                if (!checkUpdateError) {
                                                    // update the user's checks list at user table
                                                    userChecks.push(checkId);
                                                    userData.checks = [...userChecks];
                                                    dataLibrary.update(
                                                        "users",
                                                        userName,
                                                        userData,
                                                        (userUpdateError) => {
                                                            if (!userUpdateError) {
                                                                callback(200, checkObj);
                                                            } else {
                                                                callback(500, {
                                                                    error: "Couldn't update your requested user's check.",
                                                                });
                                                            }
                                                        }
                                                    );
                                                } else {
                                                    callback(500, {
                                                        error: "Couldn't create a check for your requested user",
                                                    });
                                                }
                                            }
                                        );
                                    } else {
                                        callback(404, {
                                            error: "Your requested user's check couldn't found to update checks list.",
                                        });
                                    }
                                }
                            );
                        } else {
                            callback(401, {
                                error: "Your maximum checks limit has been crossed!",
                            });
                        }
                    } else {
                        callback(404, {
                            error: "Your requested user couldn't found.",
                        });
                    }
                });
            } else {
                callback(404, {
                    error: "Your token is not valid.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide valid details.",
        });
    }
};

// Put method
checkHandler._check.put = (requestProps, callback) => {
    // validate user input
    const userName =
        typeof requestProps.reqBody.userName === "string" &&
        requestProps.reqBody.userName.trim().length > 0
            ? requestProps.reqBody.userName
            : null;
    const checkId =
        typeof requestProps.reqBody.checkId === "string" &&
        requestProps.reqBody.checkId.trim().length > config.minTokenLength
            ? requestProps.reqBody.checkId
            : null;
    const protocol =
        typeof requestProps.reqBody.protocol === "string" &&
        ["http", "https"].indexOf(requestProps.reqBody.protocol.toLowerCase().trim()) > -1
            ? requestProps.reqBody.protocol
            : null;
    const url =
        typeof requestProps.reqBody.url === "string" && requestProps.reqBody.url.trim().length > 0
            ? requestProps.reqBody.url
            : null;
    const method =
        typeof requestProps.reqBody.method === "string" &&
        ["get", "post", "put", "delete"].indexOf(requestProps.reqBody.method.toLowerCase().trim()) >
            -1
            ? requestProps.reqBody.method.toLowerCase().trim()
            : null;
    const successCodes =
        typeof requestProps.reqBody.successCodes === "object" &&
        Array.isArray(requestProps.reqBody.successCodes)
            ? requestProps.reqBody.successCodes
            : null;
    const timeoutSeconds =
        typeof requestProps.reqBody.timeoutSeconds === "number" &&
        requestProps.reqBody.timeoutSeconds % 1 === 0 &&
        requestProps.reqBody.timeoutSeconds >= 1 &&
        requestProps.reqBody.timeoutSeconds <= 5
            ? requestProps.reqBody.timeoutSeconds
            : null;
    const tokenId =
        typeof requestProps.headersObj.tokenid === "string" &&
        requestProps.headersObj.tokenid.trim().length >= config.minTokenLength
            ? requestProps.headersObj.tokenid
            : null;
    if (userName && tokenId && checkId) {
        // verify the token
        verifyToken(tokenId, userName, (verified) => {
            if (verified) {
                if (protocol || url || method || successCodes || timeoutSeconds) {
                    // read the user's check
                    dataLibrary.read("checks", userName, (readError, readData) => {
                        if (!readError && readData) {
                            // get the checks data as object
                            const userChecksObj = utilities.parseJSON(readData);
                            // filter the corresponding check object according the passes checkid
                            const checkObj = userChecksObj.checks.filter(
                                (el) => el.checkId === checkId
                            );
                            if (checkObj.length > 0) {
                                // Update the checkObj with the entered data
                                if (protocol) {
                                    checkObj[0].protocol = protocol;
                                }
                                if (url) {
                                    checkObj[0].url = url;
                                }
                                if (method) {
                                    checkObj[0].method = method;
                                }
                                if (successCodes) {
                                    checkObj[0].successCodes = successCodes;
                                }
                                if (timeoutSeconds) {
                                    checkObj[0].timeoutSeconds = timeoutSeconds;
                                }
                                // Finally update the check file
                                dataLibrary.update(
                                    "checks",
                                    userName,
                                    userChecksObj,
                                    (updateError) => {
                                        if (!updateError) {
                                            callback(200, {
                                                message:
                                                    "Successfully updated your requested check.",
                                            });
                                        } else {
                                            callback(500, {
                                                error: "Couldn't update your requested check.",
                                            });
                                        }
                                    }
                                );
                            } else {
                                callback(400, {
                                    error: "Your requested check id was incorrect!",
                                });
                            }
                        } else {
                            callback(404, {
                                error: "Your requested user has no check.",
                            });
                        }
                    });
                } else {
                    callback(400, {
                        error: "Please provide atleast one field to update the check.",
                    });
                }
            } else {
                callback(403, {
                    error: "Authentication failed for incorrect token.",
                });
            }
        });
    } else {
        callback(400, {
            error: "Please provide your username, a valid token & your requested check's id.",
        });
    }
};

// Delete method
checkHandler._check.delete = (requestProps, callback) => {
    const userName =
        typeof requestProps.queryStringObj.userName === "string" &&
        requestProps.queryStringObj.userName.trim().length > 0
            ? requestProps.queryStringObj.userName
            : null;
    const checkId =
        typeof requestProps.reqBody.checkId === "string" &&
        requestProps.reqBody.checkId.trim().length > config.minTokenLength
            ? requestProps.reqBody.checkId
            : null;
    if (userName && checkId) {
        // validate the token
        const tokenId =
            typeof requestProps.headersObj.tokenid === "string" &&
            requestProps.headersObj.tokenid.trim().length >= config.minTokenLength
                ? requestProps.headersObj.tokenid
                : null;
        if (tokenId) {
            // verify the given token
            verifyToken(tokenId, userName, (verified) => {
                if (verified) {
                    // Look up the check
                    dataLibrary.read("checks", userName, (checkReadError, checkReadData) => {
                        if (!checkReadError && checkReadData) {
                            // get the checks data as object
                            const userChecksObj = utilities.parseJSON(checkReadData);
                            // filter the corresponding check object according the passes checkid
                            let checkPosition = null;
                            const checkObj = userChecksObj.checks.filter((el, ind) => {
                                if (el.checkId === checkId) {
                                    checkPosition = ind;
                                }
                                return el.checkId === checkId;
                            });
                            if (checkObj.length > 0 && typeof checkPosition === "number") {
                                // remove the checkObj from the checks array in check file
                                userChecksObj.checks.splice(checkPosition, 1);
                                // remove the checkid from the user file
                                dataLibrary.read(
                                    "users",
                                    userName,
                                    (userReadError, userReadData) => {
                                        if (!userReadError && userReadData) {
                                            const userData = utilities.parseJSON(userReadData);
                                            // get the index position of requested check id
                                            checkPosition = userData.checks.indexOf(checkId);
                                            userData.checks.splice(checkPosition, 1);
                                            // Update the user file
                                            dataLibrary.update(
                                                "users",
                                                userName,
                                                userData,
                                                (updateUserError) => {
                                                    if (!updateUserError) {
                                                        //  Nothing to response..
                                                    } else {
                                                        callback(500, {
                                                            error: "Couldn't update the user file",
                                                        });
                                                    }
                                                }
                                            );
                                        } else {
                                            callback(404, {
                                                error: "Couldn't find your requested user.",
                                            });
                                        }
                                    }
                                );
                                // Remove the user checks file if it will empty
                                if (userChecksObj.checks.length === 0) {
                                    dataLibrary.delete("checks", userName, (deleteCheckError) => {
                                        if (!deleteCheckError) {
                                            callback(200, {
                                                message:
                                                    "Successfully deleted your requested check.",
                                            });
                                        } else {
                                            callback(500, {
                                                error: "Couldn't delete the checks file.",
                                            });
                                        }
                                    });
                                } else {
                                    // update the check file
                                    dataLibrary.update(
                                        "checks",
                                        userName,
                                        userChecksObj,
                                        (checkUpdateError) => {
                                            if (!checkUpdateError) {
                                                callback(200, {
                                                    message:
                                                        "Successfully deleted your requested check.",
                                                });
                                            } else {
                                                callback(500, {
                                                    error: "Couldn't update your requested check.",
                                                });
                                            }
                                        }
                                    );
                                }
                            } else {
                                callback(400, {
                                    error: "Your requested check id was incorrect!",
                                });
                            }
                        } else {
                            callback(404, {
                                error: "Your requested user's check couldn't found.",
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
                error: `Please provide a token contains ${config.minTokenLength} characters.`,
            });
        }
    } else {
        callback(400, {
            error: "Please provide your username & a check id.",
        });
    }
};

// Helper function to create an check
checkHandler._check.createNewCheck = (fileName, checkData, callback) => {
    dataLibrary.create("checks", fileName, checkData, (err) => {
        if (!err) {
            callback(true);
        } else {
            callback(false);
        }
    });
};

// Export module
module.exports = checkHandler;
