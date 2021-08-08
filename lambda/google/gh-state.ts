"use strict";

import { v4 as uuidv4 } from "uuid";
import { GoogleAuth } from "google-auth-library";
import { homegraph } from "@googleapis/homegraph";

interface IoTShadowState {
  light?: string;
  brightness?: number;
}

interface GHState {
  on?: boolean;
  brightness?: number;
}

interface IoTRuleEvent {
  thing_id: string;
  state: IoTShadowState;
}

const googleServiceJSON =
  (process.env.GOOGLE_SERVICE_ACCOUNT_JSON &&
    JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)) ||
  {};

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

  return state;
};

const handler = async (event: IoTRuleEvent) => {
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

  console.log(response);
};

export { handler };
