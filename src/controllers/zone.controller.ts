import { Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ZoneService, ZoneQueryOptions } from '../services/zone.service';
import { Singleton } from '../decorators/singleton.decorator';
import { 
    CreateZoneDto, 
    UpdateZoneDto
} from '../dto/request/zone.request';

@Singleton
export class ZoneController {
    private readonly zoneService: ZoneService;

    constructor() {
        this.zoneService = new ZoneService();
    }

    /**
     * Create a new zone
     * POST /zones
     */
    createZone = async (req: Request, res: Response): Promise<void> => {
        try {
            // Transform and validate request body
            const createZoneDto: CreateZoneDto = plainToClass(CreateZoneDto, req.body);
            const errors: ValidationError[] = await validate(createZoneDto);

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
        } catch (error) {
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
    getZoneById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const userId = req.params.userId;

            const zone = await this.zoneService.getZoneById(id, userId);

            res.status(200).json({
                success: true,
                message: 'Zone retrieved successfully',
                data: zone
            });
        } catch (error) {
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
    getAllZones = async (req: Request, res: Response): Promise<void> => {
        try {
            const queryOptions: ZoneQueryOptions = {
                userId: req.query.userId as string
            };

            const zones = await this.zoneService.getAllZones(queryOptions);

            res.status(200).json({
                success: true,
                message: 'Zones retrieved successfully',
                data: zones,
                count: zones.length
            });
        } catch (error) {
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
    updateZone = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            
            // Transform and validate request body
            const updateZoneDto: UpdateZoneDto = plainToClass(UpdateZoneDto, req.body);
            const errors: ValidationError[] = await validate(updateZoneDto);

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
        } catch (error) {
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
    deleteZone = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            await this.zoneService.deleteZone(id);

            res.status(200).json({
                success: true,
                message: 'Zone deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete zone',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}
