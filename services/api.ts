import { MOCK_STUDENTS, MOCK_TEACHERS, MOCK_BATCHES, MOCK_SCHEDULES, MOCK_ANNOUNCEMENTS, MOCK_INCOME_EXPENSE_DATA, MOCK_ATTENDANCE_DATA, MOCK_COURSES, MOCK_ATTENDANCE, MOCK_PAYMENTS, MOCK_TEACHER_SALARIES, MOCK_EXAMS, MOCK_MARKS, MOCK_STAFF, MOCK_STAFF_SALARIES } from './mockData';
import { Teacher, Course, Student, Batch, Schedule, Announcement, Role, AttendanceRecord, Payment, TeacherSalary, SalaryPaymentHistory, SalaryAdjustment, Mark, Exam, Staff, StaffSalary, FinancialSummary, FinancialTransaction } from '../types';

// In-memory store for the session to allow for mutation (add, edit, delete)
let teachers: Teacher[] = JSON.parse(JSON.stringify(MOCK_TEACHERS));
let courses: Course[] = JSON.parse(JSON.stringify(MOCK_COURSES));
let students: Student[] = JSON.parse(JSON.stringify(MOCK_STUDENTS));
let batches: Batch[] = JSON.parse(JSON.stringify(MOCK_BATCHES));
let schedules: Schedule[] = JSON.parse(JSON.stringify(MOCK_SCHEDULES));
let announcements: Announcement[] = JSON.parse(JSON.stringify(MOCK_ANNOUNCEMENTS));
let attendanceRecords: AttendanceRecord[] = JSON.parse(JSON.stringify(MOCK_ATTENDANCE));
let payments: Payment[] = JSON.parse(JSON.stringify(MOCK_PAYMENTS));
let teacherSalaries: TeacherSalary[] = JSON.parse(JSON.stringify(MOCK_TEACHER_SALARIES));
let exams: Exam[] = JSON.parse(JSON.stringify(MOCK_EXAMS));
let marks: Mark[] = JSON.parse(JSON.stringify(MOCK_MARKS));
let staff: Staff[] = JSON.parse(JSON.stringify(MOCK_STAFF));
let staffSalaries: StaffSalary[] = JSON.parse(JSON.stringify(MOCK_STAFF_SALARIES));


const simulateDelay = <T,>(data: T, delay: number = 500): Promise<T> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(data)));
    }, delay);
  });
};

// --- READ APIs ---
export const getStudents = () => simulateDelay(students);
export const getStudentById = (id: string) => simulateDelay(students.find(s => s.id === id));
export const getTeachers = () => simulateDelay(teachers);
export const getTeacherById = (id: string) => simulateDelay(teachers.find(t => t.id === id));
export const getStaff = () => simulateDelay(staff);
export const getStaffById = (id: string) => simulateDelay(staff.find(s => s.id === id));
export const getBatches = () => simulateDelay(batches);
export const getSchedules = () => simulateDelay(schedules);
export const getAnnouncements = () => simulateDelay(announcements);
export const getCourses = () => simulateDelay(courses);
export const getPayments = () => simulateDelay(payments);
export const getPaymentsByStudentId = (studentId: string) => simulateDelay(payments.filter(p => p.studentId === studentId));
export const getMarksByStudentId = (studentId: string) => simulateDelay(marks.filter(m => m.studentId === studentId));
export const getExams = () => simulateDelay(exams);
export const getTeacherSalaryHistory = (teacherId: string) => simulateDelay(teacherSalaries.filter(s => s.teacherId === teacherId));
export const getStaffSalaryHistory = (staffId: string) => simulateDelay(staffSalaries.filter(s => s.staffId === staffId));

// --- Search API ---
export const searchProfiles = (query: string): Promise<{ teachers: Teacher[], students: Student[], staff: Staff[] }> => {
    const lowerQuery = query.toLowerCase();
    const results = {
        teachers: teachers.filter(t => t.name.toLowerCase().includes(lowerQuery) || t.id.toLowerCase() === lowerQuery),
        students: students.filter(s => s.name.toLowerCase().includes(lowerQuery) || s.id.toLowerCase() === lowerQuery),
        staff: staff.filter(s => s.name.toLowerCase().includes(lowerQuery) || s.id.toLowerCase() === lowerQuery),
    };
    return simulateDelay(results, 400);
}

