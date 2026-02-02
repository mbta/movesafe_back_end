import {
  BelongsTo,
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

import InspectionAnswerModel from "./InspectionAnswer.js";
import LineModel from "./Line.js";

import type InspectionAnswer from "./InspectionAnswer.js";
import type Line from "./Line.js";

@Table({
  timestamps: true,
  tableName: "Cars",
  modelName: "Car",
})
class Car extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => LineModel)
  @Column(DataType.UUID)
  declare line_id: string;

  @Column(DataType.STRING)
  declare series_number: string;

  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => LineModel)
  declare line: Line;

  @HasMany(() => InspectionAnswerModel)
  declare inspection_answers: InspectionAnswer[];
}

export default Car;
