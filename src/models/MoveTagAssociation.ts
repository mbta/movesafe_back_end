import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, Default, DataType } from "sequelize-typescript";

import Move from "./Move";
import Tag from "./Tag";

@Table({
    timestamps: true,
    tableName: "Move_Tag_Associations",
    modelName: "MoveTagAssociation",
})
class MoveTagAssociation extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Move)
    @Column
    declare move_id: string;

    @ForeignKey(() => Tag)
    @Column
    declare tag_id: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Move)
    declare move: Move;

    @BelongsTo(() => Tag)
    declare tag: Tag;
}

export default MoveTagAssociation;