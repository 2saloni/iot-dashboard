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
exports.ZoneService = void 0;
const typeorm_1 = require("typeorm");
const zone_entity_1 = require("../entities/zone.entity");
const database_config_1 = require("../config/database.config");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
const user_service_1 = require("./user.service");
let ZoneService = class ZoneService {
    constructor() {
        this.zoneRepository = database_config_1.AppDataSource.getRepository(zone_entity_1.Zone);
        this.userService = new user_service_1.UserService();
    }
    /**
     * Create a new zone
     */
    async createZone(createZoneDto) {
        try {
            // Check if zone with same name already exists for this device
            const existingZone = await this.zoneRepository.findOne({
                where: {
                    name: createZoneDto.name,
                    deviceId: createZoneDto.deviceId
                }
            });
            if (existingZone) {
                throw new Error(`Zone with name '${createZoneDto.name}' already exists for this device`);
            }
            const zone = this.zoneRepository.create(createZoneDto);
            const savedZone = await this.zoneRepository.save(zone);
            return savedZone;
        }
        catch (error) {
            throw new Error(`Failed to create zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get zone by ID
     * Only returns the zone if it belongs to the requested user
     */
    async getZoneById(id, queryOptions) {
        try {
            // Check if userId is provided for authorization
            if (!queryOptions.userId) {
                throw new Error(`User ID is required for authorization`);
            }
            // First get all devices for the user
            const userDevices = await this.userService.getUserDevices(queryOptions.userId);
            console.log('userId:', queryOptions.userId);
            console.log('userDevices:', userDevices);
            const deviceIds = userDevices.map(device => device.id);
            console.log('deviceIds:', deviceIds);
            // If user has no devices, they can't access any zones
            if (deviceIds.length === 0) {
                throw new Error(`Not authorized to access any zones`);
            }
            // Only fetch zone if it belongs to one of the user's devices
            const zone = await this.zoneRepository.findOne({
                where: {
                    id,
                    deviceId: (0, typeorm_1.In)(deviceIds)
                },
                relations: ['device']
            });
            if (!zone) {
                throw new Error(`Zone not found or you are not authorized to access it`);
            }
            console.log('Found authorized zone:', zone.id, 'for device:', zone.deviceId);
            return zone;
        }
        catch (error) {
            throw new Error(`Failed to get zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all zones with optional filtering
     * If userId is provided, only return zones for devices belonging to that user
     */
    async getAllZones(queryOptions = {}) {
        try {
            let deviceIds = [];
            // If userId is provided, get all devices for that user
            if (queryOptions.userId) {
                const userDevices = await this.userService.getUserDevices(queryOptions.userId);
                console.log('userDevices:', userDevices);
                deviceIds = userDevices.map(device => device.id);
                console.log('deviceIds:', deviceIds);
                // If user has no devices, return empty array
                if (deviceIds.length === 0) {
                    return [];
                }
            }
            const findOptions = {
                order: { createdAt: 'DESC' },
                relations: ['device']
            };
            // If we have device IDs from the user, filter by them
            if (deviceIds.length > 0) {
                findOptions.where = {
                    deviceId: (0, typeorm_1.In)(deviceIds)
                };
            }
            const zones = await this.zoneRepository.find(findOptions);
            return zones;
        }
        catch (error) {
            throw new Error(`Failed to get zones: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Update zone by ID
     */
    async updateZone(id, updateZoneDto) {
        try {
            // Check if zone exists
            const existingZone = await this.zoneRepository.findOne({
                where: { id }
            });
            if (!existingZone) {
                throw new Error(`Zone with ID ${id} not found`);
            }
            // Check if the name is being changed and if the new name already exists for this device
            if (updateZoneDto.name && updateZoneDto.name !== existingZone.name) {
                const deviceId = updateZoneDto.deviceId || existingZone.deviceId;
                const nameExistsForDevice = await this.zoneRepository.findOne({
                    where: {
                        name: updateZoneDto.name,
                        deviceId: deviceId
                    }
                });
                // If a zone with the same name exists and it's not the current zone, throw an error
                if (nameExistsForDevice && nameExistsForDevice.id !== id) {
                    throw new Error(`Zone with name '${updateZoneDto.name}' already exists for this device`);
                }
            }
            // Merge updates into the entity
            Object.assign(existingZone, updateZoneDto);
            // Save updated zone
            return await this.zoneRepository.save(existingZone);
        }
        catch (error) {
            throw new Error(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Delete zone by ID (soft delete)
     */
    async deleteZone(id) {
        try {
            const zone = await this.zoneRepository.findOne({
                where: { id }
            });
            if (!zone) {
                throw new Error(`Zone with ID ${id} not found`);
            }
            // Soft delete the zone
            await this.zoneRepository.softDelete(id);
        }
        catch (error) {
            throw new Error(`Failed to delete zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.ZoneService = ZoneService;
exports.ZoneService = ZoneService = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], ZoneService);
