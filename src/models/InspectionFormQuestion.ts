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
import InspectionFormCategoryModel from "./InspectionFormCategory.js";
import InspectionFormSectionModel from "./InspectionFormSection.js";

import type InspectionAnswer from "./InspectionAnswer.js";
import type InspectionFormCategory from "./InspectionFormCategory.js";
import type InspectionFormSection from "./InspectionFormSection.js";

@Table({
  timestamps: true,
  tableName: "Inspection_Form_Questions",
  modelName: "InspectionFormQuestion",
})
class InspectionFormQuestion extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => InspectionFormSectionModel)
  @Column(DataType.UUID)
  declare inspection_form_section_id: string;

  @ForeignKey(() => InspectionFormCategoryModel)
  @Column(DataType.UUID)
  declare inspection_form_category_id: string;

  @Column(DataType.STRING)
  declare description: string;

  @Column(DataType.INTEGER)
  declare question_type: number;

  @Column(DataType.BOOLEAN)
  declare has_comments: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => InspectionFormSectionModel)
  declare inspection_form_section: InspectionFormSection;

  @BelongsTo(() => InspectionFormCategoryModel)
  declare inspection_form_category: InspectionFormCategory;

  @HasMany(() => InspectionAnswerModel)
  declare inspection_answers: InspectionAnswer[];
}

export default InspectionFormQuestion;
