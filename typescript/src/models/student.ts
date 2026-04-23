import pkg from 'sequelize';
import sequelize from '../config/database.js';

const { Model, DataTypes } = pkg;

class Student extends Model {
  public id!: number;
  public email!: string;
  public name!: string;

  static associate(models: any) {
    Student.hasMany(models.Enrollment, { foreignKey: 'studentId' });
  }
}

Student.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true, // 开启以记录创建/更新时间 [cite: 73, 74]
  }
);

export default Student;
