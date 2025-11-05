import React, { useState, useEffect } from 'react';
import { getBatches, getAttendanceRecordsByBatch, getStudents } from '/services/api.ts';
import { Batch, Student, AttendanceRecord } from '/types.ts';
import Modal from '/components/Modal.tsx';

const AttendanceRecords: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [batchesRes, studentsRes] = await Promise.all([getBatches(), getStudents()]);
                setBatches(batchesRes);
                setStudents(studentsRes);
                if (batchesRes.length > 0) {
                    setSelectedBatchId(batchesRes[0].id);
                }
            } catch (error) {
                console.error("Failed to fetch initial data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedBatchId) {
            fetchRecords();
        }
    }, [selectedBatchId]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const recordsRes = await getAttendanceRecordsByBatch(selectedBatchId);
            setRecords(recordsRes.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (error) {
            console.error("Failed to fetch records:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const openDetailsModal = (record: AttendanceRecord) => {
        setSelectedRecord(record);
        setIsModalOpen(true);
    };

    const getStudentName = (studentId: string) => students.find(s => s.id === studentId)?.name || 'Unknown';

    return (
        <div className="space-y-6">
            <div className="bg-card-bg p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-text-primary mb-4">View Attendance Records</h2>
                <div>
                    <label htmlFor="batch-select" className="block text-sm font-medium text-text-secondary">Select Batch</label>
                    <select
                        id="batch-select"
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        className="mt-1 block w-full md:w-1/2 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                        {batches.map(batch => (
                            <option key={batch.id} value={batch.id}>{batch.classLevel} - {batch.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-card-bg rounded-lg shadow-md overflow-hidden">
                <div className="p-4 border-b">
                    <h3 className="text-lg font-semibold text-text-primary">
                        History for: {batches.find(b => b.id === selectedBatchId)?.name || ''}
                    </h3>
                </div>
                {loading ? (
                    <p className="p-4 text-center">Loading records...</p>
                ) : records.length > 0 ? (
                     <ul className="divide-y divide-gray-200">
                        {records.map(record => {
                             const totalStudents = record.presentStudents.length + record.absentStudents.length;
                             const percentage = totalStudents > 0 ? ((record.presentStudents.length / totalStudents) * 100).toFixed(0) : 0;
                            return (
                                <li key={record.id} className="p-4 flex flex-wrap justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-primary">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                                        <p className="text-sm text-text-secondary">Marked by: {record.markedBy}</p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-2 sm:mt-0">
                                        <div className="text-center">
                                            <p className="font-bold text-lg text-green-600">{record.presentStudents.length}/{totalStudents}</p>
                                            <p className="text-xs text-text-secondary">Present ({percentage}%)</p>
                                        </div>
                                        <button onClick={() => openDetailsModal(record)} className="px-4 py-2 text-sm text-white bg-primary rounded-md hover:bg-indigo-700">View Details</button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <p className="p-4 text-center text-text-secondary">No attendance records found for this batch.</p>
                )}
            </div>

            {selectedRecord && (
                <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Attendance for ${new Date(selectedRecord.date).toLocaleDateString('en-US', {timeZone: 'UTC'})}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold text-green-600 border-b pb-2 mb-2">Present ({selectedRecord.presentStudents.length})</h4>
                            <ul className="space-y-1 text-sm">
                                {selectedRecord.presentStudents.map(id => <li key={id}>{getStudentName(id)}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-semibold text-red-600 border-b pb-2 mb-2">Absent ({selectedRecord.absentStudents.length})</h4>
                            <ul className="space-y-1 text-sm">
                                {selectedRecord.absentStudents.map(id => <li key={id}>{getStudentName(id)}</li>)}
                            </ul>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default AttendanceRecords;