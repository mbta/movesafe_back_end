import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import MoveModel from "./Move.js";
import MoveReasonModel from "./MoveReason.js";
import MoveTagAssociationModel from "./MoveTagAssociation.js";

import type Move from "./Move.js";
import type MoveReason from "./MoveReason.js";

@Table({
  timestamps: true,
  tableName: "Tags",
  modelName: "Tag",
})
class Tag extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MoveReasonModel)
  @Column(DataType.UUID)
  declare move_reason_id: string;

  @Column(DataType.STRING)
  declare name: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveReasonModel)
  declare move_reason: MoveReason;

  @BelongsToMany(() => MoveModel, () => MoveTagAssociationModel)
  declare moves: Move[];
}

export default Tag;
