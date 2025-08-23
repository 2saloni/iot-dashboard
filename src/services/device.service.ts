import { Repository, FindOptionsWhere, FindManyOptions } from 'typeorm';
import { Device } from '../entities/device.entity';
import { DeviceStatusType } from '../enums/device.enum';
import { AppDataSource } from '../config/database.config';
import { Singleton } from '../decorators/singleton.decorator';
import { CreateDeviceDto, UpdateDeviceDto } from '../dto/request/device.request';

export interface DeviceQueryOptions {
    name?: string;
    status?: DeviceStatusType;
    devicetype?: string;
}

@Singleton
export class DeviceService {
    private readonly deviceRepository: Repository<Device>;

    constructor() {
        this.deviceRepository = AppDataSource.getRepository(Device);
    }

    /**
     * Create a new device
     */
    async createDevice(createDeviceDto: CreateDeviceDto): Promise<Device> {
        try {
            // Check if device with same deviceId already exists
            const existingDevice: Device | null = await this.deviceRepository.findOne({
                where: { deviceId: createDeviceDto.deviceId }
            });

            if (existingDevice) {
                throw new Error(`Device with deviceId ${createDeviceDto.deviceId} already exists`);
            }

            // Check if device with same name already exists
            const existingDeviceByName: Device | null = await this.deviceRepository.findOne({
                where: { name: createDeviceDto.name }
            });

            if (existingDeviceByName) {
                throw new Error(`Device with name '${createDeviceDto.name}' already exists`);
            }

            const device: Device = this.deviceRepository.create(createDeviceDto);

            const savedDevice: Device = await this.deviceRepository.save(device);
            return savedDevice;
        } catch (error) {
            throw new Error(`Failed to create device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get device by ID
     */
    async getDeviceById(id: string): Promise<Device> {
        try {
            const findOptions: FindManyOptions<Device> = {
                where: { id }
            };

            const device: Device | null = await this.deviceRepository.findOne(findOptions);

            if (!device) {
                throw new Error(`Device with ID ${id} not found`);
            }

            return device;
        } catch (error) {
            throw new Error(`Failed to get device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all devices with optional filtering
     */
    async getAllDevices(queryOptions: DeviceQueryOptions = {}): Promise<Device[]> {
        try {
            const whereConditions: FindOptionsWhere<Device> = {};
            
            if (queryOptions.name) {
                whereConditions.name = queryOptions.name;
            }
            
            if (queryOptions.status) {
                whereConditions.status = queryOptions.status;
            }

            if (queryOptions.devicetype) {
                whereConditions.devicetype = queryOptions.devicetype;
            }

            const findOptions: FindManyOptions<Device> = {
                where: whereConditions,
                order: { createdAt: 'DESC' }
            };

            const devices: Device[] = await this.deviceRepository.find(findOptions);
            return devices;
        } catch (error) {
            throw new Error(`Failed to get devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update device by ID
     */
    async updateDevice(id: string, updateDeviceDto: UpdateDeviceDto): Promise<Device> {
        try {
            // Check if device exists
            const existingDevice: Device | null = await this.deviceRepository.findOne({
                where: { id }
            });

            if (!existingDevice) {
                throw new Error(`Device with ID ${id} not found`);
            }
            // Merge updates into the entity
            Object.assign(existingDevice, updateDeviceDto);

            // Save updated device
            return await this.deviceRepository.save(existingDevice);
        } catch (error) {
            throw new Error(`Failed to update device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Delete device by ID (soft delete)
     */
    async deleteDevice(id: string): Promise<void> {
        try {
            const device: Device | null = await this.deviceRepository.findOne({
                where: { id }
            });

            if (!device) {
                throw new Error(`Device with ID ${id} not found`);
            }

            // Soft delete the device
            await this.deviceRepository.softDelete(id);
        } catch (error) {
            throw new Error(`Failed to delete device: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}