import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '/components/DataTable.tsx';
import { getStudents, getBatches, deleteStudentById, addStudent, updateStudent } from '/services/api.ts';
import { Student, Batch } from '/types.ts';
import { UserPlus } from 'lucide-react';
import Modal from '/components/Modal.tsx';

const Students: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('all');
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    
    // State for the new/edit student form
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentEmail, setNewStudentEmail] = useState('');
    const [newStudentPhone, setNewStudentPhone] = useState('');
    const [newStudentGuardian, setNewStudentGuardian] = useState('');
    const [newStudentGuardianPhone, setNewStudentGuardianPhone] = useState('');
    const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
    const [monthlyFee, setMonthlyFee] = useState('1500');
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsRes, batchesRes] = await Promise.all([getStudents(), getBatches()]);
                setStudents(studentsRes);
                setBatches(batchesRes.sort((a, b) => a.name.localeCompare(b.name)));
            } catch (error) {
                console.error("Failed to fetch students data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const filteredStudents = useMemo(() => {
        if (activeTab === 'all') {
            return students;
        }
        return students.filter(student => student.batchIds.includes(activeTab));
    }, [activeTab, students]);

    const getBatchNames = (batchIds: string[]) => {
      return batchIds.map(id => batches.find(b => b.id === id)?.name).filter(Boolean).join(', ') || 'N/A';
    };

    const handleBatchSelection = (batchId: string) => {
        setSelectedBatches(prev => 
            prev.includes(batchId) 
            ? prev.filter(id => id !== batchId) 
            : [...prev, batchId]
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfilePhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const resetForm = () => {
        setNewStudentName('');
        setNewStudentEmail('');
        setNewStudentPhone('');
        setNewStudentGuardian('');
        setNewStudentGuardianPhone('');
        setSelectedBatches([]);
        setMonthlyFee('1500');
        setEditingStudent(null);
        setProfilePhoto(null);
        setPhotoPreview(null);
    }
    
    const handleOpenModal = (student: Student | null = null) => {
        if (student) {
            setEditingStudent(student);
            setNewStudentName(student.name);
            setNewStudentEmail(student.email);
            setNewStudentPhone(student.phone);
            setNewStudentGuardian(student.guardianName);
            setNewStudentGuardianPhone(student.guardianPhone);
            setSelectedBatches(student.batchIds);
            setMonthlyFee(String(student.monthlyFee));
            setPhotoPreview(student.photoUrl);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingStudent) {
                const studentToUpdate: Student = {
                    ...editingStudent,
                    name: newStudentName,
                    email: newStudentEmail,
                    phone: newStudentPhone,
                    guardianName: newStudentGuardian,
                    guardianPhone: newStudentGuardianPhone,
                    batchIds: selectedBatches,
                    monthlyFee: Number(monthlyFee),
                    photoUrl: photoPreview || editingStudent.photoUrl,
                };
                const updated = await updateStudent(studentToUpdate);
                setStudents(prev => prev.map(s => (s.id === updated.id ? updated : s)));
            } else {
                const newStudentData = {
                    name: newStudentName,
                    email: newStudentEmail,
                    phone: newStudentPhone,
                    guardianName: newStudentGuardian,
                    guardianPhone: newStudentGuardianPhone,
                    batchIds: selectedBatches,
                    monthlyFee: Number(monthlyFee),
                    photoUrl: photoPreview || undefined,
                };
                const added = await addStudent(newStudentData);
                setStudents(prev => [added, ...prev]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save student:", error);
            alert("Failed to save student details. Please try again.");
        }
    };
    
    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone and will remove them from all batches.')) {
            try {
                await deleteStudentById(studentId);
                setStudents(prevStudents => prevStudents.filter(student => student.id !== studentId));
            } catch (error) {
                console.error("Failed to delete student:", error);
                alert("Failed to delete the student. Please try again.");
            }
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: (student: Student) => (
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src={student.photoUrl} alt={student.name} />
                <div className="ml-4">
                  <Link to={`/students/${student.id}`} className="font-medium text-text-primary hover:text-primary hover:underline">{student.name}</Link>
                  <div className="text-sm text-text-secondary">{student.id}</div>
                </div>
              </div>
            ),
        },
        { header: 'Phone', accessor: (student: Student) => student.phone },
        { header: 'Batches', accessor: (student: Student) => <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">{getBatchNames(student.batchIds)}</span> },
        { header: 'Guardian', accessor: (student: Student) => `${student.guardianName} (${student.guardianPhone})` },
        { header: 'Admission Date', accessor: (student: Student) => new Date(student.admissionDate).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (student: Student) => (
                <div className="space-x-2">
                    <button onClick={() => handleOpenModal(student)} className="text-primary hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="text-center py-10">Loading Students...</div>;
    }
    
    const tabClasses = (tabId: string) => 
        `px-4 py-2 font-medium rounded-md text-sm transition-colors duration-200 ${
            activeTab === tabId 
            ? 'bg-primary text-white shadow' 
            : 'text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <>
            <div className="mb-6 bg-card-bg p-2 rounded-lg shadow-sm flex items-center space-x-2 flex-wrap gap-y-2">
                 <button
                    onClick={() => setActiveTab('all')}
                    className={tabClasses('all')}
                >
                    All Students
                </button>
                {batches.map(batch => (
                    <button
                        key={batch.id}
                        onClick={() => setActiveTab(batch.id)}
                        className={tabClasses(batch.id)}
                    >
                        {batch.name} ({batch.classLevel})
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={filteredStudents}
                title={activeTab === 'all' ? 'All Students' : `Students in ${batches.find(b => b.id === activeTab)?.name || 'Batch'}`}
                getKey={(student) => student.id}
                actionButton={
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                        <UserPlus size={18} className="mr-2" />
                        Add Student
                    </button>
                }
            />
            <Modal title={editingStudent ? 'Edit Student' : 'Add New Student'} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Full Name" value={newStudentName} onChange={e => setNewStudentName(e.target.value)} className="w-full p-2 border rounded md:col-span-2" required />
                        <input type="email" placeholder="Email Address" value={newStudentEmail} onChange={e => setNewStudentEmail(e.target.value)} className="w-full p-2 border rounded md:col-span-1" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="tel" placeholder="Phone Number" value={newStudentPhone} onChange={e => setNewStudentPhone(e.target.value)} className="w-full p-2 border rounded" required />
                         <input type="number" placeholder="Monthly Fee" value={monthlyFee} onChange={e => setMonthlyFee(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Guardian's Name" value={newStudentGuardian} onChange={e => setNewStudentGuardian(e.target.value)} className="w-full p-2 border rounded" required />
                        <input type="tel" placeholder="Guardian's Phone" value={newStudentGuardianPhone} onChange={e => setNewStudentGuardianPhone(e.target.value)} className="w-full p-2 border rounded" required />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Profile Photo</label>
                        <div className="mt-1 flex items-center space-x-4">
                            <span className="inline-block h-16 w-16 rounded-full overflow-hidden bg-gray-100">
                                {photoPreview ? (
                                    <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <svg className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                )}
                            </span>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload-student" className="hidden"/>
                            <label htmlFor="photo-upload-student" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Change
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign to Batches</label>
                        <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                        {batches.map(batch => (
                            <label key={batch.id} className="flex items-center space-x-2 p-1 cursor-pointer">
                                <input type="checkbox" checked={selectedBatches.includes(batch.id)} onChange={() => handleBatchSelection(batch.id)} className="rounded text-primary focus:ring-primary" />
                                <span>{batch.name} ({batch.classLevel})</span>
                            </label>
                        ))}
                        </div>
                    </div>
                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">{editingStudent ? 'Save Changes' : 'Add Student'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Students;