import {
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import InspectionModel from "./Inspection.js";
import InspectionFormSectionModel from "./InspectionFormSection.js";
import MoveReasonModel from "./MoveReason.js";
import MoveReasonInspectionFormAssociationModel from "./MoveReasonInspectionFormAssociation.js";

import type Inspection from "./Inspection.js";
import type InspectionFormSection from "./InspectionFormSection.js";
import type MoveReason from "./MoveReason.js";

@Table({
  timestamps: true,
  tableName: "Inspection_Forms",
  modelName: "InspectionForm",
})
class InspectionForm extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.BOOLEAN)
  declare has_comments: boolean;

  @Column(DataType.BOOLEAN)
  declare is_light_rail: boolean;

  @Column(DataType.BOOLEAN)
  declare has_guardside_signature: boolean;

  @Column(DataType.BOOLEAN)
  declare has_foreperson_signature: boolean;

  @Column(DataType.STRING)
  declare short_name: string;

  @Column(DataType.STRING)
  declare description: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @HasMany(() => InspectionFormSectionModel)
  declare inspection_form_sections: InspectionFormSection[];

  @BelongsToMany(
    () => MoveReasonModel,
    () => MoveReasonInspectionFormAssociationModel
  )
  declare move_reasons: MoveReason[];

  @HasMany(() => InspectionModel)
  declare inspections: Inspection[];
}

export default InspectionForm;
