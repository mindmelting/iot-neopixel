"use strict";

import { v4 as uuidv4 } from 'uuid';
import { smarthome } from "actions-on-google";

interface IoTShadowState {
  light?: string
  brightness?: number
}

interface GHState {
  on?: boolean
  brightness?: number
}

interface IoTRuleEvent {
  thing_id: string;
  state: IoTShadowState
}

const app = smarthome({
  debug: true,
  jwt: process.env.GOOGLE_SERVICE_ACCOUNT_JSON && JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
});

const transformDeltaState = (deltaState: IoTShadowState): GHState => {
  const state: GHState = {};

  if (deltaState.hasOwnProperty('light')) {
    state.on = deltaState.light! === "on";
  }

  if (deltaState.hasOwnProperty('brightness')) {
    state.brightness = Math.round((deltaState.brightness! / 255) * 100);
  }

  return state;
}

const handler = async (event: IoTRuleEvent) => {
  const deviceName = event.thing_id;

  const updatedState = transformDeltaState(event.state);

  await app.reportState({
    requestId: uuidv4(),
    agentUserId: '1',
    payload: {
      devices: {
        states: {
          [deviceName]: updatedState
        }
      }
    }
  });
}

export { handler };
