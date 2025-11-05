

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DataTable from '/components/DataTable.tsx';
import { getStaff, addStaff, updateStaff, deleteStaffById } from '/services/api.ts';
import { Staff, Role } from '/types.ts';
import { UserPlus } from 'lucide-react';
import Modal from '/components/Modal.tsx';

const StaffPage: React.FC = () => {
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [designation, setDesignation] = useState('');
    const [monthlySalary, setMonthlySalary] = useState('');
    const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const staffRes = await getStaff();
                setStaff(staffRes);
            } catch (error) {
                console.error("Failed to fetch staff data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const resetForm = () => {
        setName('');
        setEmail('');
        setPhone('');
        setAddress('');
        setDesignation('');
        setMonthlySalary('');
        setEditingStaff(null);
        setProfilePhoto(null);
        setPhotoPreview(null);
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

    const handleOpenModal = (staffMember: Staff | null = null) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setName(staffMember.name);
            setEmail(staffMember.email);
            setPhone(staffMember.phone);
            setAddress(staffMember.address);
            setDesignation(staffMember.designation);
            setMonthlySalary(String(staffMember.monthlySalary));
            setPhotoPreview(staffMember.photoUrl);
        } else {
            resetForm();
        }
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (editingStaff) {
                const staffData = {
                    name,
                    email,
                    phone,
                    address,
                    designation,
                    monthlySalary: Number(monthlySalary),
                    photoUrl: photoPreview || editingStaff.photoUrl,
                };
                const updated = await updateStaff({ ...editingStaff, ...staffData });
                setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
            } else {
                const staffData = {
                    name,
                    email,
                    phone,
                    address,
                    designation,
                    monthlySalary: Number(monthlySalary),
                    photoUrl: photoPreview || undefined
                };
                const added = await addStaff(staffData);
                setStaff(prev => [added, ...prev]);
            }
            setIsModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Failed to save staff member', error);
            alert('Failed to save staff member. Please try again.');
        }
    };

    const handleDelete = async (staffId: string) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            try {
                await deleteStaffById(staffId);
                setStaff(prev => prev.filter(s => s.id !== staffId));
            } catch (error) {
                console.error('Failed to delete staff member', error);
                alert('Failed to delete staff member. Please try again.');
            }
        }
    };

    const columns = [
        {
            header: 'Name',
            accessor: (s: Staff) => (
              <div className="flex items-center">
                <img className="h-10 w-10 rounded-full object-cover" src={s.photoUrl} alt={s.name} />
                <div className="ml-4">
                  <Link to={`/staff/${s.id}`} className="font-medium text-text-primary hover:text-primary hover:underline">{s.name}</Link>
                  <div className="text-sm text-text-secondary">{s.id}</div>
                </div>
              </div>
            ),
        },
        { header: 'Designation', accessor: (s: Staff) => s.designation },
        { header: 'Phone', accessor: (s: Staff) => s.phone },
        { header: 'Monthly Salary', accessor: (s: Staff) => `৳${s.monthlySalary.toLocaleString()}` },
        { header: 'Joined Date', accessor: (s: Staff) => new Date(s.createdAt).toLocaleDateString() },
        {
            header: 'Actions',
            accessor: (s: Staff) => (
                <div className="space-x-2">
                    <button onClick={() => handleOpenModal(s)} className="text-primary hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </div>
            )
        }
    ];

    if (loading) {
        return <div className="text-center py-10">Loading Staff...</div>;
    }

    return (
        <>
            <DataTable
                columns={columns}
                data={staff}
                title="All Staff Members"
                getKey={(s) => s.id}
                actionButton={
                    <button onClick={() => handleOpenModal()} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                        <UserPlus size={18} className="mr-2" />
                        Add Staff
                    </button>
                }
            />
             <Modal title={editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'} isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border rounded" required />
                    <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" required />
                    <input type="tel" placeholder="Phone Number" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded" required />
                    <textarea placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded" required rows={2}></textarea>
                    <input type="text" placeholder="Designation" value={designation} onChange={e => setDesignation(e.target.value)} className="w-full p-2 border rounded" required />
                    <input type="number" placeholder="Monthly Salary" value={monthlySalary} onChange={e => setMonthlySalary(e.target.value)} className="w-full p-2 border rounded" required />
                    
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
                            <input type="file" accept="image/*" onChange={handlePhotoChange} id="photo-upload-staff" className="hidden"/>
                            <label htmlFor="photo-upload-staff" className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                Change
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 space-x-2">
                        <button type="button" onClick={() => { setIsModalOpen(false); resetForm(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition">Cancel</button>
                        <button type="submit" className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">{editingStaff ? 'Save Changes' : 'Add Staff Member'}</button>
                    </div>
                </form>
            </Modal>
        </>
    );
};

export default StaffPage;