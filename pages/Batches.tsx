import React, { useState, useEffect } from 'react';
import { getBatches, getSchedules, getTeachers, getCourses } from '/services/api.ts';
import { Batch, Schedule, Teacher, ClassLevel, Shift, Course, Subject } from '/types.ts';
import { BookPlus, CalendarDays, Clock, User, Users, Briefcase, PlusCircle } from 'lucide-react';
import Modal from '/components/Modal.tsx';

const Batches: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modals State
    const [isCreateBatchModalOpen, setCreateBatchModalOpen] = useState(false);
    const [isAddSubjectModalOpen, setAddSubjectModalOpen] = useState(false);
    const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);


    // Create Batch Form State
    const [batchName, setBatchName] = useState('');
    const [classLevel, setClassLevel] = useState<ClassLevel>(Object.values(ClassLevel)[0]);
    const [shift, setShift] = useState<Shift>(Object.values(Shift)[0]);

    // Add Subject Form State
    const [subject, setSubject] = useState<Subject>(Object.values(Subject)[0]);
    const [teacherId, setTeacherId] = useState('');


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [batchesRes, schedulesRes, teachersRes, coursesRes] = await Promise.all([
                    getBatches(),
                    getSchedules(),
                    getTeachers(),
                    getCourses()
                ]);
                setBatches(batchesRes);
                setSchedules(schedulesRes);
                setTeachers(teachersRes);
                setCourses(coursesRes);
                if (teachersRes.length > 0) {
                    setTeacherId(teachersRes[0].id); // Default selection
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getTeacherName = (teacherId: string) => {
        return teachers.find(t => t.id === teacherId)?.name || 'N/A';
    };

    const resetCreateBatchForm = () => {
        setBatchName('');
        setClassLevel(Object.values(ClassLevel)[0]);
        setShift(Object.values(Shift)[0]);
    }

    const resetAddSubjectForm = () => {
        setSubject(Object.values(Subject)[0]);
        if (teachers.length > 0) {
            setTeacherId(teachers[0].id);
        }
    };
    
    const handleCreateBatch = (e: React.FormEvent) => {
        e.preventDefault();
        const newBatch: Batch = {
            id: `b${batches.length + 1 + Date.now()}`,
            name: batchName,
            classLevel,
            shift,
            studentIds: [],
        };
        setBatches(prev => [newBatch, ...prev]);
        setCreateBatchModalOpen(false);
        resetCreateBatchForm();
    };

    const handleAddSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!teacherId || !currentBatchId) {
            alert("Please select a teacher and ensure a batch is selected.");
            return;
        }
        const newCourse: Course = {
            id: `c${courses.length + 1 + Date.now()}`,
            batchId: currentBatchId,
            subject,
            teacherId,
        };
        setCourses(prev => [...prev, newCourse]);
        setAddSubjectModalOpen(false);
        resetAddSubjectForm();
    };

    const openAddSubjectModal = (batchId: string) => {
        setCurrentBatchId(batchId);
        setAddSubjectModalOpen(true);
    };

    if (loading) {
        return <div className="text-center py-10">Loading Batches & Schedules...</div>;
    }

    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Batches & Schedules</h2>
                <button onClick={() => setCreateBatchModalOpen(true)} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                    <BookPlus size={18} className="mr-2" />
                    Create New Batch
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {batches.map(batch => {
                    const batchCourses = courses.filter(c => c.batchId === batch.id);
                    const batchCourseIds = batchCourses.map(c => c.id);
                    const batchSchedules = schedules.filter(s => batchCourseIds.includes(s.courseId));

                    return (
                        <div key={batch.id} className="bg-card-bg rounded-lg shadow-md p-6 flex flex-col">
                            <h3 className="text-xl font-bold text-primary">{batch.classLevel}</h3>
                            <p className="text-md text-text-secondary mb-2">{batch.name}</p>
                            
                            <div className="space-y-3 text-sm flex-grow mb-4">
                                <div className="flex items-center text-text-primary">
                                    <Briefcase size={16} className="mr-2 text-primary" />
                                    <strong>Shift:</strong> <span className="ml-2">{batch.shift}</span>
                                </div>
                                <div className="flex items-center text-text-primary">
                                    <Users size={16} className="mr-2 text-primary" />
                                    <strong>Students:</strong> <span className="ml-2">{batch.studentIds.length}</span>
                                </div>
                            </div>
                            
                            <div className="border-t pt-4">
                                <h4 className="font-semibold text-text-primary mb-2">Subjects Taught</h4>
                                <ul className="space-y-2 text-sm">
                                    {batchCourses.map(course => (
                                        <li key={course.id} className="flex items-center justify-between">
                                            <span>{course.subject}</span>
                                            <span className="text-text-secondary flex items-center"><User size={14} className="mr-1" /> {getTeacherName(course.teacherId)}</span>
                                        </li>
                                    ))}
                                    {batchCourses.length === 0 && <li className="text-xs text-gray-500">No subjects assigned.</li>}
                                </ul>
                                <button onClick={() => openAddSubjectModal(batch.id)} className="text-sm text-primary hover:underline mt-3 flex items-center">
                                    <PlusCircle size={16} className="mr-1" /> Add Subject
                                </button>
                            </div>

                            <div className="mt-4 border-t pt-4">
                                <h4 className="font-semibold text-text-primary mb-2">Weekly Schedule</h4>
                                <ul className="space-y-2">
                                    {batchSchedules.map(schedule => {
                                        const course = courses.find(c => c.id === schedule.courseId);
                                        return (
                                            <li key={schedule.id} className="flex items-center text-sm bg-gray-50 p-2 rounded">
                                                <span className="font-bold w-28">{course?.subject}</span>
                                                <CalendarDays size={14} className="mx-2 text-gray-500" />
                                                <span className="font-medium w-24">{schedule.dayOfWeek}</span>
                                                <Clock size={14} className="mx-2 text-gray-500" />
                                                <span>{schedule.startTime} - {schedule.endTime}</span>
                                            </li>
                                        );
                                    })}
                                    {batchSchedules.length === 0 && (
                                        <li className="text-xs text-gray-500">No schedule set.</li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Batch Modal */}
            <Modal title="Create New Batch" isOpen={isCreateBatchModalOpen} onClose={() => { setCreateBatchModalOpen(false); resetCreateBatchForm(); }}>
                <form onSubmit={handleCreateBatch} className="space-y-4">
                    <input type="text" placeholder="Batch Name (e.g., Section A)" value={batchName} onChange={e => setBatchName(e.target.value)} className="w-full p-2 border rounded" required />
                    <div>
                        <label htmlFor="classLevel" className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                        <select id="classLevel" value={classLevel} onChange={e => setClassLevel(e.target.value as ClassLevel)} className="w-full p-2 border rounded bg-white" required>
                            {Object.values(ClassLevel).map(level => (<option key={level} value={level}>{level}</option>))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                        <select id="shift" value={shift} onChange={e => setShift(e.target.value as Shift)} className="w-full p-2 border rounded bg-white" required>
                             {Object.values(Shift).map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Create Batch</button>
                    </div>
                </form>
            </Modal>
            
            {/* Add Subject Modal */}
            <Modal title="Add Subject to Batch" isOpen={isAddSubjectModalOpen} onClose={() => { setAddSubjectModalOpen(false); resetAddSubjectForm(); }}>
                <form onSubmit={handleAddSubject} className="space-y-4">
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select id="subject" value={subject} onChange={e => setSubject(e.target.value as Subject)} className="w-full p-2 border rounded bg-white" required>
                            {Object.values(Subject).map(s => (<option key={s} value={s}>{s}</option>))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-gray-700 mb-1">Assign Teacher</label>
                        <select id="teacher" value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full p-2 border rounded bg-white" required>
                             <option value="" disabled>Select a teacher</option>
                            {teachers.map(teacher => (
                                <option key={teacher.id} value={teacher.id}>{teacher.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Add Subject</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Batches;