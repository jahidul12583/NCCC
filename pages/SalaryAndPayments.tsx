import React, { useState, lazy, Suspense } from 'react';

const TeacherSalaries = lazy(() => import('./TeacherSalaries'));
const StudentFees = lazy(() => import('./StudentFees'));
const StaffSalaries = lazy(() => import('./StaffSalaries'));
const FinancialSummary = lazy(() => import('./FinancialSummary'));

const SalaryAndPayments: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'summary' | 'teacher' | 'student' | 'staff'>('summary');

    const tabClasses = (tabName: 'summary' | 'teacher' | 'student' | 'staff') => 
        `px-4 py-2 font-medium rounded-md text-sm transition-colors duration-200 ${
            activeTab === tabName 
            ? 'bg-primary text-white' 
            : 'text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="space-y-6">
            <div className="bg-card-bg p-4 rounded-lg shadow-md flex items-center space-x-2 flex-wrap">
                 <button
                    onClick={() => setActiveTab('summary')}
                    className={tabClasses('summary')}
                >
                    Financial Summary
                </button>
                <button
                    onClick={() => setActiveTab('teacher')}
                    className={tabClasses('teacher')}
                >
                    Teacher Salaries
                </button>
                 <button
                    onClick={() => setActiveTab('staff')}
                    className={tabClasses('staff')}
                >
                    Staff Salaries
                </button>
                <button
                    onClick={() => setActiveTab('student')}
                    className={tabClasses('student')}
                >
                    Student Fees
                </button>
            </div>

            <div>
                <Suspense fallback={<div className="p-6 text-center">Loading Content...</div>}>
                    {activeTab === 'summary' && <FinancialSummary />}
                    {activeTab === 'teacher' && <TeacherSalaries />}
                    {activeTab === 'staff' && <StaffSalaries />}
                    {activeTab === 'student' && <StudentFees />}
                </Suspense>
            </div>
        </div>
    );
};

export default SalaryAndPayments;