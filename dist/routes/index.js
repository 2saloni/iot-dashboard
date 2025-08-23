"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const mqtt_routes_1 = __importDefault(require("./mqtt.routes"));
const device_routes_1 = __importDefault(require("./device.routes"));
const zone_routes_1 = __importDefault(require("./zone.routes"));
const router = (0, express_1.Router)();
// Mount route modules
router.use('/auth', auth_routes_1.default);
router.use('/mqtt', mqtt_routes_1.default);
router.use('/devices', device_routes_1.default);
router.use('/zones', zone_routes_1.default);
exports.default = router;
