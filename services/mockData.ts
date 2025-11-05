import { Student, Teacher, Role, Batch, Schedule, Announcement, DashboardStats, IncomeExpenseData, AttendanceData, ClassLevel, Shift, Course, Subject, AttendanceRecord, Payment, TeacherSalary, Exam, Mark, Staff, StaffSalary } from '../types';

// MOCK USERS (Teachers, Staff, Students)
export const MOCK_TEACHERS: Teacher[] = [
  { id: 'TCH-001', role: Role.Teacher, name: 'Dr. Evelyn Reed', email: 'e.reed@example.com', whatsappNumber: '01712345671', address: '123 Physics Lane, Dhaka', photoUrl: 'https://picsum.photos/id/1027/200/200', createdAt: '2022-08-15T09:00:00Z', qualification: 'PhD in Physics', salaryPerClass: 1200, status: 'Active' },
  { id: 'TCH-002', role: Role.Teacher, name: 'Mr. Alan Turing', email: 'a.turing@example.com', whatsappNumber: '01712345672', address: '456 Math Street, Dhaka', photoUrl: 'https://picsum.photos/id/1005/200/200', createdAt: '2021-06-20T09:00:00Z', qualification: 'M.Sc. in Mathematics', salaryPerClass: 1100, status: 'Active' },
  { id: 'TCH-003', role: Role.Teacher, name: 'Ms. Jane Austen', email: 'j.austen@example.com', whatsappNumber: '01712345673', address: '789 Literature Ave, Dhaka', photoUrl: 'https://picsum.photos/id/1011/200/200', createdAt: '2023-01-10T09:00:00Z', qualification: 'MA in English Literature', salaryPerClass: 950, status: 'Active' },
  { id: 'TCH-004', role: Role.Teacher, name: 'Mr. David Copperfield', email: 'd.copper@example.com', whatsappNumber: '01712345674', address: '101 IT Park, Dhaka', photoUrl: 'https://picsum.photos/id/1012/200/200', createdAt: '2023-09-01T09:00:00Z', qualification: 'B.Sc. in Computer Science', salaryPerClass: 1000, status: 'Inactive' },
];

export const MOCK_STAFF: Staff[] = [
    { id: 'STF-001', role: Role.Staff, name: 'Mr. Rahim Admin', email: 'rahim@example.com', phone: '01812345678', address: 'Admin Office, Dhaka', photoUrl: 'https://picsum.photos/id/1015/200/200', createdAt: '2020-01-15T09:00:00Z', designation: 'Office Manager', monthlySalary: 25000, status: 'Active' },
    { id: 'STF-002', role: Role.Staff, name: 'Ms. Karima Begum', email: 'karima@example.com', phone: '01812345679', address: 'Reception, Dhaka', photoUrl: 'https://picsum.photos/id/1025/200/200', createdAt: '2022-03-01T09:00:00Z', designation: 'Receptionist', monthlySalary: 18000, status: 'Active' },
];


// MOCK BATCHES
export const MOCK_BATCHES: Batch[] = [
  { id: 'b1', name: 'Section A', classLevel: ClassLevel.Class10, shift: Shift.Afternoon, studentIds: [] },
  { id: 'b2', name: 'Section B', classLevel: ClassLevel.Class9, shift: Shift.Evening, studentIds: [] },
  { id: 'b3', name: 'Science Group', classLevel: ClassLevel.Inter1st, shift: Shift.Afternoon, studentIds: [] },
  { id: 'b4', name: 'Commerce Group', classLevel: ClassLevel.Inter2nd, shift: Shift.Evening, studentIds: [] },
];

