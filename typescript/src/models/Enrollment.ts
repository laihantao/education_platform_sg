import pkg from 'sequelize';
const { Model, DataTypes } = pkg;
import sequelize from '../config/database.js';

class Enrollment extends Model {
  public id!: number;
  public studentId!: number;
  public tcsId!: number;
  public deletedAt?: Date | null;

  static associate(models: any) {
    Enrollment.belongsTo(models.Student, { foreignKey: 'studentId' });
    Enrollment.belongsTo(models.TeacherWorkload, { foreignKey: 'tcsId' });
  }
}

Enrollment.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'students', key: 'id' }
  },
  tcsId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: { model: 'TeacherWorkloads', key: 'id' }
  }
}, {
  sequelize,
  modelName: 'Enrollment',
  tableName: 'Enrollments',
  paranoid: true, // 开启软删除
  // Prevents a student from enrolling in the same teacher's specific class twice
  indexes: [
    {
      unique: true,
      fields: ['studentId', 'tcsId', 'deletedAt']
    }
  ]
});

export default Enrollment;
