import { sequelize, Teacher, Student, Class, Subject, TeacherWorkload, Enrollment } from '../models/index.js';
import ErrorBase from '../errors/ErrorBase.js';
import Logger from '../config/logger.js';
import 'dotenv/config';
import { CsvItem } from 'csvItem.js';
import { InvalidInputError, InvalidCsvColumnError, InvalidCsvFormatError } from '../errors/ValidationErrors.js';
import { InternalServerError } from '../errors/GeneralErrors.js';

const DEFAULT_LIMIT = 10485760;
const LOG = new Logger('DataImportService.js');

export default class DataImportService {

    public static async processImportValidation(file) {
        if (!file) {
            throw new InvalidInputError('File is required');
        }

        const allowedMimeTypes = [
            'multipart/form-data', // With postman, the mimetype is multipart/form-data even for csv file, so we need to allow it
            'text/csv',
            'application/vnd.ms-excel'
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new InvalidInputError('Invalid file type. Only CSV files are allowed');
        }

        if (!file.originalname.toLowerCase().endsWith('.csv')) {
            throw new InvalidInputError('Only .csv files allowed');
        }
        const envValue = process.env.MAX_IMPORT_FILE_SIZE;

        const limit = envValue ? parseInt(envValue, 10) : DEFAULT_LIMIT;

        if (Number(file.size) > limit) { // 10MB limit
            throw new InvalidInputError('File size exceeds the limit of 10MB')
        }

        LOG.info(`Received files: ${file.originalname} \nMIME type: ${file.mimetype} \nSize: ${file.size}`);

        if (!file.path) {
            throw new InvalidInputError('File path is missing');
        }

    }

