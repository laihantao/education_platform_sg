import sequelize from '../config/database.js';
import Student from './student.js';
import Class from './class.js';
import Teacher from './teacher.js';
import Subject from './subject.js';
import TeacherWorkload from './TeacherWorkload.js';
import Enrollment from './Enrollment.js';
import Logger from '../config/logger.js';

const LOG = new Logger('server.js');

// 1. 组合成一个对象
const models = {
  Student,
  Class,
  Teacher,
  Subject,
  TeacherWorkload,
  Enrollment,
};

// 2. 执行每个模型的关联逻辑
Object.values(models).forEach((model: any) => {
  if (model.associate) {
    model.associate(models);
  }
});

LOG.info(`\n##################\nModels loaded in index: ${Object.keys(models)}`)

export { sequelize };
export { Student, Class, Teacher, Subject, TeacherWorkload, Enrollment };
