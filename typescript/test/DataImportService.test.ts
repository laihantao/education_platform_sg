import DataImportService from '../src/services/DataImportService.js';

describe('Q1 - DataUpload - Unit Tests', () => {

  describe('processImportValidation (File Check)', () => {
    it('Should throw 400 if file is missing', async () => {
      // 这里的 any 是为了跳过 TS 检查测试边界
      await expect(DataImportService.processImportValidation(undefined as any))
        .rejects.toThrow('File is required');
    });

    it('should throw 400 if file size exceeds 10MB', async () => {
      const mockFile = {
        originalname: 'data.sample.csv',
        mimetype: 'text/csv',
        size: Number(11 * 1024 * 1024), // 11MB
        path: '../../dataset/data.sample.csv'
      } as any;

      await expect(DataImportService.processImportValidation(mockFile))
        .rejects.toThrow('File size exceeds the limit of 10MB');
    });
  });

  describe('processImportDataValidation (CSV Content Check)', () => {
    it('Should throw error if required fields are missing', async () => {
      const invalidData = [
        {
          teacherEmail: 'teacher@test.com',
          // teacherName missing
          studentEmail: 'student@test.com',
          studentName: 'Student A',
          classCode: 'C1',
          classname: 'Class 1',
          subjectCode: 'S1',
          subjectName: 'Subject 1',
          toDelete: '0'
        }
      ] as any;

      await expect(DataImportService.processImportDataValidation(invalidData))
        .rejects.toThrow(/Field "teacherName" is required/);
    });

    it('Should throw error if email format is invalid', async () => {
      const badEmailData = [
        {
          teacherEmail: 'wrong-email-format',
          teacherName: 'Teacher A',
          studentEmail: 'student@test.com',
          studentName: 'Student A',
          classCode: 'C1',
          classname: 'Class 1',
          subjectCode: 'S1',
          subjectName: 'Subject 1',
          toDelete: '0'
        }
      ] as any;

      await expect(DataImportService.processImportDataValidation(badEmailData))
        .rejects.toThrow(/"teacherEmail" is not a valid email address/);
    });

    it('should pass for valid data', async () => {
      const validData = [
        {
          teacherEmail: 'teacher@test.com',
          teacherName: 'Teacher A',
          studentEmail: 'student@test.com',
          studentName: 'Student A',
          classCode: 'C1',
          classname: 'Class 1',
          subjectCode: 'S1',
          subjectName: 'Subject 1',
          toDelete: '0'
        }
      ];

      await expect(DataImportService.processImportDataValidation(validData))
        .resolves.not.toThrow();
    });
  });

});
