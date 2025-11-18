import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import Move from "./Move";
import Car from "./Car";

@Table({
    timestamps: true,
    tableName: "Move_Cars",
    modelName: "MoveCar",
})
class MoveCar extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Move)
    @Column
    declare move_id: string;

    @ForeignKey(() => Car)
    @Column
    declare first_car_id: string;

    @ForeignKey(() => Car)
    @Column
    declare second_car_id: string;

    @Column
    declare pair_order: number;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Move)
    declare move: Move;

    @BelongsTo(() => Car, { foreignKey: 'first_car_id', as: 'first_car' })
    declare first_car: Car;

    @BelongsTo(() => Car, { foreignKey: 'second_car_id', as: 'second_car' })
    declare second_car: Car;
}

export default MoveCar;