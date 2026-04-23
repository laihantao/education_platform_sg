import pkg from 'sequelize';
import sequelize from '../config/database.js';

const { Model, DataTypes } = pkg;

class Subject extends Model {
  public id!: number;
  public subjectCode!: string;
  public subjectName!: string;

  static associate(models: any) {
    Subject.hasMany(models.TeacherWorkload, { foreignKey: 'subjectId' });
  }
}

Subject.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    subjectCode: { type: DataTypes.STRING, unique: true, allowNull: false },
    subjectName: { type: DataTypes.STRING, allowNull: false }
  },
  { sequelize, modelName: 'Subject', tableName: 'subjects', timestamps: true }
);

export default Subject;
