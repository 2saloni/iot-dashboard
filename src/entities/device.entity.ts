import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";
import { Zone } from "./zone.entity";
import { DeviceStatusType } from "../enums/device.enum";

@Entity('devices')
export class Device {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: false})
    deviceId!: number;

    @Column({ nullable: false })
    name!: string;

    @Column({ nullable: true, enum: DeviceStatusType })
    status!: string;

    @Column({ nullable: false })
    devicetype!: string;

    @Column('json', { nullable: true })
    metadata?: any;

    // @ManyToMany(() => User, user => user.devices)
    // @JoinTable({
    //     name: 'user_devices',
    //     joinColumn: { name: 'deviceId', referencedColumnName: 'id' },
    //     inverseJoinColumn: { name: 'userId', referencedColumnName: 'id' }
    // })
    // users!: User[];

    @OneToMany(() => Zone, zone => zone.device)
    zones!: Zone[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt?: Date;
}