// MOCK COURSES (Subject + Teacher + Batch)
export const MOCK_COURSES: Course[] = [
  // Batch 1 (Class 10)
  { id: 'c1', batchId: 'b1', subject: Subject.Mathematics, teacherId: 'TCH-002' },
  { id: 'c2', batchId: 'b1', subject: Subject.Physics, teacherId: 'TCH-001' },
  // Batch 2 (Class 9)
  { id: 'c3', batchId: 'b2', subject: Subject.English, teacherId: 'TCH-003' },
  { id: 'c4', batchId: 'b2', subject: Subject.ComputerScience, teacherId: 'TCH-004' },
  { id: 'c5', batchId: 'b2', subject: Subject.Mathematics, teacherId: 'TCH-002' },
  // Batch 3 (Inter 1st)
  { id: 'c6', batchId: 'b3', subject: Subject.Physics, teacherId: 'TCH-001' },
  { id: 'c7', batchId: 'b3', subject: Subject.Chemistry, teacherId: 'TCH-001' },
  // Batch 4 (Inter 2nd)
  { id: 'c8', batchId: 'b4', subject: Subject.Accounting, teacherId: 'TCH-004' },
  { id: 'c9', batchId: 'b4', subject: Subject.English, teacherId: 'TCH-003' },
];


// MOCK STUDENTS
export const MOCK_STUDENTS: Student[] = Array.from({ length: 30 }, (_, i) => {
    let batchId = 'b1';
    if (i >= 8 && i < 17) batchId = 'b2';
    else if (i >= 17 && i < 25) batchId = 'b3';
    else if (i >= 25) batchId = 'b4';

    return {
        id: `STD-${String(i + 1).padStart(3, '0')}`,
        role: Role.Student,
        name: `Student ${i + 1}`,
        phone: `555-02${String(i + 1).padStart(2, '0')}`,
        email: `student${i + 1}@example.com`,
        photoUrl: `https://picsum.photos/id/${20 + i}/200/200`,
        createdAt: new Date(2023, Math.floor(i/3), (i%28)+1).toISOString(),
        guardianName: `Guardian ${i + 1}`,
        guardianPhone: `555-03${String(i + 1).padStart(2, '0')}`,
        dob: '2008-05-15',
        admissionDate: new Date(2023, Math.floor(i/3), (i%28)+1).toISOString(),
        batchIds: [batchId],
        status: i % 10 === 0 ? 'Inactive' : 'Active',
        monthlyFee: 1500 + (i % 5) * 100,
    };
});

// Populate studentIds in MOCK_BATCHES
MOCK_BATCHES.forEach(batch => {
    batch.studentIds = MOCK_STUDENTS.filter(s => s.batchIds.includes(batch.id)).map(s => s.id);
});

// MOCK EXAMS
export const MOCK_EXAMS: Exam[] = [
    { id: 'ex1', name: 'Mid-term Exam', date: '2024-05-15', totalMarks: 100 },
    { id: 'ex2', name: 'Final Exam', date: '2024-07-20', totalMarks: 100 },
];

// MOCK MARKS
export const MOCK_MARKS: Mark[] = MOCK_STUDENTS.flatMap(student => {
    const studentCourses = MOCK_COURSES.filter(c => student.batchIds.includes(c.batchId));
    return MOCK_EXAMS.flatMap(exam => 
        studentCourses.map(course => ({
            id: `m-${student.id}-${exam.id}-${course.subject}`,
            examId: exam.id,
            studentId: student.id,
            subject: course.subject,
            marksObtained: Math.floor(60 + Math.random() * 41), // Marks between 60 and 100
        }))
    );
});


// MOCK SCHEDULES
export const MOCK_SCHEDULES: Schedule[] = [
  // Schedules for Batch 1 (Class 10)
  { id: 'sch1', courseId: 'c1', dayOfWeek: 'Monday', startTime: '15:30', endTime: '17:00', location: 'Room 101' }, // Math
  { id: 'sch2', courseId: 'c2', dayOfWeek: 'Wednesday', startTime: '15:30', endTime: '17:00', location: 'Room 101' }, // Physics
  
  // Schedules for Batch 2 (Class 9)
  { id: 'sch3', courseId: 'c3', dayOfWeek: 'Tuesday', startTime: '18:30', endTime: '20:00', location: 'Room 102' }, // English
  { id: 'sch4', courseId: 'c4', dayOfWeek: 'Thursday', startTime: '18:30', endTime: '20:00', location: 'Room 102' }, // CS
  { id: 'sch9', courseId: 'c5', dayOfWeek: 'Friday', startTime: '18:30', endTime: '20:00', location: 'Room 102' }, // Math

  // Schedules for Batch 3 (Inter 1st)
  { id: 'sch5', courseId: 'c6', dayOfWeek: 'Sunday', startTime: '16:00', endTime: '17:30', location: 'Online' }, // Physics
  { id: 'sch6', courseId: 'c7', dayOfWeek: 'Tuesday', startTime: '16:00', endTime: '17:30', location: 'Online' }, // Chemistry

  // Schedules for Batch 4 (Inter 2nd)
  { id: 'sch7', courseId: 'c8', dayOfWeek: 'Monday', startTime: '19:00', endTime: '20:30', location: 'Room 201' }, // Accounting
  { id: 'sch8', courseId: 'c9', dayOfWeek: 'Friday', startTime: '19:00', endTime: '20:30', location: 'Room 201' }, // English
];

