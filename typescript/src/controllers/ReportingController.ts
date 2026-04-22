import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import ReportingService from '../services/ReportingService.js';
import { TeacherReport } from 'reportingType.js';

const ReportingController = Express.Router();

//  Question 4: Generate teacher workload report
const teacherWorkloadReportHandler: RequestHandler = async (req, res, next) => {
  try {
    const report: TeacherReport = await ReportingService.teacherWorkLoadReport();
    return res.status(StatusCodes.OK).json(report);
  } catch (error) {

    next(error);
  }
};

ReportingController.get('/workload', teacherWorkloadReportHandler);


export default ReportingController;
