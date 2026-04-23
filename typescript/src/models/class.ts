import pkg from 'sequelize';
import sequelize from '../config/database.js';

const { Model, DataTypes } = pkg;

class Class extends Model {
  public id!: number;
  public classCode!: string;
  public className!: string;

  static associate(models: any) {
    Class.hasMany(models.TeacherWorkload, { foreignKey: 'classId' });
  }
}

Class.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    classCode: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false // 对应 CSV 中的 classCode
    },
    className: {
      type: DataTypes.STRING,
      allowNull: false // 对应 CSV 中的 className
    }
  },
  {
    sequelize,
    modelName: 'Class',
    tableName: 'classes',
    timestamps: true,
  }
);

export default Class;
