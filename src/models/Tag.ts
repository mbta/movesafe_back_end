import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, Default, DataType, BelongsTo, ForeignKey, BelongsToMany } from "sequelize-typescript";

import MoveReason from "./MoveReason";
import MoveTagAssociation from "./MoveTagAssociation";
import { Move } from ".";

@Table({
    timestamps: true,
    tableName: "Tags",
    modelName: "Tag",
})
class Tag extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => MoveReason)
    @Column
    declare move_reason_id: string;

    @Column
    declare name: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => MoveReason)
    declare move_reason: MoveReason;

    @BelongsToMany(() => Move, () => MoveTagAssociation)
    declare moves: Move[];
}

export default Tag;