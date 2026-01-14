import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import InspectionForm from "./InspectionForm";
import MoveReason from "./MoveReason";

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

    @ForeignKey(() => MoveReason)
    @Column
    declare move_reason_id: string;

    @ForeignKey(() => InspectionForm)
    @Column
    declare inspection_form_id: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => MoveReason)
    declare move_reason: MoveReason;

    @BelongsTo(() => InspectionForm)
    declare inspection_form: InspectionForm;
}

export default MoveReasonInspectionFormAssociation;