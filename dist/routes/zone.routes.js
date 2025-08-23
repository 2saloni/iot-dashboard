"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zone_controller_1 = require("../controllers/zone.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const zoneController = new zone_controller_1.ZoneController();
// Zone CRUD routes
router.post('/create-zone', auth_middleware_1.authenticate, zoneController.createZone);
router.get('/get-zones', auth_middleware_1.authenticate, zoneController.getAllZones);
router.get('/get-zone/:id', auth_middleware_1.authenticate, zoneController.getZoneById);
router.put('/update-zone/:id', auth_middleware_1.authenticate, zoneController.updateZone);
router.delete('/delete-zone/:id', auth_middleware_1.authenticate, zoneController.deleteZone);
exports.default = router;
