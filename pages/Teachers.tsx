import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '/components/DataTable.tsx';
import { getTeachers, getCourses, getBatches, deleteTeacherById, addTeacher, updateTeacher } from '/services/api.ts';
import { Teacher, Role, Course, Batch } from '/types.ts';
import { UserPlus } from 'lucide-react';
import Modal from '/components/Modal.tsx';

const Teachers: React.FC = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [batches, setBatches] = useState<Batch[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [address, setAddress] = useState('');
    const [qualification, setQualification] = useState('');
    const [salaryPerClass, setSalaryPerClass] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teachersRes, coursesRes, batchesRes] = await Promise.all([
                    getTeachers(),
                    getCourses(),
                    getBatches()
                ]);
                setTeachers(teachersRes);
                setCourses(coursesRes);
                setBatches(batchesRes);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const resetForm = () => {
        setName('');
        setWhatsappNumber('');
        setAddress('');
        setQualification('');
        setSalaryPerClass('');
        setProfilePhoto(null);
        setPhotoPreview(null);
        setEditingTeacher(null);
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

    const handleOpenEditModal = (teacher: Teacher) => {
        setEditingTeacher(teacher);
        setName(teacher.name);
        setWhatsappNumber(teacher.whatsappNumber);
        setAddress(teacher.address);
        setQualification(teacher.qualification);
        setSalaryPerClass(teacher.salaryPerClass.toString());
        setPhotoPreview(teacher.photoUrl);
        setProfilePhoto(null);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTeacher) {
                const teacherToUpdate: Teacher = {
                    ...editingTeacher,
                    name,
                    whatsappNumber,
                    address,
                    qualification,
                    salaryPerClass: Number(salaryPerClass),
                    photoUrl: photoPreview || editingTeacher.photoUrl,
                };
                const updated = await updateTeacher(teacherToUpdate);
                setTeachers(prev => prev.map(t => (t.id === updated.id ? updated : t)));
            } else {
                const newTeacherData = {
                    name,
                    whatsappNumber,
                    address,
                    qualification,
                    salaryPerClass: Number(salaryPerClass),
                    photoUrl: photoPreview || `https://picsum.photos/id/10${teachers.length}/200/200`,
                };
                const added = await addTeacher(newTeacherData);
                setTeachers(prev => [added, ...prev]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error("Failed to save teacher:", error);
            alert("Failed to save teacher details. Please try again.");
        }
    };
    
    const handleDeleteTeacher = async (teacherId: string) => {
        const teacherCoursesCount = courses.filter(c => c.teacherId === teacherId).length;
        let confirmMessage = 'Are you sure you want to delete this teacher?';
        
        if (teacherCoursesCount > 0) {
            confirmMessage += ` They are currently assigned to ${teacherCoursesCount} subject(s), which will become unassigned.`;
        }
        confirmMessage += ' This action cannot be undone.';
    
        if (window.confirm(confirmMessage)) {
            try {
                await deleteTeacherById(teacherId);
                setTeachers(prevTeachers => prevTeachers.filter(teacher => teacher.id !== teacherId));
                setCourses(prevCourses => 
                    prevCourses.map(course => 
                        course.teacherId === teacherId ? { ...course, teacherId: '' } : course
                    )
                );
            } catch (error) {
                console.error("Failed to delete teacher:", error);
                alert("Failed to delete the teacher. Please try again.");
            }
        }
    };

    const getTeacherAssignments = (teacherId: string) => {
        const assignments = courses
            .filter(c => c.teacherId === teacherId)
            .map(course => {
                const batch = batches.find(b => b.id === course.batchId);
                return {
                    subject: course.subject,
                    classLevel: batch?.classLevel || 'N/A'
                };
            });

        if (assignments.length === 0) return 'Not assigned';

        return assignments
            .map(a => `${a.subject} (${a.classLevel})`)
            .join(', ');
    };


    const columns = [
        {
            header: 'Name',
            accessor: (teacher: Teacher) => (
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src={teacher.photoUrl} alt={teacher.name} />
                <div className="ml-4">
                  <Link to={`/teachers/${teacher.id}`} className="font-medium text-text-primary hover:text-primary hover:underline">{teacher.name}</Link>
                  <div className="text-sm text-text-secondary">{teacher.id}</div>
                </div>
              </div>
            ),
        },
        { header: 'Address', accessor: (teacher: Teacher) => teacher.address },
        { header: 'Subjects / Classes', accessor: (teacher: Teacher) => getTeacherAssignments(teacher.id) },
        { header: 'Qualification', accessor: (teacher: Teacher) => teacher.qualification },
        { header: 'Salary (Per Class)', accessor: (teacher: Teacher) => `৳${teacher.salaryPerClass.toLocaleString()}` },
        { header: 'Joined Date', accessor: (teacher: Teacher) => new Date(teacher.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (teacher: Teacher) => (
                <div className="space-x-2">
                    <button onClick={() => handleOpenEditModal(teacher)} className="text-primary hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDeleteTeacher(teacher.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="text-center py-10">Loading Teachers...</div>;
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={teachers}
                title="All Teachers"
                getKey={(teacher) => teacher.id}
                actionButton={
                    <button onClick={() => { setEditingTeacher(null); resetForm(); setIsModalOpen(true); }} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                        <UserPlus size={18} className="mr-2" />
                        Add Teacher
                    </button>
                }
            />
            <Modal title={editingTeacher ? 'Edit Teacher' : 'Add New Teacher'} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    <input type="tel" placeholder="WhatsApp Number" value={whatsappNumber} onChange={e => setWhatsappNumber(e.target.value)} className="w-full p-2 border rounded" required />
                    <textarea placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded" required rows={2}></textarea>
                    <input type="text" placeholder="Qualification" value={qualification} onChange={e => setQualification(e.target.value)} className="w-full p-2 border rounded" required />
                    <input type="number" placeholder="Salary (Per Class)" value={salaryPerClass} onChange={e => setSalaryPerClass(e.target.value)} className="w-full p-2 border rounded" required />
                    
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
                            <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload" className="hidden"/>
                            <label htmlFor="photo-upload" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Change
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                         <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">{editingTeacher ? 'Save Changes' : 'Add Teacher'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default Teachers;