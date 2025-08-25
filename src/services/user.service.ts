import { Repository, FindManyOptions, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Device } from '../entities/device.entity';
import { AppDataSource } from '../config/database.config';
import { Singleton } from '../decorators/singleton.decorator';

@Singleton
export class UserService {
    private readonly userRepository: Repository<User>;
    private readonly deviceRepository: Repository<Device>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
        this.deviceRepository = AppDataSource.getRepository(Device);
    }

    /**
     * Get user by ID
     */
    async getUserById(id: string): Promise<User> {
        try {
            const findOptions: FindManyOptions<User> = {
                where: { id }
            };

            const user: User | null = await this.userRepository.findOne(findOptions);

            if (!user) {
                throw new Error(`User with ID ${id} not found`);
            }

            return user;
        } catch (error) {
            throw new Error(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all devices belonging to a user
     */
    async getUserDevices(userId: string): Promise<Device[]> {
        try {
            const user: User = await this.getUserById(userId);
           
            if (!user.deviceIds || user.deviceIds.length === 0) {
                return [];
            }

            const devices: Device[] = await this.deviceRepository.find({
                where: {
                    id: In(user.deviceIds)
                }
            });
            return devices;
        } catch (error) {
            throw new Error(`Failed to get user devices: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
