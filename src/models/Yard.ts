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

import LineModel from "./Line.js";

import type Line from "./Line.js";

@Table({
  timestamps: true,
  tableName: "Yards",
  modelName: "Yard",
})
class Yard extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => LineModel)
  @Column(DataType.UUID)
  declare line_id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.BOOLEAN)
  declare is_main_yard: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => LineModel)
  declare line: Line;
}

export default Yard;
