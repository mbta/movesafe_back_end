import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import Line from "./Line";

@Table({
    timestamps: true,
    tableName: "Yards",
    modelName: "Yard",
})
class Yard extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Line)
    @Column
    declare line_id: string;

    @Column
    declare name: string;

    @Column
    declare is_main_yard: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Line)
    declare line: Line;
}

export default Yard;