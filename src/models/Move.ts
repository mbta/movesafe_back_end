import { Model, Column, CreatedAt, PrimaryKey, Table, UpdatedAt, ForeignKey, BelongsTo, HasMany, Default, DataType, AllowNull, BelongsToMany } from "sequelize-typescript";

import MoveReason from "./MoveReason";
import Yard from "./Yard";
import User from "./User";
import Inspection from "./Inspection";
import MoveCar from "./MoveCar";
import Signature from "./Signature";
import AuditLog from "./AuditLog";
import Tag from "./Tag";
import MoveTagAssociation from "./MoveTagAssociation";

@Table({
    timestamps: true,
    tableName: "Moves",
    modelName: "Move",
})
class Moves extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Yard)
    @Column
    declare yard_id: string;

    @ForeignKey(() => MoveReason)
    @Column
    declare move_reason_id: string;

    @ForeignKey(() => User)
    @AllowNull
    @Column({ type: DataType.STRING })
    declare move_done_by_user_id?: string | null;

    @ForeignKey(() => User)
    @AllowNull
    @Column({ type: DataType.STRING })
    declare inspections_done_by_user_id?: string | null;

    @ForeignKey(() => User)
    @AllowNull
    @Column({ type: DataType.STRING })
    declare guardside_inspection_done_by_user_id?: string | null;

    @ForeignKey(() => User)
    @Column
    declare yardmaster_user_id: string;

    @Column
    declare due_date: Date;

    @Column
    declare status: string;

    @Column
    declare priority_order: number;

    @Column
    declare move_from: string;

    @Column
    declare move_to: string;

    @CreatedAt
    declare created_at: Date;

    @UpdatedAt
    declare last_update: Date;

    @BelongsTo(() => Yard)
    declare yard: Yard;

    @BelongsTo(() => MoveReason)
    declare move_reason: MoveReason;

    @BelongsTo(() => User, 'move_done_by_user_id')
    declare move_done_by_user: User;

    @BelongsTo(() => User, 'inspections_done_by_user_id')
    declare inspections_done_by_user: User;

    @BelongsTo(() => User, 'guardside_inspection_done_by_user_id')
    declare guardside_inspection_done_by_user: User;

    @BelongsTo(() => User, 'yardmaster_user_id')
    declare yardmaster_user: User;

    @HasMany(() => Inspection)
    declare inspections: Inspection[];

    @HasMany(() => MoveCar)
    declare move_cars: MoveCar[];

    @HasMany(() => Signature)
    declare signatures: Signature[];

    @HasMany(() => AuditLog)
    declare audit_logs: AuditLog[];

    @BelongsToMany(() => Tag, () => MoveTagAssociation)
    declare tags: Tag[];
}

export default Moves;