// --- Dashboard specific APIs ---
export const getDashboardStats = () => {
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    
    const teacherExpenses = teacherSalaries
        .filter(s => s.month === currentMonth)
        .reduce((sum, s) => sum + s.paidAmount, 0);

    const staffExpenses = staffSalaries
        .filter(s => s.month === currentMonth)
        .reduce((sum, s) => sum + s.paidAmount, 0);

    const monthlyIncome = payments
        .filter(p => p.date.startsWith(currentMonth))
        .reduce((sum, p) => sum + p.amount, 0);

    const stats = {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalStaff: staff.length,
        activeBatches: batches.length,
        monthlyIncome: monthlyIncome,
        monthlyExpenses: teacherExpenses + staffExpenses,
        attendancePercentage: 92 // Static for now
    };
    return simulateDelay(stats, 300);
}
export const getIncomeExpenseData = () => simulateDelay(MOCK_INCOME_EXPENSE_DATA, 700);
export const getAttendanceData = () => simulateDelay(MOCK_ATTENDANCE_DATA, 800);

// --- Student CRUD ---
export const addStudent = (studentData: Omit<Student, 'id' | 'createdAt' | 'role' | 'admissionDate' | 'dob' | 'status'> & { photoUrl?: string }): Promise<Student> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newStudent: Student = {
                id: `STD-${String(students.length + 1 + Date.now()).slice(-4)}`,
                role: Role.Student,
                createdAt: new Date().toISOString(),
                admissionDate: new Date().toISOString(),
                photoUrl: studentData.photoUrl || `https://picsum.photos/id/${20 + students.length}/200/200`,
                dob: '2008-01-01', // Default DOB
                status: 'Active',
                name: studentData.name,
                email: studentData.email,
                phone: studentData.phone,
                guardianName: studentData.guardianName,
                guardianPhone: studentData.guardianPhone,
                batchIds: studentData.batchIds,
                monthlyFee: studentData.monthlyFee,
            };
            students.unshift(newStudent);
            // Add student to batches
            studentData.batchIds.forEach(batchId => {
                const batch = batches.find(b => b.id === batchId);
                if (batch && !batch.studentIds.includes(newStudent.id)) {
                    batch.studentIds.push(newStudent.id);
                }
            });
            resolve(JSON.parse(JSON.stringify(newStudent)));
        }, 300);
    });
};

export const updateStudent = (studentData: Student): Promise<Student> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const studentIndex = students.findIndex(s => s.id === studentData.id);
            if (studentIndex === -1) {
                return reject({ success: false, message: 'Student not found' });
            }
            students[studentIndex] = { ...students[studentIndex], ...studentData };
            resolve(JSON.parse(JSON.stringify(students[studentIndex])));
        }, 300);
    });
};

export const deleteStudentById = (studentId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const studentIndex = students.findIndex(s => s.id === studentId);
            if (studentIndex === -1) {
                return reject({ success: false, message: 'Student not found' });
            }
            students.splice(studentIndex, 1);
            // Also remove from batches
            batches.forEach(batch => {
                batch.studentIds = batch.studentIds.filter(id => id !== studentId);
            });
            resolve({ success: true });
        }, 300);
    });
};


// --- Payment CRUD ---
export const addPayment = (paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newPayment: Payment = {
                id: `p${payments.length + 1 + Date.now()}`,
                createdAt: new Date().toISOString(),
                ...paymentData
            };
            payments.unshift(newPayment);
            resolve(JSON.parse(JSON.stringify(newPayment)));
        }, 300);
    });
};

export const updatePayment = (paymentData: Payment): Promise<Payment> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const paymentIndex = payments.findIndex(p => p.id === paymentData.id);
            if (paymentIndex === -1) {
                return reject({ success: false, message: 'Payment not found' });
            }
            payments[paymentIndex] = { ...payments[paymentIndex], ...paymentData };
            resolve(JSON.parse(JSON.stringify(payments[paymentIndex])));
        }, 300);
    });
};

export const deletePayment = (paymentId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const paymentIndex = payments.findIndex(p => p.id === paymentId);
            if (paymentIndex === -1) {
                return reject({ success: false, message: 'Payment not found' });
            }
            payments.splice(paymentIndex, 1);
            resolve({ success: true });
        }, 300);
    });
};

