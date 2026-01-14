import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import Inspection from "./Inspection";
import InspectionFormQuestion from "./InspectionFormQuestion";
import Car from "./Car";

@Table({
    timestamps: true,
    tableName: "Inspection_Answers",
    modelName: "InspectionAnswer",
})
class InspectionAnswer extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Inspection)
    @Column
    declare inspection_id: string;

    @ForeignKey(() => InspectionFormQuestion)
    @Column
    declare inspection_form_question_id: string;

    @ForeignKey(() => Car)
    @Column
    declare car_id?: string;

    @Column
    declare has_minor_defect: boolean;

    @Column
    declare has_major_defect: boolean;

    @Column
    declare is_guardside: boolean;

    @Column
    declare comments?: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Inspection)
    declare inspection: Inspection;

    @BelongsTo(() => InspectionFormQuestion)
    declare inspection_form_question: InspectionFormQuestion;

    @BelongsTo(() => Car)
    declare car: Car;
}

export default InspectionAnswer;