import { Model, Column, PrimaryKey, Table, Default, DataType, } from "sequelize-typescript";

@Table({
    timestamps: true,
    tableName: "Inspection_Form_Categories",
    modelName: "InspectionFormCategory",
})
class InspectionFormCategory extends Model {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @Column
    declare name: string;
}

export default InspectionFormCategory;