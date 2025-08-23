import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Device } from "./device.entity";

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({nullable: false})
    name!: string;

    @Column({ unique: true, nullable: false })
    email!: string;

    @Column({nullable: false, select: false})
    password!: string;

    @Column({nullable: true, select: false})
    refreshToken?: string;

    @ManyToMany(() => Device, device => device.id, {
        onDelete: 'RESTRICT'
    })
    devices!: Device[];

    @Column({type: 'text', array: true, nullable: false, default: () => 'ARRAY[]::text[]'})
    deviceIds?: string[];
    
    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}