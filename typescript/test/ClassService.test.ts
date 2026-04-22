import ClassService from '../src/services/ClassService.js';

describe('ClassService Unit Test', () => {
  describe('Q2 - StudentList - Unit Tests', () => {

    it('should throw 400 if classCode is missing', async () => {
      const params = { classCode: '', offset: 0, limit: 10 };
      await expect(ClassService.getStudentByClassValidation(params))
        .rejects.toThrow('Class code is required');
    });

    it('should throw 400 if offset is negative', async () => {
      const params = { classCode: 'P1-1', offset: -1, limit: 10 };
      await expect(ClassService.getStudentByClassValidation(params))
        .rejects.toThrow('Offset must be a non-negative integer');
    });

    it('should throw 400 if offset is NaN', async () => {
      const params = { classCode: 'P1-1', offset: 'not-a-number', limit: 10 };
      await expect(ClassService.getStudentByClassValidation(params as any))
        .rejects.toThrow('Offset must be a non-negative integer');
    });

    it('should throw 400 if limit is 0 or negative', async () => {
      const params = { classCode: 'P1-1', offset: 0, limit: 0 };
      await expect(ClassService.getStudentByClassValidation(params))
        .rejects.toThrow('Limit must be a positive integer');
    });

    it('should throw 400 if limit is missing or null', async () => {
      const params = { classCode: 'P1-1', offset: 0, limit: null };
      await expect(ClassService.getStudentByClassValidation(params as any))
        .rejects.toThrow('Limit must be a positive integer');
    });

    it('should pass if all parameters are valid', async () => {
      const params = { classCode: 'P1-1', offset: 0, limit: 10 };
      // 验证是否 resolve，不抛出任何错误
      await expect(ClassService.getStudentByClassValidation(params))
        .resolves.not.toThrow();
    });
  });

  describe('Q2 - UpdateClassName - Unit Tests', () => {

    it('should throw 400 if classCode is empty', async () => {
      await expect(ClassService.updateClassNameValidation('', 'New Class Name'))
        .rejects.toThrow('classCode is required');
    });

    it('should throw 400 if classCode is not a string', async () => {
      await expect(ClassService.updateClassNameValidation(123 as any, 'New Class Name'))
        .rejects.toThrow('classCode is required');
    });

    it('should throw 400 if className is missing', async () => {
      await expect(ClassService.updateClassNameValidation('C1', ''))
        .rejects.toThrow('className is required');
    });

    it('should throw 400 if className is just whitespace', async () => {
      await expect(ClassService.updateClassNameValidation('C1', '   '))
        .rejects.toThrow('className is required');
    });

    it('should pass if both classCode and className are valid strings', async () => {
      await expect(ClassService.updateClassNameValidation('C1', 'Mathematics'))
        .resolves.not.toThrow();
    });
  });
});
