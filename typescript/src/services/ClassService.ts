import { Student, Class, TeacherWorkload, Enrollment } from '../models/index.js';
import * as axiosModule from 'axios';
import { GetStudentParams, StudentDTO, StudentListingResponse } from '../types/classType.js';
import ErrorBase from '../errors/ErrorBase.js';
import Logger from '../config/logger.js';
import { InvalidInputError } from '../errors/ValidationErrors.js';
import { InternalServerError, ExternalServiceError } from '../errors/GeneralErrors.js';


const LOG = new Logger('ClassService.js');
const axios:any = axiosModule.default || axiosModule;

export default class ClassService {

  public static async updateClassNameValidation(classCode: string, className: string) {

    // Validate classCode
    if (!classCode || typeof classCode !== 'string' || classCode.trim() === '') {
      throw new InvalidInputError('classCode is required');
    }

    // Validate className
    if (!className || typeof className !== 'string' || className.trim() === '') {
      throw new InvalidInputError('className is required');
    }
  }

  public static async updateClassName(classCode: string, newName: string) {

    try {
      const [updatedRows] = await Class.update(
        { className: newName },
        { where: { classCode: classCode } }
      );

      // If affected count is 0，which mean classCode not even existed
      if (updatedRows === 0) {
        throw new InvalidInputError(`Class with code ${classCode} not found`);
      }

    } catch (error: unknown) {

      if (error instanceof ErrorBase) {
        throw error;
      }

      const stackTrace = error instanceof Error ? error.stack : String(error);
      LOG.error(`[ClassService.updateClassName] Unexpected Error: ${stackTrace}`);

      throw new InternalServerError('Unexpected Error: Failed to update class name');
    }
  }

  public static async getStudentByClassValidation(param){

    const { classCode, offset, limit } = param;

    if (!classCode || typeof classCode !== 'string' || classCode.trim() === '') {
      throw new InvalidInputError('Class code is required');
    }

    if (offset === undefined || offset === null || isNaN(Number(offset)) || Number(offset) < 0) {
      throw new InvalidInputError('Offset must be a non-negative integer');
    }

    if (limit === undefined || limit === null || isNaN(Number(limit)) || Number(limit) <= 0) {
      throw new InvalidInputError('Limit must be a positive integer');
    }
  }

  public static async getStudentByClass(params: GetStudentParams): Promise<StudentListingResponse> {

    try {
      const { classCode, offset, limit } = params;

      const [internalStudents, externalResponse] = await Promise.all([
      Student.findAll({
        attributes: ['id', 'name', 'email'],
        include: [
          {
            model: Enrollment,
            attributes: [],
            required: true,
            include: [
              {
                model: TeacherWorkload,
                attributes: [],
                required: true,
                include: [
                  {
                    model: Class,
                    attributes: [],
                    required: true,
                    where: { classCode: classCode }
                  }
                ]
              }
            ]
          }
        ],
        raw: true,
        nest: true
      })
        , axios.get(`http://localhost:5000/students`, {
          params: { class: classCode, offset: 0, limit: 1000 },
          timeout: 3000
        })
      ]);

      const externalStudents = externalResponse ? externalResponse?.data?.students : [];

      const allStudents: StudentDTO[] = [
        ...internalStudents.map(s => ({ ...s, isExternal: false })),
        ...externalStudents.map((s: any) => ({ ...s, isExternal: true }))
      ];

      allStudents.sort((a, b) => a.name.localeCompare(b.name));

      const paginatedStudents: StudentDTO[] = allStudents.slice(offset, offset + limit);

      const result : StudentListingResponse = {
        count: Array.isArray(allStudents) ? allStudents.length : 0,
        students: paginatedStudents ? paginatedStudents : []
      }

      return result;
    }
    catch (error: any) {

      if (error instanceof ErrorBase) {
        throw error;
      }

      const stackTrace = error instanceof Error ? error.stack : String(error);
      LOG.error(`[ClassService.getStudentByClass] Unexpected Error: ${stackTrace}`);

      if (axios.isAxiosError(error)) {
        LOG.error(`External Student API error: ${error.message}`);

        throw new ExternalServiceError('External student service is temporarily unavailable');
      }

      throw new InternalServerError('Unexpected Error: Failed to get student list by class name');
    }
  }
}
