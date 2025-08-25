import { Repository, FindOptionsWhere, FindManyOptions, In } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { AppDataSource } from '../config/database.config';
import { Singleton } from '../decorators/singleton.decorator';
import { CreateZoneDto, UpdateZoneDto } from '../dto/request/zone.request';
import { UserService } from './user.service';
import { Device } from '../entities/device.entity';

export interface ZoneQueryOptions {
    userId?: string;
}

@Singleton
export class ZoneService {
    private readonly zoneRepository: Repository<Zone>;

    private readonly userService: UserService;

    constructor() {
        this.zoneRepository = AppDataSource.getRepository(Zone);
        this.userService = new UserService();
    }

    /**
     * Create a new zone
     */
    async createZone(createZoneDto: CreateZoneDto): Promise<Zone> {
        try {
            // Check if zone with same name already exists for this device
            const existingZone: Zone | null = await this.zoneRepository.findOne({
                where: { 
                    name: createZoneDto.name,
                    deviceId: createZoneDto.deviceId
                }
            });

            if (existingZone) {
                throw new Error(`Zone with name '${createZoneDto.name}' already exists for this device`);
            }

            const zone: Zone = this.zoneRepository.create(createZoneDto);

            const savedZone: Zone = await this.zoneRepository.save(zone);
            return savedZone;
        } catch (error) {
            throw new Error(`Failed to create zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get zone by ID
     * Only returns the zone if it belongs to the requested user
     */
    async getZoneById(id: string, queryOptions: ZoneQueryOptions): Promise<Zone> {
        try {
            // Check if userId is provided for authorization
            if (!queryOptions.userId) {
                throw new Error(`User ID is required for authorization`);
            }
            
            // First get all devices for the user
            const userDevices: Device[] = await this.userService.getUserDevices(queryOptions.userId);
           
            const deviceIds: string[] = userDevices.map(device => device.id);
            
            // If user has no devices, they can't access any zones
            if (deviceIds.length === 0) {
                throw new Error(`Not authorized to access any zones`);
            }
            
            // Only fetch zone if it belongs to one of the user's devices
            const zone: Zone | null = await this.zoneRepository.findOne({
                where: { 
                    id,
                    deviceId: In(deviceIds)
                },
                relations: ['device']
            });
            
            if (!zone) {
                throw new Error(`Zone not found or you are not authorized to access it`);
            }
            return zone;
        } catch (error) {
            throw new Error(`Failed to get zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all zones with optional filtering
     * If userId is provided, only return zones for devices belonging to that user
     */
    async getAllZones(queryOptions: ZoneQueryOptions = {}): Promise<Zone[]> {
        try {
            let deviceIds: string[] = [];
            
            // If userId is provided, get all devices for that user
            if (queryOptions.userId) {
                const userDevices: Device[] = await this.userService.getUserDevices(queryOptions.userId);
                deviceIds = userDevices.map(device => device.id);
                
                // If user has no devices, return empty array
                if (deviceIds.length === 0) {
                    return [];
                }
            }

            const findOptions: FindManyOptions<Zone> = {
                order: { createdAt: 'DESC' },
                relations: ['device']
            };

            // If we have device IDs from the user, filter by them
            if (deviceIds.length > 0) {
                findOptions.where = {
                    deviceId: In(deviceIds)
                };
            }

            const zones: Zone[] = await this.zoneRepository.find(findOptions);
            return zones;
        } catch (error) {
            throw new Error(`Failed to get zones: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update zone by ID
     */
    async updateZone(id: string, updateZoneDto: UpdateZoneDto): Promise<Zone> {
        try {
            // Check if zone exists
            const existingZone: Zone | null = await this.zoneRepository.findOne({
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
        } catch (error) {
            throw new Error(`Failed to update zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete zone by ID (soft delete)
     */
    async deleteZone(id: string): Promise<void> {
        try {
            const zone: Zone | null = await this.zoneRepository.findOne({
                where: { id }
            });

            if (!zone) {
                throw new Error(`Zone with ID ${id} not found`);
            }

            // Soft delete the zone
            await this.zoneRepository.softDelete(id);
        } catch (error) {
            throw new Error(`Failed to delete zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
