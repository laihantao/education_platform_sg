// 1. 单个学生的定义
export interface StudentDTO {
  id: number;
  name: string;
  email: string;
  isExternal?: boolean;
}

// 2. 最终返回给前端的 API 响应结构
export interface StudentListingResponse {
  count: number;
  students: StudentDTO[];
}

// 3. 验证函数的返回结构
export interface ValidationResult {
  valid: boolean;
  message?: string;
}

// 4. Service 方法的参数结构
export interface GetStudentParams {
  classCode: string;
  offset: number;
  limit: number;
}
