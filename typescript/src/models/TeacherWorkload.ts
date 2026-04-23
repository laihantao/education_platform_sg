import pkg from 'sequelize';
import sequelize from '../config/database.js';

const { Model, DataTypes } = pkg;

class TeacherWorkload extends Model {
  public id!: number;
  public teacherId!: number;
  public classId!: number;
  public subjectId!: number;
  public deletedAt?: Date | null;

  static associate(models: any) {
    TeacherWorkload.belongsTo(models.Teacher, { foreignKey: 'teacherId' });
    TeacherWorkload.belongsTo(models.Class, { foreignKey: 'classId' });
    TeacherWorkload.belongsTo(models.Subject, { foreignKey: 'subjectId' });
    TeacherWorkload.hasMany(models.Enrollment, { foreignKey: 'tcsId' });
  }
}

TeacherWorkload.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    teacherId: {
      type: DataTypes.INTEGER,
      // primaryKey: true,
      references: { model: 'teachers', key: 'id' }
    },
    classId: {
      type: DataTypes.INTEGER,
      // primaryKey: true,
      references: { model: 'classes', key: 'id' }
    },
    subjectId: {
      type: DataTypes.INTEGER,
      // primaryKey: true,
      references: { model: 'subjects', key: 'id' }
    }
  },
  {
    sequelize,
    modelName: 'TeacherWorkload',
    tableName: 'TeacherWorkloads',
    timestamps: true,
    paranoid: true, // 开启软删除
    indexes: [
      {
        unique: true,
        fields: ['teacherId', 'classId', 'subjectId', 'deletedAt']
      }
    ]
  }
);

export default TeacherWorkload;