// --- Teacher CRUD ---
export const addTeacher = (teacherData: { name: string, whatsappNumber: string, address: string, qualification: string, salaryPerClass: number, photoUrl: string }): Promise<Teacher> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newTeacher: Teacher = {
                id: `TCH-${String(teachers.length + 1).padStart(3, '0')}`,
                role: Role.Teacher,
                name: teacherData.name,
                email: `${teacherData.name.split(' ').join('.').toLowerCase()}@coaching.com`,
                whatsappNumber: teacherData.whatsappNumber,
                address: teacherData.address,
                qualification: teacherData.qualification,
                salaryPerClass: teacherData.salaryPerClass,
                photoUrl: teacherData.photoUrl,
                createdAt: new Date().toISOString(),
                status: 'Active',
            };
            teachers.unshift(newTeacher);
            resolve(JSON.parse(JSON.stringify(newTeacher)));
        }, 300);
    });
};

export const updateTeacher = (teacherData: Teacher): Promise<Teacher> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const teacherIndex = teachers.findIndex(t => t.id === teacherData.id);
            if (teacherIndex === -1) {
                return reject({ success: false, message: 'Teacher not found' });
            }
            teachers[teacherIndex] = { ...teachers[teacherIndex], ...teacherData };
            resolve(JSON.parse(JSON.stringify(teachers[teacherIndex])));
        }, 300);
    });
};

export const deleteTeacherById = (teacherId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const teacherIndex = teachers.findIndex(t => t.id === teacherId);
            if (teacherIndex === -1) {
                return reject({ success: false, message: 'Teacher not found' });
            }
            teachers.splice(teacherIndex, 1);
            courses = courses.map(course => course.teacherId === teacherId ? { ...course, teacherId: '' } : course);
            resolve({ success: true });
        }, 300);
    });
};

// --- Staff CRUD ---
export const addStaff = (staffData: Omit<Staff, 'id' | 'createdAt' | 'role' | 'status'> & { photoUrl?: string }): Promise<Staff> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newStaff: Staff = {
                id: `STF-${String(staff.length + 1).padStart(3, '0')}`,
                role: Role.Staff,
                createdAt: new Date().toISOString(),
                photoUrl: staffData.photoUrl || `https://picsum.photos/id/${50 + staff.length}/200/200`,
                status: 'Active',
                name: staffData.name,
                email: staffData.email,
                phone: staffData.phone,
                address: staffData.address,
                designation: staffData.designation,
                monthlySalary: staffData.monthlySalary,
            };
            staff.unshift(newStaff);
            resolve(JSON.parse(JSON.stringify(newStaff)));
        }, 300);
    });
};


export const updateStaff = (staffData: Staff): Promise<Staff> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const staffIndex = staff.findIndex(s => s.id === staffData.id);
            if (staffIndex === -1) {
                return reject({ success: false, message: 'Staff not found' });
            }
            staff[staffIndex] = { ...staff[staffIndex], ...staffData };
            resolve(JSON.parse(JSON.stringify(staff[staffIndex])));
        }, 300);
    });
};

export const deleteStaffById = (staffId: string): Promise<{ success: boolean }> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const staffIndex = staff.findIndex(s => s.id === staffId);
            if (staffIndex === -1) {
                return reject({ success: false, message: 'Staff not found' });
            }
            staff.splice(staffIndex, 1);
            resolve({ success: true });
        }, 300);
    });
};


// --- Attendance APIs ---
export const getAttendanceForBatchAndDate = (batchId: string, date: string): Promise<AttendanceRecord | null> => {
    return simulateDelay(attendanceRecords.find(r => r.batchId === batchId && r.date === date) || null, 200);
};

export const getAttendanceRecordsByBatch = (batchId: string): Promise<AttendanceRecord[]> => {
    return simulateDelay(attendanceRecords.filter(r => r.batchId === batchId));
};

export const getAttendanceForStudent = (studentId: string): Promise<AttendanceRecord[]> => {
    return simulateDelay(attendanceRecords.filter(r => r.presentStudents.includes(studentId) || r.absentStudents.includes(studentId)));
}

export const saveAttendanceRecord = (recordData: Partial<Omit<AttendanceRecord, 'createdAt'>> & { batchId: string, date: string, markedBy: string, presentStudents: string[], absentStudents: string[] }): Promise<AttendanceRecord> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (recordData.id) {
                const index = attendanceRecords.findIndex(r => r.id === recordData.id);
                if (index !== -1) {
                    attendanceRecords[index] = { ...attendanceRecords[index], ...recordData };
                    resolve(JSON.parse(JSON.stringify(attendanceRecords[index])));
                    return;
                }
            }
            const newRecord: AttendanceRecord = {
                id: `att${attendanceRecords.length + 1 + Date.now()}`,
                createdAt: new Date().toISOString(),
                ...recordData,
            };
            attendanceRecords.push(newRecord);
            resolve(JSON.parse(JSON.stringify(newRecord)));
        }, 300);
    });
};

