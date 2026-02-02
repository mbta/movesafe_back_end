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
import UserModel from "./User.js";

import type Move from "./Move.js";
import type User from "./User.js";

@Table({
  timestamps: true,
  tableName: "Signatures",
  modelName: "Signature",
})
class Signature extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MoveModel)
  @Column(DataType.UUID)
  declare move_id: string;

  @ForeignKey(() => UserModel)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING)
  declare uri: string;

  @Column(DataType.STRING)
  declare signature_type: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveModel)
  declare move: Move;

  @BelongsTo(() => UserModel)
  declare user: User;
}

export default Signature;
