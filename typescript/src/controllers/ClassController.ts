import Express, { RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import ClassService from '../services/ClassService.js';
import { StudentDTO } from 'classType.js';

const ClassController = Express.Router();

//  Question 3: Update class name
const updateClassName: RequestHandler = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const { className } = req.body;

    // Validation input
    await ClassService.updateClassNameValidation(classCode, className);

    // Update class name
    await ClassService.updateClassName(classCode, className);

    return res.sendStatus(StatusCodes.NO_CONTENT);

  } catch (error) {
    next(error);
  }
};

// Question 2: Get students by class
const getStudentByClass: RequestHandler = async (req, res, next) => {
  try {
    const { classCode } = req.params;
    const offset = parseInt(req.query.offset as string, 10);
    const limit = parseInt(req.query.limit as string, 10);

    await ClassService.getStudentByClassValidation({ classCode, offset, limit });

    const students : StudentDTO[] = await ClassService.getStudentByClass({ classCode, offset, limit });

    return res.status(StatusCodes.OK).json({
      count: Array.isArray(students) ? students.length : 0,
      students: students
    });

  } catch (error) {
    next(error);
  }
};

ClassController.put('/:classCode', updateClassName);
ClassController.get('/:classCode/students', getStudentByClass);


export default ClassController;
