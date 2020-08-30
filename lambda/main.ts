"use strict";

import { IotData } from "aws-sdk";
import { smarthome } from "actions-on-google";

// Create an app instance
const app = smarthome({
  debug: true,
});

if (!process.env.IOT_ENDPOINT) {
  throw new Error("Requires IOT_ENDPOINT");
}

if (!process.env.IOT_THING_NAME) {
  throw new Error("Requires IOT_THING_NAME");
}

const thingName = process.env.IOT_THING_NAME;

const iotdata = new IotData({
  endpoint: process.env.IOT_ENDPOINT,
});

const getToggleParams = ({ on }: { on: boolean }) => {
  return {
    light: on ? "on" : "off",
  };
};

const getBrightnessParam = ({ brightness }: { brightness: number }) => {
  const desiredBrightness = Math.round((brightness / 100) * 255);
  return {
    brightness: desiredBrightness,
  };
};

interface ICommandOptions {
  [key: string]: Function;
}

const COMMAND_MAP: ICommandOptions = {
  "action.devices.commands.OnOff": getToggleParams,
  "action.devices.commands.BrightnessAbsolute": getBrightnessParam,
};

app.onExecute(async (body) => {
  console.log("Execute");
  const currParams = body.inputs[0].payload.commands[0].execution.reduce(
    (prev, curr) => {
      return {
        ...prev,
        ...(curr.params || {}),
      };
    },
    {}
  );
  const desiredParams = body.inputs[0].payload.commands[0].execution.reduce(
    (prev, curr) => {
      if (COMMAND_MAP[curr.command]) {
        return {
          ...prev,
          ...COMMAND_MAP[curr.command](curr.params || {}),
        };
      }
    },
    {}
  );

  const params = {
    thingName,
    payload: JSON.stringify({
      state: {
        desired: desiredParams,
      },
    }),
  };
  await iotdata.updateThingShadow(params).promise();

  return {
    requestId: body.requestId,
    payload: {
      commands: [
        {
          ids: ["1"],
          status: "SUCCESS",
          states: {
            online: true,
            ...currParams
          },
        },
      ],
    },
  };
});

app.onQuery(async (body) => {
  console.log("Query");
  const params = {
    thingName,
  };
  const res = await iotdata.getThingShadow(params).promise();
  // @ts-ignore
  const payload = JSON.parse(res.payload);
  const lightStatus = payload.state.reported.light === "on";
  const reportedBrightness = payload.state.reported.brightness || 0;
  const brightness = Math.round((reportedBrightness / 255) * 100);

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: {
        1: {
          online: true,
          on: lightStatus,
          brightness,
          status: "SUCCESS",
        },
      },
    },
  };
});

app.onSync(async (body) => {
  console.log("Sync");
  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: [
        {
          id: "1",
          type: "action.devices.types.LIGHT",
          traits: [
            "action.devices.traits.OnOff",
            "action.devices.traits.Brightness",
          ],
          name: {
            name: "Neopixel",
            defaultNames: ["reading light"],
            nicknames: ["reading light"],
          },
          willReportState: false,
          roomHint: "bedroom",
        },
      ],
    },
  };
});

exports.handler = app;