// --- Teacher Salary APIs ---
// Helper function to count classes for a teacher in a given month
const countTeacherClassesForMonth = (teacherId: string, month: string, allSchedules: Schedule[], allCourses: Course[]): number => {
  const teacherCourseIds = allCourses.filter(c => c.teacherId === teacherId).map(c => c.id);
  if (teacherCourseIds.length === 0) return 0;

  const teacherSchedules = allSchedules.filter(s => teacherCourseIds.includes(s.courseId));
  if (teacherSchedules.length === 0) return 0;

  const [year, monthIndex] = month.split('-').map(Number);
  const startDate = new Date(year, monthIndex - 1, 1);
  const endDate = new Date(year, monthIndex, 0); // Day 0 of next month is the last day of the current month

  let classCount = 0;
  const dayMap: { [key: string]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };

  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const currentDayOfWeek = d.getDay();
    teacherSchedules.forEach(schedule => {
      if (dayMap[schedule.dayOfWeek] === currentDayOfWeek) {
        classCount++;
      }
    });
  }
  return classCount;
};

export const getTeacherClassCountForMonth = (teacherId: string, month: string): Promise<{ count: number }> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const count = countTeacherClassesForMonth(teacherId, month, schedules, courses);
            resolve({ count });
        }, 200);
    });
};

export const getTeacherSalaries = (month: string): Promise<TeacherSalary[]> => {
    return simulateDelay(teacherSalaries.filter(s => s.month === month));
};

export const addOrUpdateTeacherSalary = (
    data: { teacherId: string, month: string, perClassRate: number, totalClasses: number, others: Omit<SalaryAdjustment, 'id'>[], initialPayment?: SalaryPaymentHistory } | { id: string, payment: SalaryPaymentHistory }
): Promise<TeacherSalary> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if ('teacherId' in data) { // Adding/updating a salary record
                const { totalClasses, perClassRate } = data;
                const baseSalary = totalClasses * perClassRate;
                
                const othersWithIds = data.others.map((o, i) => ({ ...o, id: `adj-${Date.now()}-${i}` }));
                const othersTotal = othersWithIds.reduce((acc, curr) => {
                    return acc + (curr.type === 'addition' ? curr.amount : -curr.amount);
                }, 0);

                const finalSalary = baseSalary + othersTotal;

                let record = teacherSalaries.find(s => s.teacherId === data.teacherId && s.month === data.month);
                
                if (record) { // Update existing record
                    record.perClassRate = perClassRate;
                    record.totalClasses = totalClasses;
                    record.baseSalary = baseSalary;
                    record.others = othersWithIds;
                    record.othersTotal = othersTotal;
                    record.finalSalary = finalSalary;
                    record.updatedAt = new Date().toISOString();
                } else { // Create new record
                    record = {
                        id: `ts${teacherSalaries.length + 1 + Date.now()}`,
                        teacherId: data.teacherId,
                        month: data.month,
                        perClassRate,
                        totalClasses,
                        baseSalary,
                        others: othersWithIds,
                        othersTotal,
                        finalSalary,
                        paidAmount: 0,
                        dueAmount: 0, 
                        status: 'Due',
                        paymentHistory: [],
                        updatedAt: new Date().toISOString(),
                    };
                    teacherSalaries.push(record);
                }
                
                if (data.initialPayment && data.initialPayment.amount > 0) {
                    record.paymentHistory.push(data.initialPayment);
                }

                // Recalculate totals
                record.paidAmount = record.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
                record.dueAmount = record.finalSalary - record.paidAmount;
                record.status = record.dueAmount <= 0 ? 'Paid' : (record.paidAmount > 0 ? 'Partially Paid' : 'Due');

                resolve(JSON.parse(JSON.stringify(record)));

            } else { // Making a payment
                const record = teacherSalaries.find(s => s.id === data.id);
                if (!record) {
                    return reject({ message: 'Salary record not found' });
                }
                record.paymentHistory.push(data.payment);
                record.paidAmount = record.paymentHistory.reduce((sum, p) => sum + p.amount, 0);
                record.dueAmount = record.finalSalary - record.paidAmount;
                record.status = record.dueAmount <= 0 ? 'Paid' : 'Partially Paid';
                record.updatedAt = new Date().toISOString();
                resolve(JSON.parse(JSON.stringify(record)));
            }
        }, 400);
    });
};

