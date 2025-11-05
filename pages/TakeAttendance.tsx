import React, { useState, useEffect } from 'react';
import { getBatches, getStudents, getAttendanceForBatchAndDate, saveAttendanceRecord } from '/services/api.ts';
import { Batch, Student, AttendanceRecord } from '/types.ts';
import { Check, X, User, Users } from 'lucide-react';

type AttendanceStatus = 'present' | 'absent';

const TakeAttendance: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [studentsInBatch, setStudentsInBatch] = useState<Student[]>([]);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [attendance, setAttendance] = useState<{ [studentId: string]: AttendanceStatus }>({});
    const [existingRecord, setExistingRecord] = useState<AttendanceRecord | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [batchesRes, studentsRes] = await Promise.all([getBatches(), getStudents()]);
                setBatches(batchesRes);
                setStudents(studentsRes);
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
            const filteredStudents = students.filter(s => s.batchIds.includes(selectedBatchId));
            setStudentsInBatch(filteredStudents);
            fetchAttendanceRecord();
        } else {
            setStudentsInBatch([]);
        }
    }, [selectedBatchId, students]);

    useEffect(() => {
        if (selectedBatchId) {
            fetchAttendanceRecord();
        }
    }, [selectedDate, selectedBatchId]);

    const fetchAttendanceRecord = async () => {
        if (!selectedBatchId || !selectedDate) return;
        setLoading(true);
        try {
            const record = await getAttendanceForBatchAndDate(selectedBatchId, selectedDate);
            setExistingRecord(record);
            if (record) {
                const newAttendance: { [studentId: string]: AttendanceStatus } = {};
                record.presentStudents.forEach(id => newAttendance[id] = 'present');
                record.absentStudents.forEach(id => newAttendance[id] = 'absent');
                setAttendance(newAttendance);
            } else {
                setAttendance({});
            }
        } catch (error) {
            console.error("Failed to fetch attendance record:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAttendance = (studentId: string, status: AttendanceStatus) => {
        setAttendance(prev => ({ ...prev, [studentId]: status }));
    };

    const handleMarkAllPresent = () => {
        const allPresent = studentsInBatch.reduce((acc, student) => {
            acc[student.id] = 'present';
            return acc;
        }, {} as { [studentId: string]: AttendanceStatus });
        setAttendance(allPresent);
    };

    const handleClearAll = () => {
        setAttendance({});
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        const presentStudents = studentsInBatch.filter(s => attendance[s.id] === 'present').map(s => s.id);
        const absentStudents = studentsInBatch.filter(s => attendance[s.id] === 'absent').map(s => s.id);

        const recordData = {
            id: existingRecord?.id,
            batchId: selectedBatchId,
            date: selectedDate,
            markedBy: 'AdminUser', // Should be dynamic in a real app
            presentStudents,
            absentStudents,
        };

        try {
            const savedRecord = await saveAttendanceRecord(recordData);
            setExistingRecord(savedRecord);
            alert(`Attendance ${existingRecord ? 'updated' : 'submitted'} successfully!`);
        } catch (error) {
            console.error("Failed to submit attendance:", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getButtonClass = (studentId: string, status: AttendanceStatus) => {
        const base = "p-2 rounded-full transition duration-150 flex items-center justify-center";
        const selected = attendance[studentId] === status;
        if (status === 'present') {
            return selected ? "bg-green-500 text-white" : "bg-green-100 text-green-600 hover:bg-green-200";
        }
        return selected ? "bg-red-500 text-white" : "bg-red-100 text-red-600 hover:bg-red-200";
    };

    return (
        <div className="space-y-6">
            <div className="bg-card-bg p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-text-primary mb-4">Take Attendance</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="batch-select" className="block text-sm font-medium text-text-secondary">Select Batch</label>
                        <select
                            id="batch-select"
                            value={selectedBatchId}
                            onChange={(e) => setSelectedBatchId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="">-- Select a Batch --</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>{batch.classLevel} - {batch.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="date-select" className="block text-sm font-medium text-text-secondary">Select Date</label>
                        <input
                            type="date"
                            id="date-select"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        />
                    </div>
                </div>
            </div>

            {selectedBatchId && (
                <div className="bg-card-bg rounded-lg shadow-md">
                    <div className="p-4 flex flex-wrap justify-between items-center border-b border-gray-200 gap-2">
                        <h3 className="text-lg font-semibold text-text-primary">
                            Student List ({studentsInBatch.length} Students)
                        </h3>
                        <div className="flex space-x-2">
                           <button onClick={handleMarkAllPresent} className="px-3 py-2 text-xs font-medium text-center text-white bg-secondary rounded-lg hover:bg-emerald-700">Mark All Present</button>
                           <button onClick={handleClearAll} className="px-3 py-2 text-xs font-medium text-center text-gray-900 bg-gray-200 rounded-lg hover:bg-gray-300">Clear All</button>
                        </div>
                    </div>
                    {loading ? (
                        <div className="text-center p-8">Loading students...</div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {studentsInBatch.map(student => (
                                <li key={student.id} className="p-4 flex items-center justify-between">
                                    <div className="flex items-center">
                                        <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt={student.name} />
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-text-primary">{student.name}</p>
                                            <p className="text-sm text-text-secondary">{student.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleMarkAttendance(student.id, 'present')} className={getButtonClass(student.id, 'present')}>
                                            <Check size={20} />
                                        </button>
                                        <button onClick={() => handleMarkAttendance(student.id, 'absent')} className={getButtonClass(student.id, 'absent')}>
                                            <X size={20} />
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="p-4 border-t border-gray-200 text-right">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || Object.keys(attendance).length !== studentsInBatch.length}
                            className="px-6 py-2 text-white bg-primary rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition"
                        >
                            {isSubmitting ? 'Saving...' : (existingRecord ? 'Update Attendance' : 'Submit Attendance')}
                        </button>
                        {Object.keys(attendance).length !== studentsInBatch.length && <p className="text-xs text-red-500 mt-2">Please mark all students.</p>}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TakeAttendance;