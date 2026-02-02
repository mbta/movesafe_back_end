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
import InspectionFormModel from "./InspectionForm.js";
import MoveModel from "./Move.js";

import type InspectionAnswer from "./InspectionAnswer.js";
import type InspectionForm from "./InspectionForm.js";
import type Move from "./Move.js";

@Table({
  timestamps: true,
  tableName: "Inspections",
  modelName: "Inspection",
})
class Inspection extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MoveModel)
  @Column(DataType.UUID)
  declare move_id: string;

  @ForeignKey(() => InspectionFormModel)
  @Column(DataType.UUID)
  declare inspection_form_id: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveModel)
  declare move: Move;

  @BelongsTo(() => InspectionFormModel)
  declare inspection_form: InspectionForm;

  @HasMany(() => InspectionAnswerModel)
  declare inspection_answers: InspectionAnswer[];
}

export default Inspection;
