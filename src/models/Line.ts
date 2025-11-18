import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, HasMany, Default, DataType } from "sequelize-typescript";

import Yard from "./Yard";
import Car from "./Car";

@Table({
    timestamps: true,
    tableName: "Lines",
    modelName: "Line",
})
class Line extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @Column
    declare name: string;

    @Column
    declare is_light_rail: boolean;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @HasMany(() => Yard)
    declare yards: Yard[];

    @HasMany(() => Car)
    declare cars: Car[];
}

export default Line;