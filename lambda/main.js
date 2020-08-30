"use strict";

const {
  smarthome
} = require('actions-on-google')

// Create an app instance
const app = smarthome({
  debug: true
})

const AWS = require("aws-sdk");


if(!process.env.IOT_ENDPOINT) {
  throw new Error('Requires IOT_ENDPOINT');
}

if(!process.env.IOT_THING_NAME) {
  throw new Error('Requires IOT_THING_NAME');
}

const thingName = process.env.IOT_THING_NAME;

const iotdata = new AWS.IotData({
  endpoint: process.env.IOT_ENDPOINT,
});

app.onExecute(async (body) => {
  const lightStatus = body.inputs[0].payload.commands[0].execution[0].params.on;
  const params = {
    thingName,
    payload: JSON.stringify({
      state: {
        desired: {
          light: lightStatus ? 'on' : 'off'
        }
      }
    })
  };
  await iotdata.updateThingShadow(params).promise();

  return {
    requestId: body.requestId,
    payload: {
      commands: [{
        ids: ["1"],
        status: "SUCCESS",
        states: {
          on: lightStatus,
          online: true
        }
      }]
    }
  };
})

app.onQuery(async (body) => {
  console.log("Query");
  const params = {
    thingName
  };
  const res = await iotdata.getThingShadow(params).promise();
  const payload = JSON.parse(res.payload);
  const lightStatus = payload.state.reported.light === "on";

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: {
        1: {
          online: true,
          on: lightStatus
        }
      }
    }
  };
})

app.onSync((body) => {
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: [{
        id: "1",
        type: "action.devices.types.LIGHT",
        traits: [
          "action.devices.traits.OnOff"
        ],
        name: {
          name: "Neopixel",
          nicknames: ["reading light"]
        },
        willReportState: false,
        roomHint: "bedroom"
      }]
    }
  };
})

exports.handler = app

