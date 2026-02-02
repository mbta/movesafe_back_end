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

import InspectionFormModel from "./InspectionForm.js";
import MoveReasonInspectionFormAssociationModel from "./MoveReasonInspectionFormAssociation.js";
import TagModel from "./Tag.js";

import type InspectionForm from "./InspectionForm.js";
import type Tag from "./Tag.js";

@Table({
  timestamps: true,
  tableName: "Move_Reasons",
  modelName: "MoveReason",
})
class MoveReason extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.BOOLEAN)
  declare is_available_satellite_yards: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @HasMany(() => TagModel)
  declare tags: Tag[];

  @BelongsToMany(
    () => InspectionFormModel,
    () => MoveReasonInspectionFormAssociationModel
  )
  declare inspection_forms: InspectionForm[];
}

export default MoveReason;
