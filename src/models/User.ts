import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import AuditLogModel from "./AuditLog.js";
import SignatureModel from "./Signature.js";

import type AuditLog from "./AuditLog.js";
import type Signature from "./Signature.js";

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

  @Column(DataType.STRING)
  declare username: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.STRING)
  declare badge_number: string;

  @Column(DataType.STRING)
  declare key_cloak_id: string;

  @Column(DataType.UUID)
  declare line: string;

  @Column(DataType.STRING)
  declare role: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @HasMany(() => SignatureModel)
  declare signatures: Signature[];

  @HasMany(() => AuditLogModel)
  declare audit_logs: AuditLog[];
}

export default User;
