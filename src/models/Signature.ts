import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import Move from "./Move";
import User from "./User";

@Table({
    timestamps: true,
    tableName: "Signatures",
    modelName: "Signature",
})
class Signature extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Move)
    @Column
    declare move_id: string;

    @ForeignKey(() => User)
    @Column
    declare user_id: string;

    @Column
    declare uri: string;

    @Column
    declare signature_type: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Move)
    declare move: Move;

    @BelongsTo(() => User)
    declare user: User;
}

export default Signature;