// MOCK ANNOUNCEMENTS
export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  { id: 'a1', title: 'Mid-term Exams Schedule', body: 'The mid-term exams will be held from July 15th to July 20th. Please check the notice board for the detailed schedule.', target: 'All', createdBy: 'Admin', createdAt: '2024-06-28T10:00:00Z' },
  { id: 'a2', title: 'Extra Class for Inter 1st Year Physics', body: 'There will be an extra class this Saturday at 10 AM to cover advanced topics for the upcoming competition.', target: 'b3', createdBy: 'Dr. Evelyn Reed', createdAt: '2024-06-25T14:30:00Z' },
  { id: 'a3', title: 'Holiday on account of National Day', body: 'The coaching center will remain closed on July 4th. Classes will resume as usual from July 5th.', target: 'All', createdBy: 'Admin', createdAt: '2024-06-20T11:00:00Z' },
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', studentId: 'STD-001', amount: 1500, method: 'bKash', transactionId: 'TRX12345ABC', date: '2024-06-15', status: 'Paid', createdAt: '2024-06-15T10:00:00Z' },
  { id: 'p2', studentId: 'STD-002', amount: 1200, method: 'Manual', date: '2024-06-10', status: 'Paid', createdAt: '2024-06-10T11:30:00Z' },
  { id: 'p3', studentId: 'STD-003', amount: 1500, method: 'Nagad', transactionId: 'NGD67890DEF', date: '2024-05-20', status: 'Paid', createdAt: '2024-05-20T09:45:00Z' },
  { id: 'p4', studentId: 'STD-004', amount: 1300, method: 'Manual', date: '2024-07-05', status: 'Due', createdAt: '2024-07-01T08:00:00Z' },
  { id: 'p5', studentId: 'STD-005', amount: 1300, method: 'Manual', date: '2024-06-05', status: 'Overdue', createdAt: '2024-06-01T08:00:00Z' },
];

const CURRENT_MONTH = new Date().toISOString().slice(0, 7);
const LAST_MONTH_DATE = new Date();
LAST_MONTH_DATE.setMonth(LAST_MONTH_DATE.getMonth() - 1);
const LAST_MONTH = LAST_MONTH_DATE.toISOString().slice(0, 7);

export const MOCK_TEACHER_SALARIES: TeacherSalary[] = [
    { 
      id: 'ts1', teacherId: 'TCH-001', month: CURRENT_MONTH, 
      perClassRate: 1200, totalClasses: 12, baseSalary: 14400,
      others: [{ id: 'adj1', reason: 'Performance Bonus', amount: 1000, type: 'addition' }],
      othersTotal: 1000, finalSalary: 15400,
      paidAmount: 15400, dueAmount: 0, status: 'Paid', 
      paymentHistory: [{ date: `${CURRENT_MONTH}-10`, amount: 15400, method: 'Bank Transfer' }], 
      updatedAt: new Date().toISOString() 
    },
    { 
      id: 'ts2', teacherId: 'TCH-002', month: CURRENT_MONTH, 
      perClassRate: 1100, totalClasses: 15, baseSalary: 16500,
      others: [], othersTotal: 0, finalSalary: 16500,
      paidAmount: 10000, dueAmount: 6500, status: 'Partially Paid', 
      paymentHistory: [{ date: `${CURRENT_MONTH}-05`, amount: 10000, method: 'bKash' }], 
      updatedAt: new Date().toISOString() 
    },
    { 
      id: 'ts3', teacherId: 'TCH-003', month: CURRENT_MONTH, 
      perClassRate: 950, totalClasses: 13, baseSalary: 12350,
      others: [{ id: 'adj2', reason: 'Late Fine', amount: 500, type: 'deduction' }],
      othersTotal: -500, finalSalary: 11850,
      paidAmount: 0, dueAmount: 11850, status: 'Due', 
      paymentHistory: [], 
      updatedAt: new Date().toISOString() 
    },
];

