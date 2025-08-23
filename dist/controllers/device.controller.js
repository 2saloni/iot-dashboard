"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const device_service_1 = require("../services/device.service");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
const device_request_1 = require("../dto/request/device.request");
let DeviceController = class DeviceController {
    constructor() {
        /**
         * Create a new device
         * POST /devices
         */
        this.createDevice = async (req, res) => {
            try {
                // Transform and validate request body
                const createDeviceDto = (0, class_transformer_1.plainToClass)(device_request_1.CreateDeviceDto, req.body);
                const errors = await (0, class_validator_1.validate)(createDeviceDto);
                if (errors.length > 0) {
                    const validationErrors = errors.map(error => ({
                        field: error.property,
                        errors: Object.values(error.constraints || {})
                    }));
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: validationErrors
                    });
                    return;
                }
                const device = await this.deviceService.createDevice(createDeviceDto);
                res.status(201).json({
                    success: true,
                    message: 'Device created successfully',
                    data: device
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to create device',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Get device by ID
         * GET /devices/:id
         */
        this.getDeviceById = async (req, res) => {
            try {
                const { id } = req.params;
                const device = await this.deviceService.getDeviceById(id);
                res.status(200).json({
                    success: true,
                    message: 'Device retrieved successfully',
                    data: device
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Device not found',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Get all devices with optional filtering
         * GET /devices
         */
        this.getAllDevices = async (req, res) => {
            try {
                const queryOptions = {
                    name: req.query.name,
                    status: req.query.status,
                    devicetype: req.query.devicetype
                };
                const devices = await this.deviceService.getAllDevices(queryOptions);
                res.status(200).json({
                    success: true,
                    message: 'Devices retrieved successfully',
                    data: devices,
                    count: devices.length
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to retrieve devices',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Update device by ID
         * PUT /devices/:id
         */
        this.updateDevice = async (req, res) => {
            try {
                const { id } = req.params;
                // Transform and validate request body
                const updateDeviceDto = (0, class_transformer_1.plainToClass)(device_request_1.UpdateDeviceDto, req.body);
                const errors = await (0, class_validator_1.validate)(updateDeviceDto);
                if (errors.length > 0) {
                    const validationErrors = errors.map(error => ({
                        field: error.property,
                        errors: Object.values(error.constraints || {})
                    }));
                    res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: validationErrors
                    });
                    return;
                }
                const device = await this.deviceService.updateDevice(id, updateDeviceDto);
                res.status(200).json({
                    success: true,
                    message: 'Device updated successfully',
                    data: device
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update device',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Delete device by ID (soft delete)
         * DELETE /devices/:id
         */
        this.deleteDevice = async (req, res) => {
            try {
                const { id } = req.params;
                await this.deviceService.deleteDevice(id);
                res.status(200).json({
                    success: true,
                    message: 'Device deleted successfully'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete device',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.deviceService = new device_service_1.DeviceService();
    }
};
exports.DeviceController = DeviceController;
exports.DeviceController = DeviceController = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], DeviceController);
