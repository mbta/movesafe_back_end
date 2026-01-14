import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType, HasMany } from "sequelize-typescript";

import Move from "./Move";
import InspectionForm from "./InspectionForm";
import InspectionAnswer from "./InspectionAnswer";

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

    @ForeignKey(() => Move)
    @Column
    declare move_id: string;

    @ForeignKey(() => InspectionForm)
    @Column
    declare inspection_form_id: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Move)
    declare move: Move;

    @BelongsTo(() => InspectionForm)
    declare inspection_form: InspectionForm;

    @HasMany(() => InspectionAnswer)
    declare inspection_answers: InspectionAnswer[];
}

export default Inspection;