export const MOCK_STAFF_SALARIES: StaffSalary[] = [
    { id: 'ss1', staffId: 'STF-001', month: CURRENT_MONTH, totalSalary: 25000, paidAmount: 25000, dueAmount: 0, status: 'Paid', paymentHistory: [{ date: `${CURRENT_MONTH}-01`, amount: 25000, method: 'Bank Transfer' }], updatedAt: new Date().toISOString() },
    { id: 'ss2', staffId: 'STF-002', month: CURRENT_MONTH, totalSalary: 18000, paidAmount: 10000, dueAmount: 8000, status: 'Partially Paid', paymentHistory: [{ date: `${CURRENT_MONTH}-05`, amount: 10000, method: 'Cash' }], updatedAt: new Date().toISOString() },
    { id: 'ss3', staffId: 'STF-001', month: LAST_MONTH, totalSalary: 25000, paidAmount: 25000, dueAmount: 0, status: 'Paid', paymentHistory: [{ date: `${LAST_MONTH}-01`, amount: 25000, method: 'Bank Transfer' }], updatedAt: new Date().toISOString() },
];


// MOCK DASHBOARD DATA
export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalStudents: 30,
    totalTeachers: 4,
    totalStaff: 2,
    activeBatches: 4,
    monthlyIncome: 12500,
    monthlyExpenses: MOCK_TEACHER_SALARIES.filter(s=>s.month === CURRENT_MONTH).reduce((acc, s) => acc + s.paidAmount, 0) + MOCK_STAFF_SALARIES.filter(s=>s.month === CURRENT_MONTH).reduce((acc, s) => acc + s.paidAmount, 0),
    attendancePercentage: 92
};

export const MOCK_INCOME_EXPENSE_DATA: IncomeExpenseData[] = [
    { month: 'Jan', income: 11000, expenses: 7500 },
    { month: 'Feb', income: 12200, expenses: 7800 },
    { month: 'Mar', income: 13000, expenses: 8000 },
    { month: 'Apr', income: 12500, expenses: 8100 },
    { month: 'May', income: 14000, expenses: 8500 },
    { month: 'Jun', income: 15500, expenses: 8200 },
];

export const MOCK_ATTENDANCE_DATA: AttendanceData[] = Array.from({length: 30}, (_, i) => ({
    date: `Day ${i+1}`,
    percentage: 85 + Math.random() * 15
}));

// MOCK ATTENDANCE RECORDS
const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const dayBefore = new Date();
dayBefore.setDate(dayBefore.getDate() - 2);

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att1',
    batchId: 'b1',
    date: yesterday.toISOString().split('T')[0],
    markedBy: 'AdminUser',
    presentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b1')).slice(0, 6).map(s => s.id),
    absentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b1')).slice(6, 8).map(s => s.id),
    createdAt: yesterday.toISOString(),
  },
  {
    id: 'att2',
    batchId: 'b1',
    date: dayBefore.toISOString().split('T')[0],
    markedBy: 'AdminUser',
    presentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b1')).slice(1, 8).map(s => s.id),
    absentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b1')).slice(0, 1).map(s => s.id),
    createdAt: dayBefore.toISOString(),
  },
   {
    id: 'att3',
    batchId: 'b2',
    date: yesterday.toISOString().split('T')[0],
    markedBy: 'AdminUser',
    presentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b2')).slice(0, 7).map(s => s.id),
    absentStudents: MOCK_STUDENTS.filter(s => s.batchIds.includes('b2')).slice(7).map(s => s.id),
    createdAt: yesterday.toISOString(),
  }
];