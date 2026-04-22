export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  isExternal?: boolean;
}

export interface StudentListingResponse {
  count: number;
  students: StudentDTO[];
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export interface GetStudentParams {
  classCode: string;
  offset: number;
  limit: number;
}
