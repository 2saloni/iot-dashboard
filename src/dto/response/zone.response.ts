export class ZoneDto {
    id!: string;
    name!: string;
    description?: string;
    deviceId!: string;
    createdAt!: Date;
    updatedAt!: Date;
    deletedAt?: Date;
}

export class CreateZoneResponseDto {
    success!: boolean;
    message!: string;
    data!: ZoneDto;
}

export class GetZoneResponseDto {
    success!: boolean;
    message!: string;
    data!: ZoneDto;
}

export class GetZonesResponseDto {
    success!: boolean;
    message!: string;
    data!: ZoneDto[];
    count!: number;
}

export class UpdateZoneResponseDto {
    success!: boolean;
    message!: string;
    data!: ZoneDto;
}

export class DeleteZoneResponseDto {
    success!: boolean;
    message!: string;
}

export class ErrorResponseDto {
    success!: boolean;
    message!: string;
    error!: string;
}
