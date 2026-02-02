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

import CarModel from "./Car.js";
import InspectionModel from "./Inspection.js";
import InspectionFormQuestionModel from "./InspectionFormQuestion.js";

import type Car from "./Car.js";
import type Inspection from "./Inspection.js";
import type InspectionFormQuestion from "./InspectionFormQuestion.js";

@Table({
  timestamps: true,
  tableName: "Inspection_Answers",
  modelName: "InspectionAnswer",
})
class InspectionAnswer extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => InspectionModel)
  @Column(DataType.UUID)
  declare inspection_id: string;

  @ForeignKey(() => InspectionFormQuestionModel)
  @Column(DataType.UUID)
  declare inspection_form_question_id: string;

  @ForeignKey(() => CarModel)
  @Column(DataType.UUID)
  declare car_id?: string;

  @Column(DataType.BOOLEAN)
  declare has_minor_defect: boolean;

  @Column(DataType.BOOLEAN)
  declare has_major_defect: boolean;

  @Column(DataType.BOOLEAN)
  declare is_guardside: boolean;

  @Column(DataType.STRING)
  declare comments?: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => InspectionModel)
  declare inspection: Inspection;

  @BelongsTo(() => InspectionFormQuestionModel)
  declare inspection_form_question: InspectionFormQuestion;

  @BelongsTo(() => CarModel)
  declare car: Car;
}

export default InspectionAnswer;
