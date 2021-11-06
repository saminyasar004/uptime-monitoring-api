/**
 * Title: Notifications library
 * Description: Important functions to notify user
 * Author: Samin Yasar
 * Date: 31/October/2021
 */

// Dependencies
const https = require("https");
const config = require("./config");

// Module scaffolding
const notifications = {};

// Function to send sms by using twilio api
notifications.sendTwilioSms = (phone, msg, callback) => {
    // input validation
    const expressionOfPhone = /(^\+88)01(\d{9})/gi;
    const phoneNumber =
        typeof phone === "string" && expressionOfPhone.test(phone.trim()) ? phone.trim() : null;
    const message =
        typeof msg === "string" && msg.trim().length > 0 && msg.trim().length <= 1600
            ? msg.trim()
            : null;
    if (phoneNumber && message) {
        // Configure the twilio request
        const payload = {
            From: config.twilio.fromPhoneNumber,
            To: phoneNumber,
            Body: message,
        };
        // stringify the payload
        const payloadString = JSON.stringify(payload);

        // configure the https
        const requestDetails = {
            hostname: "api.twilio.com",
            method: "POST",
            path: `/2010-04-01/Accounts/${config.twilio.accountSid}/Messages.json`,
            auth: `${config.twilio.accountSid}:${config.twilio.authToken}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        };
        // Instantiate the request object
        const req = https.request(requestDetails, (res) => {
            const { statusCode } = res;
            if (statusCode === 200 || statusCode === 201) {
                callback(false);
            } else {
                callback(`Status code returned was ${statusCode}`);
            }
        });
        // Handle error
        req.on("error", (error) => {
            callback(error);
        });
        // Write payload in request object
        req.write(payloadString);
        req.end();
    } else {
        callback("Please provide a phone number & a message.");
    }
};

// notifications.sendTwilioSms("+8801830027750", "Hello Nizam", (err) => {
//     console.log(`Error: ${err}`);
// });

// Export module
module.exports = notifications;
