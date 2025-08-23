"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const device_controller_1 = require("../controllers/device.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
// import { AuthMiddleware } from '../middlewares/auth.middleware';
const router = (0, express_1.Router)();
const deviceController = new device_controller_1.DeviceController();
// Device CRUD routes
router.post('/create-device', auth_middleware_1.authenticate, deviceController.createDevice);
router.get('/get-devices', auth_middleware_1.authenticate, deviceController.getAllDevices);
router.get('/get-device/:id', auth_middleware_1.authenticate, deviceController.getDeviceById);
router.put('/update-device/:id', auth_middleware_1.authenticate, deviceController.updateDevice);
router.delete('/delete-device/:id', auth_middleware_1.authenticate, deviceController.deleteDevice);
exports.default = router;
