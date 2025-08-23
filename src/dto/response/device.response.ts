import { DeviceStatusType } from '../../enums/device.enum';

export class DeviceDto {
    id!: string;
    deviceId!: number;
    name!: string;
    status!: DeviceStatusType;
    devicetype!: string;
    metadata?: any;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date;
}

export class CreateDeviceResponseDto {
    success!: boolean;
    message!: string;
    data!: DeviceDto;
}

export class GetDeviceResponseDto {
    success!: boolean;
    message!: string;
    data!: DeviceDto;
}

export class GetDevicesResponseDto {
    success!: boolean;
    message!: string;
    data!: DeviceDto[];
    count!: number;
}

export class UpdateDeviceResponseDto {
    success!: boolean;
    message!: string;
    data!: DeviceDto;
}

export class DeleteDeviceResponseDto {
    success!: boolean;
    message!: string;
}

export class ErrorResponseDto {
    success!: boolean;
    message!: string;
    error!: string;
}