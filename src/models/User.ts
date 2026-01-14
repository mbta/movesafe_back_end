import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, Default, DataType, HasMany } from "sequelize-typescript";

import Signature from "./Signature";
import AuditLog from "./AuditLog";

@Table({
    timestamps: true,
    tableName: "Users",
    modelName: "User",
})
class User extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @Column
    declare username: string;

    @Column
    declare name: string;

    @Column
    declare badge_number: string;

    @Column
    declare key_cloak_id: string;

    @Column
    declare line: string;

    @Column
    declare role: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @HasMany(() => Signature)
    declare signatures: Signature[];

    @HasMany(() => AuditLog)
    declare audit_logs: AuditLog[];
}

export default User;