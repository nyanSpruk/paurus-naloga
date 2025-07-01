export interface Student {
  id: string;
  name: string;
  lastname: string;
  studentNumber: string;
  program: string;
  year: number;
  status: string;
  enrollment: string;
  courses: string[];
}

export interface StudentApiResponse {
  data: Student[];
  totalRecords: number;
}
