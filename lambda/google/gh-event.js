"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.handler = void 0;
var aws_sdk_1 = require("aws-sdk");
var actions_on_google_1 = require("actions-on-google");
// Create an app instance
var app = actions_on_google_1.smarthome({
    debug: true
});
exports.handler = app;
if (!process.env.IOT_ENDPOINT) {
    throw new Error("Requires IOT_ENDPOINT");
}
if (!process.env.IOT_THINGS) {
    throw new Error("Requires IOT_THINGS");
}
var things = process.env.IOT_THINGS.split(",");
var iotdata = new aws_sdk_1.IotData({
    endpoint: process.env.IOT_ENDPOINT
});
var getToggleParams = function (_a) {
    var on = _a.on;
    return {
        light: on ? "on" : "off"
    };
};
var getBrightnessParam = function (_a) {
    var brightness = _a.brightness;
    var desiredBrightness = Math.round((brightness / 100) * 255);
    return {
        brightness: desiredBrightness
    };
};
var COMMAND_MAP = {
    "action.devices.commands.OnOff": getToggleParams,
    "action.devices.commands.BrightnessAbsolute": getBrightnessParam
};
// This needs refactoring to capture multiple commands
app.onExecute(function (body) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceIds, currParams, desiredParams;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Execute");
                deviceIds = body.inputs[0].payload.commands[0].devices.map(function (device) { return device.id; });
                currParams = body.inputs[0].payload.commands[0].execution.reduce(function (prev, curr) {
                    return __assign(__assign({}, prev), (curr.params || {}));
                }, {});
                desiredParams = body.inputs[0].payload.commands[0].execution.reduce(function (prev, curr) {
                    if (COMMAND_MAP[curr.command]) {
                        return __assign(__assign({}, prev), COMMAND_MAP[curr.command](curr.params || {}));
                    }
                }, {});
                return [4 /*yield*/, Promise.all(deviceIds.map(function (id) { return iotdata.updateThingShadow({
                        thingName: id,
                        payload: JSON.stringify({
                            state: {
                                desired: desiredParams
                            }
                        })
                    }).promise(); }))];
            case 1:
                _a.sent();
                return [2 /*return*/, {
                        requestId: body.requestId,
                        payload: {
                            commands: [
                                {
                                    ids: deviceIds,
                                    status: "SUCCESS",
                                    states: __assign({ online: true }, currParams)
                                },
                            ]
                        }
                    }];
        }
    });
}); });
app.onQuery(function (body) { return __awaiter(void 0, void 0, void 0, function () {
    var deviceIds, res, payloads;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log("Query");
                deviceIds = body.inputs[0].payload.devices.map(function (device) { return device.id; });
                return [4 /*yield*/, Promise.all(deviceIds.map(function (id) { return iotdata.getThingShadow({ thingName: id }).promise(); }))];
            case 1:
                res = _a.sent();
                payloads = res.map(function (el) { return JSON.parse(el.payload.toString()); });
                return [2 /*return*/, {
                        requestId: body.requestId,
                        payload: {
                            agentUserId: "1",
                            devices: payloads.reduce(function (curr, payload, idx) {
                                var _a;
                                var reportedBrightness = payload.state.reported.brightness || 0;
                                var brightness = Math.round((reportedBrightness / 255) * 100);
                                return __assign(__assign({}, curr), (_a = {}, _a[deviceIds[idx]] = {
                                    online: true,
                                    on: payload.state.reported.light === "on",
                                    brightness: brightness,
                                    status: "SUCCESS"
                                }, _a));
                            }, {})
                        }
                    }];
        }
    });
}); });
app.onSync(function (body) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        console.log("Sync");
        return [2 /*return*/, {
                requestId: body.requestId,
                payload: {
                    agentUserId: "1",
                    devices: things.map(function (thingName, idx) { return ({
                        id: thingName,
                        type: "action.devices.types.LIGHT",
                        traits: [
                            "action.devices.traits.OnOff",
                            "action.devices.traits.Brightness",
                        ],
                        name: {
                            name: thingName,
                            defaultNames: ["reading light"],
                            nicknames: ["reading light"]
                        },
                        willReportState: true,
                        roomHint: "bedroom"
                    }); })
                }
            }];
    });
}); });
