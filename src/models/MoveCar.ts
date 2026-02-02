import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import CarModel from "./Car.js";
import MoveModel from "./Move.js";

import type Car from "./Car.js";
import type Move from "./Move.js";

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

  @ForeignKey(() => MoveModel)
  @Column(DataType.UUID)
  declare move_id: string;

  @ForeignKey(() => CarModel)
  @Column(DataType.UUID)
  declare first_car_id: string;

  @ForeignKey(() => CarModel)
  @Column(DataType.UUID)
  declare second_car_id: string;

  @Column(DataType.INTEGER)
  declare pair_order: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @BelongsTo(() => MoveModel)
  declare move: Move;

  @BelongsTo(() => CarModel, { foreignKey: "first_car_id", as: "first_car" })
  declare first_car: Car;

  @BelongsTo(() => CarModel, { foreignKey: "second_car_id", as: "second_car" })
  declare second_car: Car;
}

export default MoveCar;
