import React, { useState, useEffect, useRef } from 'react';
import { getFinancialSummaryForMonth, getTeachers, getStaff } from '/services/api.ts';
import { FinancialSummary, Teacher, Staff } from '/types.ts';
import DashboardCard from '/components/DashboardCard.tsx';
import DataTable from '/components/DataTable.tsx';
import { ArrowUpRight, ArrowDownLeft, Wallet, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


const FinancialSummary: React.FC = () => {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [staff, setStaffList] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    
    const statementRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSummary = async () => {
            setLoading(true);
            try {
                const [summaryRes, teachersRes, staffRes] = await Promise.all([
                    getFinancialSummaryForMonth(selectedMonth),
                    getTeachers(),
                    getStaff()
                ]);
                setSummary(summaryRes);
                setTeachers(teachersRes);
                setStaffList(staffRes);
            } catch (error) {
                console.error(`Failed to fetch financial summary for ${selectedMonth}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, [selectedMonth]);
    
    const handleExportPdf = () => {
        const input = statementRef.current;
        if (!input) return;

        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgWidth / pdfWidth;
            const pdfHeight = imgHeight / ratio;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`Financial-Statement-${selectedMonth}.pdf`);
        });
    };

    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'N/A';
    const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'N/A';

    const incomeColumns = [
        { header: 'Date', accessor: (t: any) => new Date(t.date).toLocaleDateString() },
        { header: 'Description', accessor: (t: any) => t.description },
        { header: 'Method', accessor: (t: any) => t.method },
        { header: 'Amount', accessor: (t: any) => <span className="text-green-600 font-medium">+৳{t.amount.toLocaleString()}</span> },
    ];

    const teacherExpenseColumns = [
        { header: 'Teacher', accessor: (s: any) => getTeacherName(s.teacherId) },
        { header: 'Final Salary', accessor: (s: any) => `৳${s.finalSalary.toLocaleString()}` },
        { header: 'Paid Amount', accessor: (s: any) => `৳${s.paidAmount.toLocaleString()}` },
        { header: 'Due Amount', accessor: (s: any) => `৳${s.dueAmount.toLocaleString()}` },
    ];
    
    const staffExpenseColumns = [
        { header: 'Staff', accessor: (s: any) => getStaffName(s.staffId) },
        { header: 'Total Salary', accessor: (s: any) => `৳${s.totalSalary.toLocaleString()}` },
        { header: 'Paid Amount', accessor: (s: any) => `৳${s.paidAmount.toLocaleString()}` },
        { header: 'Due Amount', accessor: (s: any) => `৳${s.dueAmount.toLocaleString()}` },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-card-bg p-4 rounded-lg shadow-md flex flex-wrap gap-4 items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary">Monthly Financial Statement</h2>
                <div className="flex items-center gap-2">
                    <label htmlFor="month-select" className="text-sm font-medium text-gray-700">Select Month:</label>
                    <input
                        type="month"
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                     <button onClick={handleExportPdf} className="flex items-center bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition text-sm">
                        <FileDown size={16} className="mr-2"/>Export PDF
                    </button>
                </div>
            </div>
            
            {loading ? (
                <div className="text-center py-10">Loading Financial Statement...</div>
            ) : !summary ? (
                 <div className="text-center py-10 text-red-500">Could not load statement data for this month.</div>
            ) : (
                <div ref={statementRef} className="p-4 bg-white rounded-lg">
                    <div className="mb-6 text-center">
                       <h2 className="text-2xl font-bold">Financial Statement</h2>
                       <p className="text-gray-600">For {new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <DashboardCard title="Total Income" value={`৳${summary.totalIncome.toLocaleString()}`} icon={<ArrowUpRight />} color="#10b981" />
                        <DashboardCard title="Total Expenses" value={`৳${summary.totalExpenses.toLocaleString()}`} icon={<ArrowDownLeft />} color="#ef4444" />
                        <DashboardCard title="Net Profit / Loss" value={`৳${summary.netProfit.toLocaleString()}`} icon={<Wallet />} color={summary.netProfit >= 0 ? '#3b82f6' : '#ef4444'} />
                    </div>

                    <div className="space-y-8">
                       {/* Expense Breakdown */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Expense Breakdown</h3>
                            <div className="space-y-6">
                                <DataTable
                                    columns={teacherExpenseColumns}
                                    data={summary.teacherSalaryDetails}
                                    title="Teacher Salaries"
                                    getKey={(s) => s.id}
                                />
                                <DataTable
                                    columns={staffExpenseColumns}
                                    data={summary.staffSalaryDetails}
                                    title="Staff Salaries"
                                    getKey={(s) => s.id}
                                />
                            </div>
                        </div>

                        {/* Income Breakdown */}
                        <div>
                            <h3 className="text-xl font-semibold mb-4 border-b pb-2">Income Breakdown</h3>
                             <DataTable
                                columns={incomeColumns}
                                data={summary.transactions.filter(t => t.type === 'Income')}
                                title="Student Fee Payments"
                                getKey={(t) => t.id}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinancialSummary;