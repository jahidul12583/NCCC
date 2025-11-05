
import React, { useState, useEffect, useMemo } from 'react';
import { getTeachers, getTeacherSalaries, addOrUpdateTeacherSalary, getTeacherClassCountForMonth } from '../services/api';
import { Teacher, TeacherSalary, SalaryAdjustment, SalaryPaymentHistory } from '../types';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import { PlusCircle, Trash2 } from 'lucide-react';

const TeacherSalaries: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [salaries, setSalaries] = useState<TeacherSalary[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM format
    
    // Modal states
    const [isRecordModalOpen, setRecordModalOpen] = useState(false);
    const [isPayModalOpen, setPayModalOpen] = useState(false);
    const [selectedSalary, setSelectedSalary] = useState<TeacherSalary | null>(null);

    // Form states for Add/Edit Record Modal
    const [teacherId, setTeacherId] = useState('');
    const [classCount, setClassCount] = useState<number | null>(null);
    const [adjustments, setAdjustments] = useState<Omit<SalaryAdjustment, 'id'>[]>([]);
    const [manualPerClassRate, setManualPerClassRate] = useState('');
    const [initialPaidAmount, setInitialPaidAmount] = useState('');
    const [initialPaymentMethod, setInitialPaymentMethod] = useState<SalaryPaymentHistory['method']>('Cash');
    const [initialPaymentDate, setInitialPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Form states for Pay Modal
    const [paidAmount, setPaidAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<SalaryPaymentHistory['method']>('Cash');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const teachersRes = await getTeachers();
                setTeachers(teachersRes);
                if (teachersRes.length > 0) {
                    setTeacherId(teachersRes[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch teachers:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchSalaries = async () => {
            setLoading(true);
            try {
                const salariesRes = await getTeacherSalaries(selectedMonth);
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
      const fetchClassCountAndRate = async () => {
        if (teacherId && selectedMonth) {
          setClassCount(null); // Show loading
          const teacher = teachers.find(t => t.id === teacherId);
          if (teacher) {
            setManualPerClassRate(teacher.salaryPerClass.toString());
          }
          const { count } = await getTeacherClassCountForMonth(teacherId, selectedMonth);
          setClassCount(count);
        }
      };
      fetchClassCountAndRate();
    }, [teacherId, selectedMonth, teachers]);

    const { baseSalary, othersTotal, finalSalary } = useMemo(() => {
        const rate = Number(manualPerClassRate) || 0;
        const base = (classCount || 0) * rate;
        const others = adjustments.reduce((acc, adj) => acc + (adj.type === 'addition' ? adj.amount : -adj.amount), 0);
        return { baseSalary: base, othersTotal: others, finalSalary: base + others };
    }, [classCount, manualPerClassRate, adjustments]);


    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Unknown Teacher';
    
    const resetRecordForm = () => {
        setTeacherId(teachers.length > 0 ? teachers[0].id : '');
        setAdjustments([]);
        setClassCount(null);
        setManualPerClassRate('');
        setInitialPaidAmount('');
        setInitialPaymentMethod('Cash');
        setInitialPaymentDate(new Date().toISOString().split('T')[0]);
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

    const handleOpenPayModal = (salary: TeacherSalary) => {
        setSelectedSalary(salary);
        setPayModalOpen(true);
    };

    const handleAddSalaryRecord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (classCount === null || !manualPerClassRate) {
            alert("Class count and rate must be set.");
            return;
        }
        try {
            const updatedSalary = await addOrUpdateTeacherSalary({
                teacherId,
                month: selectedMonth,
                perClassRate: Number(manualPerClassRate),
                totalClasses: classCount,
                others: adjustments,
                initialPayment: initialPaidAmount ? {
                    amount: Number(initialPaidAmount),
                    method: initialPaymentMethod,
                    date: initialPaymentDate,
                } : undefined,
            });
            setSalaries(prev => {
                const existing = prev.find(s => s.id === updatedSalary.id);
                if (existing) {
                    return prev.map(s => s.id === updatedSalary.id ? updatedSalary : s);
                }
                return [...prev, updatedSalary];
            });
            setRecordModalOpen(false);
            resetRecordForm();
        } catch (error) {
            console.error("Failed to add salary record:", error);
            alert("Failed to add salary record.");
        }
    };
    
    const handleMakePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSalary) return;
        try {
            const updatedSalary = await addOrUpdateTeacherSalary({
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
            alert("Failed to make payment.");
        }
    };
    
    const handleAdjustmentChange = (index: number, field: 'reason' | 'amount' | 'type', value: string | number) => {
      const newAdjustments = [...adjustments];
      const adj = newAdjustments[index];
      if (field === 'amount') {
        adj[field] = Number(value);
      } else {
        (adj[field] as any) = value;
      }
      setAdjustments(newAdjustments);
    };

    const addAdjustment = () => setAdjustments([...adjustments, { reason: '', amount: 0, type: 'addition' }]);
    const removeAdjustment = (index: number) => setAdjustments(adjustments.filter((_, i) => i !== index));

    const statusBadge = (status: 'Paid' | 'Partially Paid' | 'Due') => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case 'Paid': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
            case 'Partially Paid': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>Partially Paid</span>;
            case 'Due': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Due</span>;
        }
    };

    const columns = [
        { header: 'Teacher Name', accessor: (s: TeacherSalary) => getTeacherName(s.teacherId) },
        { header: 'Classes', accessor: (s: TeacherSalary) => s.totalClasses },
        { header: 'Base Salary', accessor: (s: TeacherSalary) => `৳${s.baseSalary.toLocaleString()}` },
        { header: 'Adjustments', accessor: (s: TeacherSalary) => <span className={s.othersTotal >= 0 ? 'text-green-600' : 'text-red-600'}>৳{s.othersTotal.toLocaleString()}</span> },
        { header: 'Final Salary', accessor: (s: TeacherSalary) => `৳${s.finalSalary.toLocaleString()}` },
        { header: 'Paid Amount', accessor: (s: TeacherSalary) => `৳${s.paidAmount.toLocaleString()}` },
        { header: 'Due Amount', accessor: (s: TeacherSalary) => `৳${s.dueAmount.toLocaleString()}` },
        { header: 'Status', accessor: (s: TeacherSalary) => statusBadge(s.status) },
        {
            header: 'Actions',
            accessor: (salary: TeacherSalary) => (
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
                    title={`Teacher Salaries for ${new Date(selectedMonth + '-02').toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                    getKey={(salary) => salary.id}
                />
            )}

            {/* Add Salary Record Modal */}
            <Modal title="Create/Edit Salary Record" isOpen={isRecordModalOpen} onClose={() => {setRecordModalOpen(false); resetRecordForm();}}>
                <form onSubmit={handleAddSalaryRecord} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                        <select value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                             {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <label htmlFor="total-classes" className="text-sm text-gray-600">Total Classes Taken:</label>
                            <input
                                id="total-classes"
                                type="number"
                                value={classCount ?? ''}
                                onChange={e => setClassCount(e.target.value === '' ? null : Number(e.target.value))}
                                className="font-semibold text-lg w-28 p-1 border rounded text-right"
                                placeholder="..."
                                required
                            />
                        </div>
                        <div className="flex justify-between items-center">
                            <label htmlFor="per-class-rate" className="text-sm text-gray-600">Per Class Rate:</label>
                            <div className="flex items-center">
                                <span className="mr-1 text-lg">৳</span>
                                <input
                                    id="per-class-rate"
                                    type="number"
                                    value={manualPerClassRate}
                                    onChange={e => setManualPerClassRate(e.target.value)}
                                    className="font-semibold text-lg w-28 p-1 border rounded text-right"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2 mt-2">
                            <span className="text-sm font-semibold text-gray-800">Base Salary:</span>
                            <span className="font-bold text-lg text-primary">৳{baseSalary.toLocaleString()}</span>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Other Adjustments (Bonus, Fine, etc.)</h4>
                        <div className="space-y-2">
                            {adjustments.map((adj, index) => (
                                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded">
                                    <input type="text" placeholder="Reason" value={adj.reason} onChange={e => handleAdjustmentChange(index, 'reason', e.target.value)} className="flex-grow p-1 border rounded" />
                                    <input type="number" placeholder="Amount" value={adj.amount} onChange={e => handleAdjustmentChange(index, 'amount', e.target.value)} className="w-24 p-1 border rounded" />
                                    <select value={adj.type} onChange={e => handleAdjustmentChange(index, 'type', e.target.value)} className="p-1 border rounded bg-white">
                                        <option value="addition">(+)</option>
                                        <option value="deduction">(-)</option>
                                    </select>
                                    <button type="button" onClick={() => removeAdjustment(index)} className="text-red-500 hover:text-red-700 p-1">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={addAdjustment} className="text-sm text-primary hover:underline mt-2 flex items-center">
                            <PlusCircle size={16} className="mr-1" /> Add Adjustment
                        </button>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-lg text-center">
                        <p className="text-sm text-blue-800">Final Salary (Base + Adjustments)</p>
                        <p className="font-extrabold text-2xl text-blue-900">৳{finalSalary.toLocaleString()}</p>
                    </div>
                    
                    <div className="border-t pt-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Initial Payment (Optional)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input 
                                type="number" 
                                placeholder="Paid Amount" 
                                value={initialPaidAmount}
                                onChange={e => setInitialPaidAmount(e.target.value)}
                                className="p-2 border rounded md:col-span-1" 
                                max={finalSalary}
                            />
                            <select 
                                value={initialPaymentMethod} 
                                onChange={e => setInitialPaymentMethod(e.target.value as any)} 
                                className="p-2 border rounded bg-white md:col-span-1"
                            >
                                <option value="Cash">Cash</option>
                                <option value="bKash">bKash</option>
                                <option value="Nagad">Nagad</option>
                                <option value="Bank Transfer">Bank Transfer</option>
                            </select>
                            <input 
                                type="date" 
                                value={initialPaymentDate}
                                onChange={e => setInitialPaymentDate(e.target.value)}
                                className="p-2 border rounded md:col-span-1" 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => {setRecordModalOpen(false); resetRecordForm();}} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition" disabled={classCount === null}>
                          {classCount === null ? 'Calculating...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Make Payment Modal */}
            {selectedSalary && (
                 <Modal title={`Payment for ${getTeacherName(selectedSalary.teacherId)}`} isOpen={isPayModalOpen} onClose={() => {setPayModalOpen(false); resetPayForm();}}>
                    <div>
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-2">
                          <h4 className="font-semibold text-gray-800 mb-2 border-b pb-2">Salary Breakdown for {new Date(selectedSalary.month + '-02').toLocaleString('default', { month: 'long' })}</h4>
                          <div className="flex justify-between items-center text-sm"><span className="text-gray-600">Base Salary:</span><span className="font-medium">৳{selectedSalary.baseSalary.toLocaleString()}</span></div>
                          {selectedSalary.others.map(adj => (
                             <div key={adj.id} className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">{adj.reason}:</span>
                                <span className={`font-medium ${adj.type === 'addition' ? 'text-green-600' : 'text-red-600'}`}>
                                    {adj.type === 'addition' ? '+' : '-'}৳{adj.amount.toLocaleString()}
                                </span>
                             </div>
                          ))}
                          <div className="flex justify-between items-center border-t pt-2 mt-2">
                              <span className="text-sm font-semibold text-gray-800">Final Salary:</span>
                              <span className="font-bold text-lg text-primary">৳{selectedSalary.finalSalary.toLocaleString()}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-center mb-4">
                           <div className="p-2 bg-green-50 rounded">
                              <p className="text-xs text-green-700">Paid Amount</p>
                              <p className="font-bold text-lg text-green-800">৳{selectedSalary.paidAmount.toLocaleString()}</p>
                           </div>
                           <div className="p-2 bg-red-50 rounded">
                               <p className="text-xs text-red-700">Due Amount</p>
                               <p className="font-bold text-lg text-red-800">৳{selectedSalary.dueAmount.toLocaleString()}</p>
                           </div>
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

export default TeacherSalaries;
