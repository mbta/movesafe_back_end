import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, BelongsToMany, Default, DataType, HasMany } from "sequelize-typescript";

import MoveReasonInspectionFormAssociation from "./MoveReasonInspectionFormAssociation";
import InspectionForm from "./InspectionForm";
import Tag from "./Tag";

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

    @Column
    declare name: string;

    @Column
    declare is_available_satellite_yards: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @HasMany(() => Tag)
    declare tags: Tag[];

    @BelongsToMany(() => InspectionForm, () => MoveReasonInspectionFormAssociation)
    declare inspection_forms: InspectionForm[];
}

export default MoveReason;