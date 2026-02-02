import {
  BelongsTo,
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
import TagModel from "./Tag.js";

import type Move from "./Move.js";
import type Tag from "./Tag.js";

@Table({
  timestamps: true,
  tableName: "Move_Tag_Associations",
  modelName: "MoveTagAssociation",
})
class MoveTagAssociation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MoveModel)
  @Column(DataType.UUID)
  declare move_id: string;

  @ForeignKey(() => TagModel)
  @Column(DataType.UUID)
  declare tag_id: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveModel)
  declare move: Move;

  @BelongsTo(() => TagModel)
  declare tag: Tag;
}

export default MoveTagAssociation;
