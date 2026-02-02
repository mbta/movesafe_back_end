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

import InspectionFormModel from "./InspectionForm.js";
import MoveReasonModel from "./MoveReason.js";

import type InspectionForm from "./InspectionForm.js";
import type MoveReason from "./MoveReason.js";

@Table({
  timestamps: true,
  tableName: "Move_Reason_Inspection_Form_Associations",
  modelName: "MoveReasonInspectionFormAssociation",
})
class MoveReasonInspectionFormAssociation extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => MoveReasonModel)
  @Column(DataType.UUID)
  declare move_reason_id: string;

  @ForeignKey(() => InspectionFormModel)
  @Column(DataType.UUID)
  declare inspection_form_id: string;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveReasonModel)
  declare move_reason: MoveReason;

  @BelongsTo(() => InspectionFormModel)
  declare inspection_form: InspectionForm;
}

export default MoveReasonInspectionFormAssociation;
