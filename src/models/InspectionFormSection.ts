import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, HasMany, Default, DataType } from "sequelize-typescript";

import InspectionForm from "./InspectionForm";
import InspectionFormQuestion from "./InspectionFormQuestion";

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

    @ForeignKey(() => InspectionForm)
    @Column
    declare inspection_form_id: string;

    @Column
    declare name: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => InspectionForm)
    declare inspection_form: InspectionForm;

    @HasMany(() => InspectionFormQuestion)
    declare inspection_form_questions: InspectionFormQuestion[];
}

export default InspectionFormSection;