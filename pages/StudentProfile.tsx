import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStudentById, getBatches, getPaymentsByStudentId, getAttendanceForStudent, getMarksByStudentId, getExams, updateStudent } from '../services/api';
import { Student, Batch, Payment, AttendanceRecord, Mark, Exam } from '../types';
import { User, Phone, Mail, Home, BookOpen, Calendar, DollarSign, Edit, Trash2, FileDown, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import Modal from '../components/Modal';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StudentProfile: React.FC = () => {
    const { studentId } = useParams<{ studentId: string }>();
    const [student, setStudent] = useState<Student | null>(null);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [marks, setMarks] = useState<Mark[]>([]);
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedStudent, setEditedStudent] = useState<Student | null>(null);
    
    // Photo change state
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;
            setLoading(true);
            try {
                const [studentRes, batchesRes, paymentsRes, attendanceRes, marksRes, examsRes] = await Promise.all([
                    getStudentById(studentId),
                    getBatches(),
                    getPaymentsByStudentId(studentId),
                    getAttendanceForStudent(studentId),
                    getMarksByStudentId(studentId),
                    getExams()
                ]);
                setStudent(studentRes || null);
                setEditedStudent(studentRes || null);
                setBatches(batchesRes);
                setPayments(paymentsRes);
                setAttendance(attendanceRes);
                setMarks(marksRes);
                setExams(examsRes);
            } catch (error) {
                console.error("Failed to fetch student profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [studentId]);

    const handleOpenEditModal = () => {
        setEditedStudent(student);
        setIsEditModalOpen(true);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editedStudent) return;
        setEditedStudent({ ...editedStudent, [e.target.name]: e.target.value });
    };
    
    const handleUpdateStudent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedStudent) return;
        try {
            const updated = await updateStudent(editedStudent);
            setStudent(updated);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update student:", error);
            alert("Failed to update student profile.");
        }
    };
    
    const handleExportPdf = () => {
        const input = profileRef.current;
        if (!input || !student) return;

        html2canvas(input, { scale: 2, useCORS: true }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight);
            const imgX = 10;
            const imgY = 10;
            
            pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
            pdf.save(`${student.name}-Profile.pdf`);
        });
    };
    
    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCancelPhotoChange = () => {
        setPhotoPreview(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSavePhoto = async () => {
        if (!student || !photoPreview) return;
        try {
            const updated = await updateStudent({ ...student, photoUrl: photoPreview });
            setStudent(updated);
            handleCancelPhotoChange();
        } catch (error) {
            console.error("Failed to update photo:", error);
            alert("Failed to update profile photo.");
        }
    };


    const getBatchDetails = (batchIds: string[]) => {
        return batchIds.map(id => batches.find(b => b.id === id)).filter(Boolean) as Batch[];
    };
    
    const attendanceSummary = () => {
        const total = attendance.length;
        if (total === 0) return { present: 0, absent: 0, percentage: 0 };
        const present = attendance.filter(r => r.presentStudents.includes(student?.id || '')).length;
        const absent = total - present;
        const percentage = Math.round((present / total) * 100);
        return { present, absent, percentage };
    };

    const performanceData = exams.map(exam => {
        const examMarks = marks.filter(m => m.examId === exam.id);
        const subjectsData: { [key: string]: number } = {};
        examMarks.forEach(mark => {
            subjectsData[mark.subject] = mark.marksObtained;
        });
        return {
            name: exam.name,
            ...subjectsData,
            average: examMarks.length > 0 ? examMarks.reduce((sum, m) => sum + m.marksObtained, 0) / examMarks.length : 0,
        };
    });
    
    const subjectPerformanceData = Array.from(new Set(marks.map(m => m.subject))).map(subject => ({
      subject,
      mark: marks.find(m => m.subject === subject)?.marksObtained || 0, // Simplified for radar
    }));


    if (loading) {
        return <div className="text-center py-10">Loading student profile...</div>;
    }

    if (!student) {
        return <div className="text-center py-10 text-red-500">Student not found.</div>;
    }
    
    const studentBatches = getBatchDetails(student.batchIds);
    const summary = attendanceSummary();

    return (
        <>
            <div ref={profileRef} className="space-y-8 p-1">
                {/* Profile Header */}
                <div className="bg-card-bg rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
                        <div className="flex flex-col items-center md:items-start">
                            <div className="relative w-32 h-32 group">
                                <img src={photoPreview || student.photoUrl} alt={student.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary" crossOrigin="anonymous" />
                                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" className="hidden" />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    aria-label="Change profile photo"
                                >
                                    <Edit size={24} />
                                </button>
                            </div>
                            {photoPreview && (
                                <div className="mt-3 flex space-x-2">
                                    <button onClick={handleSavePhoto} className="bg-secondary text-white px-3 py-1 text-sm rounded-md hover:bg-emerald-600 transition">Save Photo</button>
                                    <button onClick={handleCancelPhotoChange} className="bg-gray-200 px-3 py-1 text-sm rounded-md hover:bg-gray-300 transition">Cancel</button>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 md:mt-0 text-center md:text-left">
                            <h1 className="text-3xl font-bold text-text-primary">{student.name}</h1>
                            <p className="text-text-secondary">{student.id}</p>
                            <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {student.status}
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-auto flex space-x-2">
                            <button onClick={handleOpenEditModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"><Edit size={16} className="mr-2"/>Edit Profile</button>
                            <button onClick={handleExportPdf} className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"><FileDown size={16} className="mr-2"/>Export PDF</button>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Personal Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-card-bg rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Personal Information</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center"><Mail size={16} className="mr-3 text-primary"/>{student.email}</li>
                                <li className="flex items-center"><Phone size={16} className="mr-3 text-primary"/>{student.phone}</li>
                                <li className="flex items-center"><Calendar size={16} className="mr-3 text-primary"/>DOB: {new Date(student.dob).toLocaleDateString()}</li>
                                <li className="flex items-center"><Calendar size={16} className="mr-3 text-primary"/>Admission: {new Date(student.admissionDate).toLocaleDateString()}</li>
                            </ul>
                        </div>
                        <div className="bg-card-bg rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Guardian Information</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center"><User size={16} className="mr-3 text-primary"/>{student.guardianName}</li>
                                <li className="flex items-center"><Phone size={16} className="mr-3 text-primary"/>{student.guardianPhone}</li>
                            </ul>
                        </div>
                        <div className="bg-card-bg rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Batch Information</h3>
                            <ul className="space-y-3 text-sm">
                                {studentBatches.map(batch => (
                                    <li key={batch.id}><span className="font-semibold">{batch.classLevel}</span> ({batch.name}) - {batch.shift}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Attendance, Performance, Payments */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Attendance & Performance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-card-bg p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-text-primary mb-2">Attendance Summary</h3>
                                <div className="text-center my-4">
                                    <p className="text-4xl font-bold text-green-600">{summary.percentage}%</p>
                                    <p className="text-sm text-text-secondary">Overall Attendance</p>
                                </div>
                                <div className="flex justify-around text-sm">
                                    <div className="text-center"><CheckCircle size={16} className="mx-auto text-green-500 mb-1"/><strong>{summary.present}</strong> Present</div>
                                    <div className="text-center"><XCircle size={16} className="mx-auto text-red-500 mb-1"/><strong>{summary.absent}</strong> Absent</div>
                                </div>
                            </div>
                            <div className="bg-card-bg p-6 rounded-lg shadow-md">
                                <h3 className="text-lg font-semibold text-text-primary mb-4">Subject Performance</h3>
                                <ResponsiveContainer width="100%" height={200}>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={subjectPerformanceData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{fontSize: 10}} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                        <Radar name="Marks" dataKey="mark" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Payment History */}
                        <div className="bg-card-bg rounded-lg shadow-md">
                            <div className="p-4 border-b flex justify-between items-center">
                                <h3 className="text-lg font-semibold text-text-primary">Payment History</h3>
                                <button className="flex items-center bg-secondary text-white px-3 py-1.5 rounded-md hover:bg-emerald-600 text-sm transition"><DollarSign size={14} className="mr-2"/>Record Payment</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Date</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Amount</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Method</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {payments.map(p => (
                                            <tr key={p.id} className="border-b">
                                                <td className="px-4 py-2 text-sm">{new Date(p.date).toLocaleDateString()}</td>
                                                <td className="px-4 py-2 text-sm">৳{p.amount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm">{p.method}</td>
                                                <td className="px-4 py-2 text-sm">{p.status}</td>
                                            </tr>
                                        ))}
                                        {payments.length === 0 && (
                                            <tr><td colSpan={4} className="text-center p-4 text-sm text-gray-500">No payment history found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {editedStudent && (
                 <Modal title="Edit Student Profile" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <form onSubmit={handleUpdateStudent} className="space-y-4">
                        <input type="text" name="name" value={editedStudent.name} onChange={handleFormChange} placeholder="Full Name" className="w-full p-2 border rounded" required />
                        <input type="email" name="email" value={editedStudent.email} onChange={handleFormChange} placeholder="Email" className="w-full p-2 border rounded" required />
                        <input type="tel" name="phone" value={editedStudent.phone} onChange={handleFormChange} placeholder="Phone" className="w-full p-2 border rounded" required />
                        <input type="text" name="guardianName" value={editedStudent.guardianName} onChange={handleFormChange} placeholder="Guardian's Name" className="w-full p-2 border rounded" required />
                        <input type="tel" name="guardianPhone" value={editedStudent.guardianPhone} onChange={handleFormChange} placeholder="Guardian's Phone" className="w-full p-2 border rounded" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" value={editedStudent.status} onChange={handleFormChange} className="w-full p-2 border rounded bg-white">
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>
                        <div className="flex justify-end pt-4 space-x-2">
                            <button type="button" onClick={() => setIsEditModalOpen(false)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                            <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">Save Changes</button>
                        </div>
                    </form>
                </Modal>
            )}
        </>
    );
};

export default StudentProfile;