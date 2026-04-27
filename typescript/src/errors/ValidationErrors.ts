// errors/ValidationErrors.ts
import ErrorBase from './ErrorBase.js';
import ErrorCodes from '../const/ErrorCodes.js';

export class InvalidInputError extends ErrorBase {
  constructor(message: string) {
    super(message, ErrorCodes.INVALID_INPUT, 400);
  }
}

export class InvalidCsvColumnError extends ErrorBase {
  constructor(message: string) {
    super(message, ErrorCodes.INVALID_CSV_DATA_COLUMN, 400);
  }
}

export class InvalidCsvFormatError extends ErrorBase {
  constructor(message: string) {
    super(message, ErrorCodes.INVALID_CSV_DATA_FORMAT, 400);
  }
}
