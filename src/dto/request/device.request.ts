import { IsNotEmpty, IsString, IsNumber, IsOptional, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { DeviceStatusType } from '../../enums/device.enum';

export class CreateDeviceDto {
    @IsNotEmpty()
    @IsString()
    deviceId!: string;

    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsEnum(DeviceStatusType)
    status?: DeviceStatusType;

    @IsNotEmpty()
    @IsString()
    devicetype!: string;

    @IsOptional()
    @IsObject()
    metadata?: any;
}

export class UpdateDeviceDto {
    @IsOptional()
    @IsString()
    deviceId?: string;

    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(DeviceStatusType)
    status?: DeviceStatusType;

    @IsOptional()
    @IsString()
    devicetype?: string;

}

export class DeviceQueryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(DeviceStatusType)
    status?: DeviceStatusType;

    @IsOptional()
    @IsString()
    devicetype?: string;
}