import React, { useState, useEffect } from 'react';
import { getStaff, getStaffSalaries, addOrUpdateStaffSalary } from '../services/api';
import { Staff, StaffSalary, SalaryPaymentHistory } from '../types';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { PlusCircle } from 'lucide-react';

const StaffSalaries: React.FC = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [salaries, setSalaries] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));
    
    // Modal states
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<StaffSalary | null>(null);

    // Form states
    const [staffId, setStaffId] = useState('');
    const [totalSalary, setTotalSalary] = useState('');
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<SalaryPaymentHistory['method']>('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const staffRes = await getStaff();
                setStaff(staffRes);
                if (staffRes.length > 0) setStaffId(staffRes[0].id);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchSalaries = async () => {
            setLoading(true);
            try {
                const salariesRes = await getStaffSalaries(selectedMonth);
                setSalaries(salariesRes);
            } catch (error) {
                console.error(`Failed to fetch salaries for ${selectedMonth}:`, error);
            } finally {
                setLoading(false);
            }
        };
        fetchSalaries();
    }, [selectedMonth]);
    
    useEffect(() => {
        const selectedStaffMember = staff.find(s => s.id === staffId);
        if (selectedStaffMember) {
            setTotalSalary(String(selectedStaffMember.monthlySalary));
        }
    }, [staffId, staff]);

    const getStaffName = (id: string) => staff.find(s => s.id === id)?.name || 'Unknown';
    
    const resetRecordForm = () => {
        if (staff.length > 0) {
            setStaffId(staff[0].id);
            setTotalSalary(String(staff[0].monthlySalary));
        }
    };
    
    const resetPayForm = () => {
        setPaidAmount('');
        setPaymentMethod('Cash');
        setPaymentDate(new Date().toISOString().split('T')[0]);
        setSelectedSalary(null);
    };

    const handleOpenRecordModal = () => {
        resetRecordForm();
        setRecordModalOpen(true);
    };

    const handleOpenPayModal = (salary: StaffSalary) => {
        setSelectedSalary(salary);
        setPayModalOpen(true);
    };

    const handleAddSalaryRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedSalary = await addOrUpdateStaffSalary({
                staffId,
                month: selectedMonth,
                totalSalary: Number(totalSalary),
            });
            setSalaries(prev => {
                const existing = prev.find(s => s.id === updatedSalary.id);
                return existing ? prev.map(s => s.id === updatedSalary.id ? updatedSalary : s) : [...prev, updatedSalary];
            });
            setRecordModalOpen(false);
        } catch (error) {
            console.error("Failed to add salary record:", error);
        }
    };
    
    const handleMakePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSalary) return;
        try {
            const updatedSalary = await addOrUpdateStaffSalary({
                id: selectedSalary.id,
                payment: {
                    amount: Number(paidAmount),
                    method: paymentMethod,
                    date: paymentDate,
                }
            });
            setSalaries(prev => prev.map(s => s.id === updatedSalary.id ? updatedSalary : s));
            setPayModalOpen(false);
            resetPayForm();
        } catch (error) {
            console.error("Failed to make payment:", error);
        }
    };
    
    const statusBadge = (status: 'Paid' | 'Partially Paid' | 'Due') => {
        const base = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case 'Paid': return <span className={`${base} bg-green-100 text-green-800`}>Paid</span>;
            case 'Partially Paid': return <span className={`${base} bg-blue-100 text-blue-800`}>Partially Paid</span>;
            case 'Due': return <span className={`${base} bg-yellow-100 text-yellow-800`}>Due</span>;
        }
    };

    const columns = [
        { header: 'Staff Name', accessor: (s: StaffSalary) => getStaffName(s.staffId) },
        { header: 'Total Salary', accessor: (s: StaffSalary) => `৳${s.totalSalary.toLocaleString()}` },
        { header: 'Paid Amount', accessor: (s: StaffSalary) => `৳${s.paidAmount.toLocaleString()}` },
        { header: 'Due Amount', accessor: (s: StaffSalary) => `৳${s.dueAmount.toLocaleString()}` },
        { header: 'Status', accessor: (s: StaffSalary) => statusBadge(s.status) },
        {
            header: 'Actions',
            accessor: (salary: StaffSalary) => (
                <button onClick={() => handleOpenPayModal(salary)} className="text-primary hover:text-indigo-900 font-medium">
                    View / Pay
                </button>
            )
        }
    ];

    return (
        <>
            <div className="bg-card-bg p-4 rounded-lg shadow-md mb-6 flex items-center justify-between">
                <div>
                    <label htmlFor="month-select" className="text-sm font-medium text-gray-700 mr-2">Select Month:</label>
                    <input
                        type="month"
                        id="month-select"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="p-2 border rounded-md"
                    />
                </div>
                <button onClick={handleOpenRecordModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                    <PlusCircle size={18} className="mr-2" />
                    Create Salary Record
                </button>
            </div>
            
            {loading ? (
                 <div className="text-center py-10">Loading Salaries...</div>
            ) : (
                <DataTable
                    columns={columns}
                    data={salaries}
                    title={`Staff Salaries for ${new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                    getKey={(salary) => salary.id}
                />
            )}

            <Modal title="Create/Edit Salary Record" isOpen={isRecordModalOpen} onClose={() => setRecordModalOpen(false)}>
                <form onSubmit={handleAddSalaryRecord} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                        <select value={staffId} onChange={e => setStaffId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                             {staff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.designation})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Total Salary for {selectedMonth}</label>
                        <input type="number" value={totalSalary} onChange={e => setTotalSalary(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => setRecordModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Save Record</button>
                    </div>
                </form>
            </Modal>

            {selectedSalary && (
                 <Modal title={`Payment for ${getStaffName(selectedSalary.staffId)}`} isOpen={isPayModalOpen} onClose={() => {setPayModalOpen(false); resetPayForm();}}>
                    <div>
                        <div className="grid grid-cols-3 gap-4 text-center mb-4">
                           <div className="p-2 bg-blue-50 rounded"><p className="text-xs text-blue-700">Total Salary</p><p className="font-bold text-lg text-blue-800">৳{selectedSalary.totalSalary.toLocaleString()}</p></div>
                           <div className="p-2 bg-green-50 rounded"><p className="text-xs text-green-700">Paid Amount</p><p className="font-bold text-lg text-green-800">৳{selectedSalary.paidAmount.toLocaleString()}</p></div>
                           <div className="p-2 bg-red-50 rounded"><p className="text-xs text-red-700">Due Amount</p><p className="font-bold text-lg text-red-800">৳{selectedSalary.dueAmount.toLocaleString()}</p></div>
                        </div>

                        <h4 className="font-semibold text-gray-800 mb-2 border-t pt-4">Payment History</h4>
                        <ul className="space-y-2 text-sm max-h-32 overflow-y-auto mb-4">
                            {selectedSalary.paymentHistory.map((p, i) => (
                                <li key={i} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                                    <span>{new Date(p.date).toLocaleDateString()}</span>
                                    <span>{p.method}</span>
                                    <span className="font-semibold">৳{p.amount.toLocaleString()}</span>
                                </li>
                            ))}
                             {selectedSalary.paymentHistory.length === 0 && <li className="text-xs text-gray-500">No payments recorded yet.</li>}
                        </ul>

                        {selectedSalary.dueAmount > 0 && (
                          <form onSubmit={handleMakePayment} className="space-y-4 border-t pt-4">
                              <h4 className="font-semibold text-gray-800">Record New Payment</h4>
                              <input type="number" placeholder="Amount to Pay" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} className="w-full p-2 border rounded" required max={selectedSalary.dueAmount} />
                              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)} className="w-full p-2 border rounded bg-white" required>
                                  <option value="Cash">Cash</option>
                                  <option value="bKash">bKash</option>
                                  <option value="Nagad">Nagad</option>
                                  <option value="Bank Transfer">Bank Transfer</option>
                              </select>
                              <input type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} className="w-full p-2 border rounded" required />
                              <div className="flex justify-end pt-4 space-x-2">
                                  <button type="button" onClick={() => {setPayModalOpen(false); resetPayForm();}} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                                  <button type="submit" className="bg-secondary text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition">Record Payment</button>
                              </div>
                          </form>
                        )}
                    </div>
                </Modal>
            )}
        </>
    );
};

export default StaffSalaries;