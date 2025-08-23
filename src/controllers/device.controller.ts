import { Request, Response } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { DeviceService, DeviceQueryOptions } from '../services/device.service';
import { DeviceStatusType } from '../enums/device.enum';
import { Singleton } from '../decorators/singleton.decorator';
import { 
    CreateDeviceDto, 
    UpdateDeviceDto
} from '../dto/request/device.request';

@Singleton
export class DeviceController {
    private readonly deviceService: DeviceService;

    constructor() {
        this.deviceService = new DeviceService();
    }

    /**
     * Create a new device
     * POST /devices
     */
    createDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            // Transform and validate request body
            const createDeviceDto: CreateDeviceDto = plainToClass(CreateDeviceDto, req.body);
            const errors: ValidationError[] = await validate(createDeviceDto);

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
        } catch (error) {
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
    getDeviceById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            const device = await this.deviceService.getDeviceById(id);

            res.status(200).json({
                success: true,
                message: 'Device retrieved successfully',
                data: device
            });
        } catch (error) {
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
    getAllDevices = async (req: Request, res: Response): Promise<void> => {
        try {
            const queryOptions: DeviceQueryOptions = {
                name: req.query.name as string,
                status: req.query.status as DeviceStatusType,
                devicetype: req.query.devicetype as string
            };

            const devices = await this.deviceService.getAllDevices(queryOptions);

            res.status(200).json({
                success: true,
                message: 'Devices retrieved successfully',
                data: devices,
                count: devices.length
            });
        } catch (error) {
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
    updateDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            
            // Transform and validate request body
            const updateDeviceDto: UpdateDeviceDto = plainToClass(UpdateDeviceDto, req.body);
            const errors: ValidationError[] = await validate(updateDeviceDto);

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
        } catch (error) {
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
    deleteDevice = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;

            await this.deviceService.deleteDevice(id);

            res.status(200).json({
                success: true,
                message: 'Device deleted successfully'
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Failed to delete device',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    };
}