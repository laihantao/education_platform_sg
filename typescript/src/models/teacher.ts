import pkg from 'sequelize';
import sequelize from '../config/database.js';

const { Model, DataTypes } = pkg;

class Teacher extends Model {
  public id!: number;
  public email!: string;
  public name!: string;

  // 定义静态关联方法
  static associate(models: any) {
    Teacher.hasMany(models.TeacherWorkload, { foreignKey: 'teacherId' });
  }
}

Teacher.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false // TeacherEmail 是必填且唯一的标识
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: true, // 建议开启，方便追踪数据上传时间 [cite: 73, 74]
  }
);

export default Teacher;
