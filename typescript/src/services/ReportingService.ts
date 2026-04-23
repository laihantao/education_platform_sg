import { Sequelize } from 'sequelize';
import { Teacher, Subject, TeacherWorkload } from '../models/index.js';
import ErrorCodes from '../const/ErrorCodes.js';
import ErrorBase from '../errors/ErrorBase.js';
import Logger from '../config/logger.js';
import {WorkloadQueryResult, TeacherReport, SubjectInfo} from '../types/reportingType.js'

const LOG = new Logger('ReportingService.js');

export default class ReportingService {

  public static async teacherWorkLoadReport() {

    try {
      const workloads = await TeacherWorkload.findAll({
        attributes: [
          'teacherId',
          'subjectId',
          [Sequelize.fn('COUNT', Sequelize.col('classId')), 'numberOfClasses']
        ],
        include: [
          {
            model: Teacher,
            attributes: ['name'],
            required: true
          },
          {
            model: Subject,
            attributes: ['subjectCode', 'subjectName'],
            required: true
          }
        ],
        // Group by Teacher ID and Subject ID to get the count per subject
        group: ['teacherId', 'subjectId'],
        raw: true,
        nest: true
      }) as unknown as WorkloadQueryResult[];

      // 2. Format the data to match the expected JSON response
      const report = workloads.reduce<TeacherReport>((acc, curr: WorkloadQueryResult) => {

        const teacherName = curr?.Teacher?.name || 'Unknown';

        const subjectData: SubjectInfo = {
          subjectCode: curr.Subject.subjectCode,
          subjectName: curr.Subject.subjectName,
          numberOfClasses: parseInt(curr.numberOfClasses as string, 10) // In case if count datatype returned by Sequelize is string
        };

        if (!acc[teacherName]) {
          acc[teacherName] = [];
        }

        acc[teacherName].push(subjectData);
        return acc;
      }, {});

      return report;
    }
    catch(error: unknown) {

      // If it's a known error type from try section, can just throw to controller
      if (error instanceof ErrorBase) {
        throw error;
      }

      // Wrap the system error into a generic ErrorBase for a clean API response
      const stackTrace = error instanceof Error ? error.stack : String(error);
      LOG.error(`[ReportService.teacherWorkLoadReport] Database Task Failed: ${stackTrace}`);

      throw new ErrorBase('Failed to generate report', ErrorCodes.DATABASE_ERROR, 500);
    }
  }
}
