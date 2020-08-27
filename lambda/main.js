"use strict";

const AWS = require("awssdk");

var iotdata = new AWS.IotData({
  endpoint: "au4crrz84uqsr-ats.iot.ap-southeast-2.amazonaws.com",
});

exports.handler = async function (event, context, callback) {
  const params = {
    thingName: 'neopixel',
    payload: JSON.stringify({
      state: {
        desired: {
          light: 'on'
        }
      }
    })
  };
  await iotdata.updateThingShadow(params).promise;

  var response = {
    statusCode: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
    body: "<p>Hello world!</p>",
  };
  callback(null, response);
};

exports.handler = app;
