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
exports.UserService = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../entities/user.entity");
const device_entity_1 = require("../entities/device.entity");
const database_config_1 = require("../config/database.config");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
let UserService = class UserService {
    constructor() {
        this.userRepository = database_config_1.AppDataSource.getRepository(user_entity_1.User);
        this.deviceRepository = database_config_1.AppDataSource.getRepository(device_entity_1.Device);
    }
    /**
     * Get user by ID
     */
    async getUserById(id) {
        try {
            const findOptions = {
                where: { id }
            };
            const user = await this.userRepository.findOne(findOptions);
            if (!user) {
                throw new Error(`User with ID ${id} not found`);
            }
            return user;
        }
        catch (error) {
            throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get all devices belonging to a user
     */
    async getUserDevices(userId) {
        try {
            const user = await this.getUserById(userId);
            if (!user.deviceIds || user.deviceIds.length === 0) {
                return [];
            }
            const devices = await this.deviceRepository.find({
                where: {
                    deviceId: (0, typeorm_1.In)(user.deviceIds)
                }
            });
            return devices;
        }
        catch (error) {
            throw new Error(`Failed to get user devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], UserService);