// --- Staff Salary APIs ---
export const getStaffSalaries = (month: string): Promise<StaffSalary[]> => {
    return simulateDelay(staffSalaries.filter(s => s.month === month));
};

export const addOrUpdateStaffSalary = (
    data: { staffId: string, month: string, totalSalary: number } | { id: string, payment: SalaryPaymentHistory }
): Promise<StaffSalary> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if ('staffId' in data) { // Adding/updating a salary record
                let record = staffSalaries.find(s => s.staffId === data.staffId && s.month === data.month);
                
                if (record) { // Update existing record
                    record.totalSalary = data.totalSalary;
                    record.updatedAt = new Date().toISOString();
                } else { // Create new record
                    record = {
                        id: `ss${staffSalaries.length + 1 + Date.now()}`,
                        staffId: data.staffId,
                        month: data.month,
                        totalSalary: data.totalSalary,
                        paidAmount: 0,
                        dueAmount: 0, // will be calculated next
                        status: 'Due',
                        paymentHistory: [],
                        updatedAt: new Date().toISOString(),
                    };
                    staffSalaries.push(record);
                }
                
                record.dueAmount = record.totalSalary - record.paidAmount;
                record.status = record.dueAmount <= 0 ? 'Paid' : (record.paidAmount > 0 ? 'Partially Paid' : 'Due');

                resolve(JSON.parse(JSON.stringify(record)));

            } else { // Making a payment
                const record = staffSalaries.find(s => s.id === data.id);
                if (!record) {
                    return reject({ message: 'Salary record not found' });
                }
                record.paidAmount += data.payment.amount;
                record.dueAmount = record.totalSalary - record.paidAmount;
                record.status = record.dueAmount <= 0 ? 'Paid' : 'Partially Paid';
                record.paymentHistory.push(data.payment);
                record.updatedAt = new Date().toISOString();
                resolve(JSON.parse(JSON.stringify(record)));
            }
        }, 400);
    });
};

// --- Financial Summary API ---
export const getFinancialSummaryForMonth = (month: string): Promise<FinancialSummary> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const transactions: FinancialTransaction[] = [];

            // Income from student payments
            const monthlyPayments = payments.filter(p => p.date.startsWith(month));
            const totalIncome = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
            
            monthlyPayments.forEach(p => {
                const studentName = students.find(s => s.id === p.studentId)?.name || 'Unknown Student';
                transactions.push({
                    id: `inc-${p.id}`,
                    date: p.date,
                    description: `Fee from ${studentName}`,
                    type: 'Income',
                    amount: p.amount,
                    method: p.method,
                });
            });

            // Expenses from salaries
            const monthlyTeacherSalaries = teacherSalaries.filter(s => s.month === month);
            const monthlyStaffSalaries = staffSalaries.filter(s => s.month === month);
            
            let totalExpenses = 0;
            
            monthlyTeacherSalaries.forEach(s => {
                const teacherName = teachers.find(t => t.id === s.teacherId)?.name || 'Unknown Teacher';
                s.paymentHistory.forEach((p, i) => {
                    if(p.date.startsWith(month)){
                        totalExpenses += p.amount;
                        transactions.push({
                            id: `exp-t-${s.id}-${i}`,
                            date: p.date,
                            description: `Salary to ${teacherName}`,
                            type: 'Expense',
                            amount: p.amount,
                            method: p.method,
                        });
                    }
                });
            });
            
             monthlyStaffSalaries.forEach(s => {
                const staffName = staff.find(st => st.id === s.staffId)?.name || 'Unknown Staff';
                s.paymentHistory.forEach((p, i) => {
                    if(p.date.startsWith(month)){
                        totalExpenses += p.amount;
                        transactions.push({
                            id: `exp-s-${s.id}-${i}`,
                            date: p.date,
                            description: `Salary to ${staffName}`,
                            type: 'Expense',
                            amount: p.amount,
                            method: p.method,
                        });
                    }
                });
            });
            
            transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            const summary: FinancialSummary = {
                totalIncome,
                totalExpenses,
                netProfit: totalIncome - totalExpenses,
                transactions,
                teacherSalaryDetails: monthlyTeacherSalaries,
                staffSalaryDetails: monthlyStaffSalaries,
            };

            resolve(summary);
        }, 600);
    });
};