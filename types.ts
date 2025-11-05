export enum Role {
  Admin = 'ADMIN',
  Teacher = 'TEACHER',
  Student = 'STUDENT',
  Guardian = 'GUARDIAN',
  Staff = 'STAFF',
}

export enum ClassLevel {
  Class6 = 'Class 6',
  Class7 = 'Class 7',
  Class8 = 'Class 8',
  Class9 = 'Class 9',
  Class10 = 'Class 10',
  Inter1st = 'Intermediate 1st Year',
  Inter2nd = 'Intermediate 2nd Year',
}

export enum Shift {
  Afternoon = '3:00 PM - 6:00 PM',
  Evening = '6:00 PM - 9:00 PM',
}

export enum Subject {
  Mathematics = 'Mathematics',
  Physics = 'Physics',
  Chemistry = 'Chemistry',
  English = 'English',
  ComputerScience = 'Computer Science',
  Accounting = 'Accounting',
}

export interface User {
  id: string;
  role: Role;
  name: string;
  email: string;
  photoUrl: string;
  createdAt: string;
  status: 'Active' | 'Inactive';
}

export interface Teacher extends User {
  role: Role.Teacher;
  whatsappNumber: string;
  address: string;
  qualification: string;
  salaryPerClass: number;
}

export interface Student extends User {
  role: Role.Student;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  dob: string;
  admissionDate: string;
  batchIds: string[];
  monthlyFee: number;
}

export interface Staff extends User {
    role: Role.Staff;
    phone: string;
    address: string;
    designation: string;
    monthlySalary: number;
}

export interface Batch {
  id: string;
  name: string; // e.g., Section A
  classLevel: ClassLevel;
  shift: Shift;
  studentIds: string[];
}

export interface Course {
  id: string;
  batchId: string;
  subject: Subject;
  teacherId: string;
}

export interface Schedule {
  id: string;
  courseId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // "HH:MM"
  endTime: string; // "HH:MM"
  location: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  target: 'All' | 'Teachers' | 'Students' | string; // string for batchId
  createdBy: string;
  createdAt: string;
  attachmentUrl?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  method: 'bKash' | 'Nagad' | 'Rocket' | 'Manual';
  transactionId?: string;
  date: string; // YYYY-MM-DD
  status: 'Paid' | 'Due' | 'Overdue';
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  activeBatches: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  attendancePercentage: number;
}

export interface IncomeExpenseData {
  month: string;
  income: number;
  expenses: number;
}

export interface AttendanceData {
  date: string;
  percentage: number;
}

export interface AttendanceRecord {
  id: string;
  batchId: string;
  date: string; // YYYY-MM-DD
  markedBy: string; // admin_id or teacher_id
  presentStudents: string[];
  absentStudents: string[];
  createdAt: string;
}

export interface SalaryPaymentHistory {
  date: string;
  amount: number;
  method: 'Cash' | 'bKash' | 'Nagad' | 'Bank Transfer';
}

export interface SalaryAdjustment {
  id: string;
  reason: string;
  amount: number;
  type: 'addition' | 'deduction';
}

export interface TeacherSalary {
  id: string;
  teacherId: string;
  month: string; // "YYYY-MM" format
  
  perClassRate: number;
  totalClasses: number;
  baseSalary: number;
  others: SalaryAdjustment[];
  othersTotal: number;
  finalSalary: number;

  paidAmount: number;
  dueAmount: number;
  status: 'Paid' | 'Partially Paid' | 'Due';
  paymentHistory: SalaryPaymentHistory[];
  updatedAt: string;
}

export interface StaffSalary {
    id: string;
    staffId: string;
    month: string; // "YYYY-MM" format
    totalSalary: number;
    paidAmount: number;
    dueAmount: number;
    status: 'Paid' | 'Partially Paid' | 'Due';
    paymentHistory: SalaryPaymentHistory[];
    updatedAt: string;
}


export interface Exam {
  id: string;
  name: string;
  date: string;
  totalMarks: number;
}

export interface Mark {
  id: string;
  examId: string;
  studentId: string;
  subject: Subject;
  marksObtained: number;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  type: 'Income' | 'Expense';
  amount: number;
  method: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  transactions: FinancialTransaction[];
  teacherSalaryDetails: TeacherSalary[];
  staffSalaryDetails: StaffSalary[];
}