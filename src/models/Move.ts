import {
  AllowNull,
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import AuditLogModel from "./AuditLog.js";
import InspectionModel from "./Inspection.js";
import MoveCarModel from "./MoveCar.js";
import MoveReasonModel from "./MoveReason.js";
import MoveTagAssociationModel from "./MoveTagAssociation.js";
import SignatureModel from "./Signature.js";
import TagModel from "./Tag.js";
import UserModel from "./User.js";
import YardModel from "./Yard.js";

import type AuditLog from "./AuditLog.js";
import type Inspection from "./Inspection.js";
import type MoveCar from "./MoveCar.js";
import type MoveReason from "./MoveReason.js";
import type Signature from "./Signature.js";
import type Tag from "./Tag.js";
import type User from "./User.js";
import type Yard from "./Yard.js";

@Table({
  timestamps: true,
  tableName: "Moves",
  modelName: "Move",
})
class Move extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => YardModel)
  @Column(DataType.UUID)
  declare yard_id: string;

  @ForeignKey(() => MoveReasonModel)
  @Column(DataType.UUID)
  declare move_reason_id: string;

  @ForeignKey(() => UserModel)
  @AllowNull
  @Column(DataType.UUID)
  declare move_done_by_user_id?: string | null;

  @ForeignKey(() => UserModel)
  @AllowNull
  @Column(DataType.UUID)
  declare inspections_done_by_user_id?: string | null;

  @ForeignKey(() => UserModel)
  @AllowNull
  @Column(DataType.UUID)
  declare guardside_inspection_done_by_user_id?: string | null;

  @ForeignKey(() => UserModel)
  @AllowNull
  @Column(DataType.UUID)
  declare inspections_selected_by_user_id?: string | null;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare yardmaster_user_id: string;

  @Column(DataType.DATE)
  declare due_date: Date;

  @Column(DataType.STRING)
  declare status: string;

  @Column(DataType.INTEGER)
  declare priority_order: number;

  @Column(DataType.STRING)
  declare move_from: string;

  @Column(DataType.STRING)
  declare move_to: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => YardModel)
  declare yard: Yard;

  @BelongsTo(() => MoveReasonModel)
  declare move_reason: MoveReason;

  @BelongsTo(() => UserModel, "move_done_by_user_id")
  declare move_done_by_user: User;

  @BelongsTo(() => UserModel, "inspections_done_by_user_id")
  declare inspections_done_by_user: User;

  @BelongsTo(() => UserModel, "inspections_selected_by_user_id")
  declare inspections_selected_by_user: User;

  @BelongsTo(() => UserModel, "guardside_inspection_done_by_user_id")
  declare guardside_inspection_done_by_user: User;

  @BelongsTo(() => UserModel, "yardmaster_user_id")
  declare yardmaster_user: User;

  @HasMany(() => InspectionModel)
  declare inspections: Inspection[];

  @HasMany(() => MoveCarModel)
  declare move_cars: MoveCar[];

  @HasMany(() => SignatureModel)
  declare signatures: Signature[];

  @HasMany(() => AuditLogModel)
  declare audit_logs: AuditLog[];

  @BelongsToMany(() => TagModel, () => MoveTagAssociationModel)
  declare tags: Tag[];
}

export default Move;
