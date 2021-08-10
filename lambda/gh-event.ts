"use strict";

import { IotData } from "aws-sdk";
import { smarthome } from "actions-on-google";
import * as colorconvert from "color-convert";

import logger from './utils/logger';

interface Hsv {
  hue: number
  saturation: number
  value: number
}

interface ICommandOptions {
  [key: string]: Function;
}

// Create an app instance
const app = smarthome({
  debug: true,
});

if (!process.env.IOT_ENDPOINT) {
  throw new Error("Requires IOT_ENDPOINT");
}

if (!process.env.IOT_THINGS) {
  throw new Error("Requires IOT_THINGS");
}

const things = process.env.IOT_THINGS.split(",");

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

const getRGBParam = ({ hue, saturation, value }: Hsv) => {
  const rgb = colorconvert.hsv.rgb([hue, saturation, value]);

  return {
    color: {
      red: rgb[0],
      green: rgb[1],
      blue: rgb[2]
    }
  }
};

const COMMAND_MAP: ICommandOptions = {
  "action.devices.commands.OnOff": getToggleParams,
  "action.devices.commands.BrightnessAbsolute": getBrightnessParam,
  "action.devices.commands.ColorAbsolute": getRGBParam,
};

// This needs refactoring to capture multiple commands
app.onExecute(async (body) => {
  logger.info(body, "Received EXECUTE event");

  const deviceIds = body.inputs[0].payload.commands[0].devices.map(device => device.id);
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

  await Promise.all(deviceIds.map(id => iotdata.updateThingShadow({
    thingName: id,
    payload: JSON.stringify({
      state: {
        desired: desiredParams,
      },
    }),
  }).promise()));

  return {
    requestId: body.requestId,
    payload: {
      commands: [
        {
          ids: deviceIds,
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
  logger.info(body, "Received QUERY event");

  const deviceIds = body.inputs[0].payload.devices.map(device => device.id);

  const res = await Promise.all(deviceIds.map(id => iotdata.getThingShadow({ thingName: id }).promise()));
  const payloads = res.map(el => JSON.parse(el.payload!.toString()));

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: payloads.reduce((curr, payload, idx) => {
        const reportedBrightness = payload.state.reported.brightness || 0;
        const brightness = Math.round((reportedBrightness / 255) * 100);
        
        const reportedColor = payload.state.reported.color;
        let hsv = [0,0,0];

        if (reportedColor) {
          hsv = colorconvert.rgb.hsv([reportedColor.red, reportedColor.green, reportedColor.blue]);
        }

        return {
          ...curr,
          [deviceIds[idx]]: {
            online: true,
            on: payload.state.reported.light === "on",
            brightness,
            color: {
              spectrumHsv: {
                hue: hsv[0],
                saturation: [1],
                value: [2]
              }
            },
            status: "SUCCESS",
          }
        }
      }, {}),
    },
  };
});

app.onSync(async (body) => {
  logger.info(body, "Received SYNC event");

  return {
    requestId: body.requestId,
    payload: {
      agentUserId: "1",
      devices: things.map((thingName, idx) => ({
        id: thingName,
        type: "action.devices.types.LIGHT",
        traits: [
          "action.devices.traits.OnOff",
          "action.devices.traits.Brightness",
          "action.devices.traits.ColorSetting"
        ],
        attributes: {
          colorModel: "hsv"
        },
        name: {
          name: thingName,
          defaultNames: ["reading light"],
          nicknames: ["reading light"],
        },
        willReportState: true,
        roomHint: "bedroom",
      })),
    },
  };
});

export { app as handler };