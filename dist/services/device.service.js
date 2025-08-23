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
exports.DeviceService = void 0;
const device_entity_1 = require("../entities/device.entity");
const database_config_1 = require("../config/database.config");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
let DeviceService = class DeviceService {
    constructor() {
        this.deviceRepository = database_config_1.AppDataSource.getRepository(device_entity_1.Device);
    }
    /**
     * Create a new device
     */
    async createDevice(createDeviceDto) {
        try {
            // Check if device with same deviceId already exists
            const existingDevice = await this.deviceRepository.findOne({
                where: { deviceId: createDeviceDto.deviceId }
            });
            if (existingDevice) {
                throw new Error(`Device with deviceId ${createDeviceDto.deviceId} already exists`);
            }
            // Check if device with same name already exists
            const existingDeviceByName = await this.deviceRepository.findOne({
                where: { name: createDeviceDto.name }
            });
            if (existingDeviceByName) {
                throw new Error(`Device with name '${createDeviceDto.name}' already exists`);
            }
            const device = this.deviceRepository.create(createDeviceDto);
            const savedDevice = await this.deviceRepository.save(device);
            return savedDevice;
        }
        catch (error) {
            throw new Error(`Failed to create device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get device by ID
     */
    async getDeviceById(id) {
        try {
            const findOptions = {
                where: { id }
            };
            const device = await this.deviceRepository.findOne(findOptions);
            if (!device) {
                throw new Error(`Device with ID ${id} not found`);
            }
            return device;
        }
        catch (error) {
            throw new Error(`Failed to get device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all devices with optional filtering
     */
    async getAllDevices(queryOptions = {}) {
        try {
            const whereConditions = {};
            if (queryOptions.name) {
                whereConditions.name = queryOptions.name;
            }
            if (queryOptions.status) {
                whereConditions.status = queryOptions.status;
            }
            if (queryOptions.devicetype) {
                whereConditions.devicetype = queryOptions.devicetype;
            }
            const findOptions = {
                where: whereConditions,
                order: { createdAt: 'DESC' }
            };
            const devices = await this.deviceRepository.find(findOptions);
            return devices;
        }
        catch (error) {
            throw new Error(`Failed to get devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update device by ID
     */
    async updateDevice(id, updateDeviceDto) {
        try {
            // Check if device exists
            const existingDevice = await this.deviceRepository.findOne({
                where: { id }
            });
            if (!existingDevice) {
                throw new Error(`Device with ID ${id} not found`);
            }
            // Merge updates into the entity
            Object.assign(existingDevice, updateDeviceDto);
            // Save updated device
            return await this.deviceRepository.save(existingDevice);
        }
        catch (error) {
            throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete device by ID (soft delete)
     */
    async deleteDevice(id) {
        try {
            const device = await this.deviceRepository.findOne({
                where: { id }
            });
            if (!device) {
                throw new Error(`Device with ID ${id} not found`);
            }
            // Soft delete the device
            await this.deviceRepository.softDelete(id);
        }
        catch (error) {
            throw new Error(`Failed to delete device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.DeviceService = DeviceService;
exports.DeviceService = DeviceService = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], DeviceService);
