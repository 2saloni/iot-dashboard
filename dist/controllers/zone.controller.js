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
exports.ZoneController = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const zone_service_1 = require("../services/zone.service");
const singleton_decorator_1 = require("../decorators/singleton.decorator");
const zone_request_1 = require("../dto/request/zone.request");
let ZoneController = class ZoneController {
    constructor() {
        /**
         * Create a new zone
         * POST /zones
         */
        this.createZone = async (req, res) => {
            try {
                // Transform and validate request body
                const createZoneDto = (0, class_transformer_1.plainToClass)(zone_request_1.CreateZoneDto, req.body);
                const errors = await (0, class_validator_1.validate)(createZoneDto);
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
                const zone = await this.zoneService.createZone(createZoneDto);
                res.status(201).json({
                    success: true,
                    message: 'Zone created successfully',
                    data: zone
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to create zone',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Get zone by ID
         * GET /zones/:id
         */
        this.getZoneById = async (req, res) => {
            try {
                const { id } = req.params;
                const queryOptions = {
                    userId: req.query.userId
                };
                const zone = await this.zoneService.getZoneById(id, queryOptions);
                res.status(200).json({
                    success: true,
                    message: 'Zone retrieved successfully',
                    data: zone
                });
            }
            catch (error) {
                res.status(404).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Zone not found',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Get all zones with optional filtering
         * GET /zones
         */
        this.getAllZones = async (req, res) => {
            try {
                const queryOptions = {
                    userId: req.query.userId
                };
                const zones = await this.zoneService.getAllZones(queryOptions);
                res.status(200).json({
                    success: true,
                    message: 'Zones retrieved successfully',
                    data: zones,
                    count: zones.length
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to retrieve zones',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Update zone by ID
         * PUT /zones/:id
         */
        this.updateZone = async (req, res) => {
            try {
                const { id } = req.params;
                // Transform and validate request body
                const updateZoneDto = (0, class_transformer_1.plainToClass)(zone_request_1.UpdateZoneDto, req.body);
                const errors = await (0, class_validator_1.validate)(updateZoneDto);
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
                const zone = await this.zoneService.updateZone(id, updateZoneDto);
                res.status(200).json({
                    success: true,
                    message: 'Zone updated successfully',
                    data: zone
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to update zone',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        /**
         * Delete zone by ID (soft delete)
         * DELETE /zones/:id
         */
        this.deleteZone = async (req, res) => {
            try {
                const { id } = req.params;
                await this.zoneService.deleteZone(id);
                res.status(200).json({
                    success: true,
                    message: 'Zone deleted successfully'
                });
            }
            catch (error) {
                res.status(400).json({
                    success: false,
                    message: error instanceof Error ? error.message : 'Failed to delete zone',
                    error: error instanceof Error ? error.message : 'Unknown error'
                });
            }
        };
        this.zoneService = new zone_service_1.ZoneService();
    }
};
exports.ZoneController = ZoneController;
exports.ZoneController = ZoneController = __decorate([
    singleton_decorator_1.Singleton,
    __metadata("design:paramtypes", [])
], ZoneController);
