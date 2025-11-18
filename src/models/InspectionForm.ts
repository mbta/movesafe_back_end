import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, HasMany, BelongsToMany, Default, DataType } from "sequelize-typescript";

import InspectionFormSection from "./InspectionFormSection";
import MoveReasonInspectionFormAssociation from "./MoveReasonInspectionFormAssociation";
import MoveReason from "./MoveReason";
import Inspection from "./Inspection";

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

    @Column
    declare name: string;

    @Column
    declare has_comments: boolean;

    @Column
    declare is_light_rail: boolean;

    @Column
    declare has_guardside_signature: boolean;

    @Column
    declare has_foreperson_signature: boolean;

    @Column
    declare short_name: string;

    @Column
    declare description: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @HasMany(() => InspectionFormSection)
    declare inspection_form_sections: InspectionFormSection[];

    @BelongsToMany(() => MoveReason, () => MoveReasonInspectionFormAssociation)
    declare move_reasons: MoveReason[];

    @HasMany(() => Inspection)
    declare inspections: Inspection[];
}

export default InspectionForm;