import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType, HasMany } from "sequelize-typescript";

import InspectionFormSection from "./InspectionFormSection";
import InspectionAnswer from "./InspectionAnswer";
import InspectionFormCategory from "./InspectionFormCategory";

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

    @ForeignKey(() => InspectionFormSection)
    @Column
    declare inspection_form_section_id: string;

    @ForeignKey(() => InspectionFormCategory)
    @Column
    declare inspection_form_category_id: string;

    @Column
    declare description: string;

    @Column
    declare question_type: number;

    @Column
    declare has_comments: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => InspectionFormSection)
    declare inspection_form_section: InspectionFormSection;

    @BelongsTo(() => InspectionFormCategory)
    declare inspection_form_category: InspectionFormCategory;

    @HasMany(() => InspectionAnswer)
    declare inspection_answers: InspectionAnswer[];
}

export default InspectionFormQuestion;