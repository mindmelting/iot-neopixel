"use strict";

import { v4 as uuidv4 } from "uuid";
import { GoogleAuth } from "google-auth-library";
import { homegraph } from "@googleapis/homegraph";
import * as colorconvert from "color-convert";

import logger from './utils/logger';

interface IoTShadowState {
  light?: string;
  brightness?: number;
  color?: {
    red: number
    green: number
    blue: number
  }
}

interface GHState {
  on?: boolean;
  brightness?: number;
  color?: {
    spectrumHsv: {
      hue: number
      saturation: number
      value: number
    }
  }
}

interface IoTRuleEvent {
  thing_id: string;
  state: IoTShadowState;
}

if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
  throw new Error("Requires GOOGLE_SERVICE_ACCOUNT_JSON");
}

const googleServiceJSON = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);

const app = homegraph({
  version: "v1",
  auth: new GoogleAuth({
    projectId: googleServiceJSON.project_id,
    credentials: {
      client_email: googleServiceJSON.client_email,
      private_key: googleServiceJSON.private_key,
    },
    scopes: ["https://www.googleapis.com/auth/homegraph"],
  }),
});

const transformDeltaState = (deltaState: IoTShadowState): GHState => {
  const state: GHState = {};

  if (deltaState.hasOwnProperty("light")) {
    state.on = deltaState.light! === "on";
  }

  if (deltaState.hasOwnProperty("brightness")) {
    state.brightness = Math.round((deltaState.brightness! / 255) * 100);
  }

  if (deltaState.hasOwnProperty("color")) {
    const rgb = deltaState.color!;
    const hsv = colorconvert.rgb.hsv([rgb.red, rgb.green, rgb.blue]);
    state.color = {
      spectrumHsv: {
        hue: hsv[0],
        saturation: hsv[1] / 100,
        value: hsv[2] / 100
      }
    }
  }

  return state;
};

const handler = async (event: IoTRuleEvent) => {
  logger.info(event, "Event received");

  const deviceName = event.thing_id;
  const updatedState = transformDeltaState(event.state);

  const response = await app.devices.reportStateAndNotification({
    requestBody: {
      requestId: uuidv4(),
      agentUserId: "1",
      payload: {
        devices: {
          states: {
            [deviceName]: updatedState,
          },
        },
      },
    },
  });

  logger.info(response, "Response from Google Homegraph");
};

export { handler };
