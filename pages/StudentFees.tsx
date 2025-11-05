import React, { useState, useEffect } from 'react';
import DataTable from '/components/DataTable.tsx';
import { getPayments, getStudents, addPayment, updatePayment, deletePayment } from '/services/api.ts';
import { Payment, Student } from '/types.ts';
import { DollarSign } from 'lucide-react';
import Modal from '/components/Modal.tsx';

const StudentFees: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

    // Form state
    const [studentId, setStudentId] = useState('');
    const [amount, setAmount] = useState('');
    const [method, setMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Manual'>('Manual');
    const [transactionId, setTransactionId] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<'Paid' | 'Due' | 'Overdue'>('Paid');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [paymentsRes, studentsRes] = await Promise.all([getPayments(), getStudents()]);
                setPayments(paymentsRes);
                setStudents(studentsRes);
                if (studentsRes.length > 0) {
                    setStudentId(studentsRes[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch payments data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const resetForm = () => {
        setStudentId(students.length > 0 ? students[0].id : '');
        setAmount('');
        setMethod('Manual');
        setTransactionId('');
        setDate(new Date().toISOString().split('T')[0]);
        setStatus('Paid');
        setEditingPayment(null);
    };

    const handleOpenModal = (payment: Payment | null = null) => {
        if (payment) {
            setEditingPayment(payment);
            setStudentId(payment.studentId);
            setAmount(String(payment.amount));
            setMethod(payment.method);
            setTransactionId(payment.transactionId || '');
            setDate(payment.date);
            setStatus(payment.status);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const paymentData = {
            studentId,
            amount: Number(amount),
            method,
            transactionId,
            date,
            status,
        };

        try {
            if (editingPayment) {
                const updated = await updatePayment({ ...editingPayment, ...paymentData });
                setPayments(prev => prev.map(p => p.id === updated.id ? updated : p));
            } else {
                const added = await addPayment(paymentData);
                setPayments(prev => [added, ...prev]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save payment', error);
            alert('Failed to save payment. Please try again.');
        }
    };

    const handleDelete = async (paymentId: string) => {
        if (window.confirm('Are you sure you want to delete this payment record?')) {
            try {
                await deletePayment(paymentId);
                setPayments(prev => prev.filter(p => p.id !== paymentId));
            } catch (error) {
                console.error('Failed to delete payment', error);
                alert('Failed to delete payment. Please try again.');
            }
        }
    };


    const getStudentName = (studentId: string) => {
        return students.find(s => s.id === studentId)?.name || 'Unknown Student';
    };

    const statusBadge = (status: 'Paid' | 'Due' | 'Overdue') => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (status) {
            case 'Paid': return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
            case 'Due': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Due</span>;
            case 'Overdue': return <span className={`${baseClasses} bg-red-100 text-red-800`}>Overdue</span>;
        }
    };

    const columns = [
        { header: 'Transaction ID', accessor: (p: Payment) => p.transactionId || 'N/A' },
        { header: 'Student', accessor: (p: Payment) => getStudentName(p.studentId) },
        { header: 'Amount', accessor: (p: Payment) => `৳${p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
        { header: 'Method', accessor: (p: Payment) => p.method },
        { header: 'Date', accessor: (p: Payment) => new Date(p.date).toLocaleDateString() },
        { header: 'Status', accessor: (p: Payment) => statusBadge(p.status) },
        {
            header: 'Actions',
            accessor: (payment: Payment) => (
                <div className="space-x-2">
                    <button onClick={() => handleOpenModal(payment)} className="text-primary hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="text-center py-10">Loading Payments...</div>;
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={payments}
                title="Student Payment History"
                getKey={(payment) => payment.id}
                actionButton={
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-secondary text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition">
                        <DollarSign size={18} className="mr-2" />
                        Record Payment
                    </button>
                }
            />
             <Modal title={editingPayment ? 'Edit Payment' : 'Record New Payment'} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select value={studentId} onChange={e => setStudentId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                             {students.map(student => (
                                <option key={student.id} value={student.id}>{student.name}</option>
                            ))}
                        </select>
                    </div>
                     <input type="number" placeholder="Amount" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border rounded" required />
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                        <select value={method} onChange={e => setMethod(e.target.value as any)} className="w-full p-2 border rounded bg-white" required>
                            <option value="bKash">bKash</option>
                            <option value="Nagad">Nagad</option>
                            <option value="Rocket">Rocket</option>
                            <option value="Manual">Manual</option>
                        </select>
                    </div>
                     <input type="text" placeholder="Transaction ID (Optional)" value={transactionId} onChange={e => setTransactionId(e.target.value)} className="w-full p-2 border rounded" />
                     <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded" required />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 border rounded bg-white" required>
                            <option value="Paid">Paid</option>
                            <option value="Due">Due</option>
                            <option value="Overdue">Overdue</option>
                        </select>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">{editingPayment ? 'Save Changes' : 'Record Payment'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default StudentFees;