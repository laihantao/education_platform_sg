import ErrorBase from './ErrorBase.js';
import ErrorCodes from '../const/ErrorCodes.js';

export class InternalServerError extends ErrorBase {
  constructor(message: string = 'An unexpected error occurred') {
    super(message, ErrorCodes.RUNTIME_ERROR_CODE, 500);
  }
}


export class ExternalServiceError extends ErrorBase {
  constructor(message: string = 'External service is temporarily unavailable.') {
    super(message, ErrorCodes.EXTERNAL_SERVICE_ERROR, 500);
  }
}
