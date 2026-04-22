// 1. 定义从数据库查询出来的原始每一行数据的结构
export interface WorkloadQueryResult {
  numberOfClasses: string | number; // 聚合函数通常返回 string
  Teacher: {
    name: string;
  };
  Subject: {
    subjectCode: string;
    subjectName: string;
  };
}

// 2. 定义 Subject 的简洁格式
export interface SubjectInfo {
  subjectCode: string;
  subjectName: string;
  numberOfClasses: number;
}

// 3. 定义最终生成的报表结构 (Key 是老师名字，Value 是学科数组)
export type TeacherReport = Record<string, any[]>;
