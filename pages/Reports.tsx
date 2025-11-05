
import React from 'react';
import { FileDown } from 'lucide-react';

const reports = [
    {
        title: 'Attendance Report',
        description: 'Download a detailed attendance report for a specific batch and date range.',
        formats: ['CSV', 'Excel', 'PDF']
    },
    {
        title: 'Fees & Dues Report',
        description: 'Generate a report of all fee payments, including outstanding dues and payment history.',
        formats: ['CSV', 'Excel', 'PDF']
    },
    {
        title: 'Student Performance Report',
        description: 'Export student performance data, including exam marks and grades.',
        formats: ['CSV', 'PDF']
    },
    {
        title: 'Teacher Payroll Summary',
        description: 'Generate a summary of teacher salaries and payments for a selected month.',
        formats: ['Excel', 'PDF']
    }
];

const Reports: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold text-text-primary mb-6">Reports & Exports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {reports.map((report, index) => (
                    <div key={index} className="bg-card-bg p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-text-primary">{report.title}</h3>
                        <p className="text-sm text-text-secondary mt-2 mb-4">{report.description}</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-text-primary">Download as:</span>
                            {report.formats.map(format => (
                                <button
                                    key={format}
                                    className="flex items-center text-sm bg-gray-100 hover:bg-gray-200 text-text-secondary px-3 py-1 rounded-full transition"
                                >
                                    <FileDown size={14} className="mr-1" />
                                    {format}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reports;
