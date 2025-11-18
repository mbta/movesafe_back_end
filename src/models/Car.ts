import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType, HasMany } from "sequelize-typescript";

import Line from "./Line";
import InspectionAnswer from "./InspectionAnswer";

@Table({
    timestamps: true,
    tableName: "Cars",
    modelName: "Car",
})
class Car extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Line)
    @Column
    declare line_id: string;

    @Column
    declare series_number: string;

    @Column
    declare is_active: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Line)
    declare line: Line;

    @HasMany(() => InspectionAnswer)
    declare inspection_answers: InspectionAnswer[];
}

export default Car;