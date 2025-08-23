import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Zone } from '../entities/zone.entity';
import { AppDataSource } from '../config/database.config';
import { Singleton } from '../decorators/singleton.decorator';
import { CreateZoneDto, UpdateZoneDto } from '../dto/request/zone.request';

export interface ZoneQueryOptions {
    name?: string;
    deviceId?: string;
}

@Singleton
export class ZoneService {
    private readonly zoneRepository: Repository<Zone>;

    constructor() {
        this.zoneRepository = AppDataSource.getRepository(Zone);
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
     */
    async getZoneById(id: string): Promise<Zone> {
        try {
            const findOptions: FindManyOptions<Zone> = {
                where: { id }
            };

            const zone: Zone | null = await this.zoneRepository.findOne(findOptions);

            if (!zone) {
                throw new Error(`Zone with ID ${id} not found`);
            }

            return zone;
        } catch (error) {
            throw new Error(`Failed to get zone: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all zones with optional filtering
     */
    async getAllZones(queryOptions: ZoneQueryOptions = {}): Promise<Zone[]> {
        try {
            const whereConditions: FindOptionsWhere<Zone> = {};
            
            if (queryOptions.name) {
                whereConditions.name = queryOptions.name;
            }
            
            if (queryOptions.deviceId) {
                whereConditions.deviceId = queryOptions.deviceId;
            }

            const findOptions: FindManyOptions<Zone> = {
                where: whereConditions,
                order: { createdAt: 'DESC' }
            };

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
