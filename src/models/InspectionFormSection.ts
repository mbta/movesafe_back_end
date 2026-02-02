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

import InspectionFormModel from "./InspectionForm.js";
import InspectionFormQuestionModel from "./InspectionFormQuestion.js";

import type InspectionForm from "./InspectionForm.js";
import type InspectionFormQuestion from "./InspectionFormQuestion.js";

@Table({
  timestamps: true,
  tableName: "Inspection_Form_Sections",
  modelName: "InspectionFormSection",
})
class InspectionFormSection extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => InspectionFormModel)
  @Column(DataType.UUID)
  declare inspection_form_id: string;

  @Column(DataType.STRING)
  declare name: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => InspectionFormModel)
  declare inspection_form: InspectionForm;

  @HasMany(() => InspectionFormQuestionModel)
  declare inspection_form_questions: InspectionFormQuestion[];
}

export default InspectionFormSection;
