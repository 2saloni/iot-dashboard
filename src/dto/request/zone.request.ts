import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateZoneDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsNotEmpty()
    @IsUUID()
    deviceId!: string;
}

export class UpdateZoneDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUUID()
    deviceId?: string;
}

export class ZoneQueryDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsUUID()
    deviceId?: string;
}