    public static async processImportDataValidation(data: CsvItem[]) {
        try {

            if (!Array.isArray(data) || data.length === 0) {
                throw new InvalidInputError('CSV data is empty or not in expected format');
            }

            for (const [index, row] of data.entries()) {
                const rowNum = index + 1;
                const requiredFields = ['teacherEmail', 'teacherName', 'studentEmail', 'studentName', 'classCode', 'classname', 'subjectCode', 'subjectName', 'toDelete']; // Handle wrong naming convention classname
                for (const field of requiredFields) {
                    if (!row[field] || typeof row[field] !== 'string' || row[field].trim() === '') {
                        throw new InvalidCsvColumnError(`Row ${rowNum}: Field "${field}" is required`);
                    }
                }

                if (row.toDelete !== '0' && row.toDelete !== '1') {
                    throw new InvalidCsvFormatError(`Row ${rowNum}: "toDelete" must be '0' or '1'`);
                }

                // Validate teacher & email whether it is valid email format
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.teacherEmail)) {
                    throw new InvalidCsvFormatError(`Row ${rowNum}: "teacherEmail" is invalid`);
                }

                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.studentEmail)) {
                    throw new InvalidCsvFormatError(`Row ${rowNum}: "studentEmail" is invalid`);
                }
            }
        }
        catch (error: unknown) {

            if (error instanceof ErrorBase) {
                throw error;
            }

            const stackTrace = error instanceof Error ? error.stack : String(error);
            LOG.error(`[DataImportService.processImportDataValidation] Unexpected Error: ${stackTrace}`);

            throw new InternalServerError('Failed to validate import data');
        }
    }

    public static async processImport(data: CsvItem[]) {

        const transaction = await sequelize.transaction();

        try {

            // Section 1: Upsert Master Data

            // 1.1 Extract unique teachers, students, classes, and subjects from the input data
            const teachers= new Map<string, string>();
            const students = new Map<string, string>();
            const classes = new Map<string, string>();
            const subjects = new Map<string, string>();

            // 1.2 Loop through the data to populate the maps, it will make sure the teacherName (etc) is latest row.
            // upsert will take the primary key
            for (const row of data) {
                teachers.set(row.teacherEmail, row.teacherName);
                students.set(row.studentEmail, row.studentName);
                classes.set(row.classCode, row.classname); // Handle wrong naming convention classname
                subjects.set(row.subjectCode, row.subjectName);
            }

            // 1.3 Upsert the master data in Promise.all for better performance
            await Promise.all([
                ...Array.from(teachers).map(([email, name]) => Teacher.upsert({ email, name }, { transaction })),
                ...Array.from(students).map(([email, name]) => Student.upsert({ email, name }, { transaction })),
                ...Array.from(classes).map(([classCode, className]) => Class.upsert({ classCode, className }, { transaction })),
                ...Array.from(subjects).map(([subjectCode, subjectName]) => Subject.upsert({ subjectCode, subjectName }, { transaction }))
            ]);

            // Section 2: Process Enrollments and Workloads

            // 2.1 Loop through the data again to process enrollments and workloads
            for (const row of data) {

                // 2.2 Resolve the IDs for Teacher, Class, Subject, and Student based on the current row's data
                const [teacher, cls, subject, student] = await Promise.all([
                    Teacher.findOne({ where: { email: row.teacherEmail }, transaction }),
                    Class.findOne({ where: { classCode: row.classCode }, transaction }),
                    Subject.findOne({ where: { subjectCode: row.subjectCode }, transaction }),
                    Student.findOne({ where: { email: row.studentEmail }, transaction })
                ]);

                // 2.3 Ensure the TeacherWorkload exists (Get the "Offering" ID)
                const [workload] = await TeacherWorkload.findOrCreate({
                    where: {
                        teacherId: teacher?.id,
                        classId: cls?.id,
                        subjectId: subject?.id
                    },
                    transaction,
                    paranoid: false // Search even if it was soft-deleted before
                });

                // 2.4 If it was soft-deleted (Which mean this teacher taught this, but now dont have active student), restore it
                if (workload?.deletedAt) {
                    await workload.restore({ transaction });
                }

                // 2.5 Process enrollment based on the "toDelete" flag
                if (row.toDelete === '1') {
                    // 2.5.1 UNENROLL: Soft delete the specific enrollment
                    await Enrollment.destroy({
                        where: {
                            studentId: student?.id,
                            tcsId: workload?.id
                        },
                        transaction
                    });

                }
                // 2.6 If toDelete is not '1', then we want to ensure the enrollment exists (and restore if it was soft-deleted)
                else {

                    // 2.6.1 ENROLL: Find or create the enrollment
                    const [enrollment, created] = await Enrollment.findOrCreate({
                        where: {
                            studentId: student?.id,
                            tcsId: workload?.id
                        },
                        transaction,
                        paranoid: false
                    });

                    // 2.6.2 If it was not created (already exists) but is currently soft-deleted, restore it
                    if (!created && enrollment?.deletedAt) {
                        await enrollment.restore({ transaction });
                    }
                }
            }

            // Section 3: Get all unique workload combinations from the input data to check for empty workloads
            const uniqueWorkloads = new Set(data.map(r => `${r.teacherEmail}|${r.classCode}|${r.subjectCode}`));

            // Section 4: Check each workload for active enrollments and clean up if necessary
            for (const combo of uniqueWorkloads) {
                const [tEmail, cCode, sCode] = combo.split('|');

                // Resolve the IDs again to find the Workload ID
                const [teacher, cls, subject] = await Promise.all([
                    Teacher.findOne({ where: { email: tEmail }, transaction }),
                    Class.findOne({ where: { classCode: cCode }, transaction }),
                    Subject.findOne({ where: { subjectCode: sCode }, transaction })
                ]);

                const workload = await TeacherWorkload.findOne({
                    where: { teacherId: teacher?.id, classId: cls?.id, subjectId: subject?.id },
                    transaction
                });

                if (workload) {
                    // Count ACTIVE enrollments for this specific workload
                    const activeStudentCount = await Enrollment.count({
                        where: { tcsId: workload?.id },
                        transaction
                    });


                    if (activeStudentCount === 0) {
                        await workload.destroy({ transaction });
                    }
                }
            }

            await transaction.commit();
        }
        catch (error) {
            await transaction.rollback();

            if (error instanceof ErrorBase) {
                throw error;
            }

            const stackTrace = error instanceof Error ? error.stack : String(error);

            LOG.error(`[DataImportService.processImport] Unexpected Error: ${stackTrace}`);

            throw new InternalServerError('Unexpected Error: Failed to process import data');

        }
    }

}
