import {
  Column,
  CreatedAt,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from "sequelize-typescript";

import CarModel from "./Car.js";
import YardModel from "./Yard.js";

import type Car from "./Car.js";
import type Yard from "./Yard.js";

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

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.BOOLEAN)
  declare is_light_rail: boolean;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare last_update: Date;

  @HasMany(() => YardModel)
  declare yards: Yard[];

  @HasMany(() => CarModel)
  declare cars: Car[];
}

export default Line;
