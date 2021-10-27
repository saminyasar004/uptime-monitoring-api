/* eslint-disable no-shadow */
/**
 * Title: Data management
 * Description: Handle CRUD process for data
 * Author: Samin Yasar
 * Date: 25/October/2021
 */

// Dependencies
const fs = require("fs");
const path = require("path");

// Module scaffolding
const lib = {};

// Base dir
lib.baseDir = path.join(__dirname, `../.data`);

// Write data to file
/**
 * Create a file and write data into this file.
 *
 * @param {PathDirectory} dir - Path for the directory without file name
 * @param {fileName} fileName - The name of the file without extension
 * @param {String} data - The string data for the file
 * @param {callback} callback - Callback function
 */
lib.create = (dir, fileName, data, callback) => {
    // Make directory
    fs.mkdir(`${lib.baseDir}/${dir.trim().replace(/^\/+|\/$/gi, "")}`, (err) => {
        if (!err) {
            console.log("Successfully created directory.");
        } else {
            console.log("Cannot create directory. Maybe a it is already exists.");
        }
    });
    // Open file to write
    fs.open(
        `${lib.baseDir}/${dir.trim().replace(/^\/+|\/$/gi, "")}/${fileName
            .trim()
            .replace(/^\/+|\/$/gi, "")}.json`,
        "wx",
        (err, fileDescriptor) => {
            if (!err && fileDescriptor) {
                // Convert data to string
                const stringData = JSON.stringify(data);
                // write data to file and close it
                fs.writeFile(fileDescriptor, stringData, (err) => {
                    if (!err) {
                        // close the file
                        fs.close(fileDescriptor, (err) => {
                            if (!err) {
                                callback(false);
                            } else {
                                callback("Error on closing file.");
                            }
                        });
                    } else {
                        callback("Error occures to write data into file.");
                    }
                });
            } else {
                callback("Couldn't create file. It may file already exists.");
            }
        }
    );
};

// Read data from file
/**
 * Read data from an existing file
 *
 * @param {PathDirectory} dir - Path directory of the file without file name
 * @param {fileName} fileName - The name of the file without extesion
 * @param {callback} callback - Callback function
 * @returns {Error, Data} - Return one of those it error occures then data will be null otherwise error will be null
 */
lib.read = (dir, fileName, callback) => {
    fs.readFile(
        `${lib.baseDir}/${dir.trim().replace(/^\/+|\/$/gi, "")}/${fileName
            .trim()
            .replace(/^\/+|\/$/gi, "")}.json`,
        "utf8",
        (err, data) => {
            if (!err) {
                callback(null, data);
            } else {
                callback("Couldn't read data from the file.", null);
            }
        }
    );
};

// Update an existing file
/**
 * Update an existing file
 *
 * @param {PathDirectory} dir - Path directory of the file without file name
 * @param {fileName} fileName - The name of the file without extesion
 * @param {String} data - The string data for the file
 * @param {callback} callback - Callback function
 */
lib.update = (dir, fileName, data, callback) => {
    // open the file
    fs.open(
        `${lib.baseDir}/${dir.trim().replace(/^\/+|\/$/gi, "")}/${fileName
            .trim()
            .replace(/^\/+|\/$/gi, "")}.json`,
        "r+",
        (err, fileDescriptor) => {
            if (!err) {
                // stringify the data
                const stringData = JSON.stringify(data);
                // truncate the file
                fs.ftruncate(fileDescriptor, (err) => {
                    if (!err) {
                        // write file and close it
                        fs.writeFile(fileDescriptor, stringData, (err) => {
                            if (!err) {
                                fs.close(fileDescriptor, (err) => {
                                    if (!err) {
                                        callback(false);
                                    } else {
                                        callback("Error on closing file.");
                                    }
                                });
                            } else {
                                callback("Couldn't write file.");
                            }
                        });
                    } else {
                        callback("Couldn't truncate the file.");
                    }
                });
            } else {
                callback("Couldn't open the file.");
            }
        }
    );
};

// Delete an existing file
/**
 * Delete an existing file
 *
 * @param {PathDirectory} dir - Path directory of the file without file name
 * @param {fileName} fileName - The name of the file without extesion
 * @param {callback} callback - Callback function
 */
lib.delete = (dir, fileName, callback) => {
    // unlink file
    fs.unlink(
        `${lib.baseDir}/${dir.trim().replace(/^\/+|\/$/gi, "")}/${fileName
            .trim()
            .replace(/^\/+|\/$/gi, "")}.json`,
        (err) => {
            if (!err) {
                callback(false);
            } else {
                callback("Error occures on deleting file.");
            }
        }
    );
};

// Export module
module.exports = lib;
