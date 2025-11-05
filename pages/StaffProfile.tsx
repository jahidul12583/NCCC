import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getStaffById, getStaffSalaryHistory, updateStaff } from '/services/api.ts';
import { Staff, StaffSalary } from '/types.ts';
import { User, Phone, Mail, Home, Calendar, DollarSign, Edit, FileDown, Briefcase } from 'lucide-react';
import Modal from '/components/Modal.tsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const StaffProfile: React.FC = () => {
    const { staffId } = useParams<{ staffId: string }>();
    const [staff, setStaff] = useState<Staff | null>(null);
    const [salaryHistory, setSalaryHistory] = useState<StaffSalary[]>([]);
    const [loading, setLoading] = useState(true);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editedStaff, setEditedStaff] = useState<Staff | null>(null);

    // Photo change state
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const profileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!staffId) return;
            setLoading(true);
            try {
                const [staffRes, salaryRes] = await Promise.all([
                    getStaffById(staffId),
                    getStaffSalaryHistory(staffId),
                ]);
                setStaff(staffRes || null);
                setEditedStaff(staffRes || null);
                setSalaryHistory(salaryRes);
            } catch (error) {
                console.error("Failed to fetch staff profile data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [staffId]);
    
    const handleOpenEditModal = () => {
        setEditedStaff(staff);
        setIsEditModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editedStaff) return;
        const { name, value } = e.target;
        setEditedStaff({ 
            ...editedStaff, 
            [name]: name === 'monthlySalary' ? Number(value) : value 
        });
    };
    
    const handleUpdateStaff = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editedStaff) return;
        try {
            const updated = await updateStaff(editedStaff);
            setStaff(updated);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error("Failed to update staff:", error);
            alert("Failed to update staff profile.");
        }
    };

    const handleExportPdf = () => {
        const input = profileRef.current;
        if (!input || !staff) return;

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
            pdf.save(`${staff.name}-Profile.pdf`);
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
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSavePhoto = async () => {
        if (!staff || !photoPreview) return;
        try {
            const updated = await updateStaff({ ...staff, photoUrl: photoPreview });
            setStaff(updated);
            handleCancelPhotoChange();
        } catch (error) {
            console.error("Failed to update photo:", error);
            alert("Failed to update profile photo.");
        }
    };


    if (loading) {
        return <div className="text-center py-10">Loading staff profile...</div>;
    }

    if (!staff) {
        return <div className="text-center py-10 text-red-500">Staff member not found.</div>;
    }
    
    const totalPaid = salaryHistory.reduce((sum, s) => sum + s.paidAmount, 0);
    const totalDue = salaryHistory.reduce((sum, s) => sum + s.dueAmount, 0);

    return (
        <>
            <div ref={profileRef} className="space-y-8 p-1">
                {/* Profile Header */}
                <div className="bg-card-bg rounded-lg shadow-md p-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start md:space-x-6">
                        <div className="flex flex-col items-center md:items-start">
                             <div className="relative w-32 h-32 group">
                                <img src={photoPreview || staff.photoUrl} alt={staff.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary" crossOrigin="anonymous" />
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
                            <h1 className="text-3xl font-bold text-text-primary">{staff.name}</h1>
                            <p className="text-text-secondary">{staff.id}</p>
                            <p className="text-text-secondary mt-1">{staff.designation}</p>
                             <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${staff.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {staff.status}
                            </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:ml-auto flex space-x-2">
                            <button onClick={handleOpenEditModal} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition"><Edit size={16} className="mr-2"/>Edit Profile</button>
                            <button onClick={handleExportPdf} className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"><FileDown size={16} className="mr-2"/>Export PDF</button>
                        </div>
                    </div>
                </div>
                
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-6">
                         <div className="bg-card-bg rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Contact Information</h3>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center"><Mail size={16} className="mr-3 text-primary"/>{staff.email}</li>
                                <li className="flex items-center"><Phone size={16} className="mr-3 text-primary"/>{staff.phone}</li>
                                <li className="flex items-center"><Home size={16} className="mr-3 text-primary"/>{staff.address}</li>
                                <li className="flex items-center"><Calendar size={16} className="mr-3 text-primary"/>Joined: {new Date(staff.createdAt).toLocaleDateString()}</li>
                            </ul>
                        </div>
                         <div className="bg-card-bg rounded-lg shadow-md p-6">
                            <h3 className="text-lg font-semibold text-text-primary border-b pb-2 mb-4">Salary Information</h3>
                             <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center"><span className="text-gray-600">Monthly Salary:</span><span className="font-bold">৳{staff.monthlySalary.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Total Paid:</span><span className="font-medium text-green-600">৳{totalPaid.toLocaleString()}</span></div>
                                <div className="flex justify-between items-center"><span className="text-gray-600">Total Due:</span><span className="font-medium text-red-600">৳{totalDue.toLocaleString()}</span></div>
                            </div>
                        </div>
                    </div>
                     {/* Right Column */}
                    <div className="lg:col-span-2">
                         <div className="bg-card-bg rounded-lg shadow-md">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-semibold text-text-primary">Salary History</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Month</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Total Salary</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Paid</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Due</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-text-secondary uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {salaryHistory.map(s => (
                                            <tr key={s.id} className="border-b">
                                                <td className="px-4 py-2 text-sm font-medium">{new Date(s.month + '-02').toLocaleString('default', {month: 'long', year: 'numeric'})}</td>
                                                <td className="px-4 py-2 text-sm">৳{s.totalSalary.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm text-green-600">৳{s.paidAmount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm text-red-600">৳{s.dueAmount.toLocaleString()}</td>
                                                <td className="px-4 py-2 text-sm">{s.status}</td>
                                            </tr>
                                        ))}
                                        {salaryHistory.length === 0 && (
                                            <tr><td colSpan={5} className="text-center p-4 text-sm text-gray-500">No salary history found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

             {editedStaff && (
                <Modal title="Edit Staff Profile" isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
                    <form onSubmit={handleUpdateStaff} className="space-y-4">
                        <input type="text" name="name" value={editedStaff.name} onChange={handleFormChange} placeholder="Full Name" className="w-full p-2 border rounded" required />
                        <input type="email" name="email" value={editedStaff.email} onChange={handleFormChange} placeholder="Email" className="w-full p-2 border rounded" required />
                        <input type="tel" name="phone" value={editedStaff.phone} onChange={handleFormChange} placeholder="Phone" className="w-full p-2 border rounded" required />
                        <textarea name="address" value={editedStaff.address} onChange={handleFormChange} placeholder="Address" className="w-full p-2 border rounded" required rows={2}></textarea>
                        <input type="text" name="designation" value={editedStaff.designation} onChange={handleFormChange} placeholder="Designation" className="w-full p-2 border rounded" required />
                        <input type="number" name="monthlySalary" value={editedStaff.monthlySalary} onChange={handleFormChange} placeholder="Monthly Salary" className="w-full p-2 border rounded" required />
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select name="status" value={editedStaff.status} onChange={handleFormChange} className="w-full p-2 border rounded bg-white">
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

export default StaffProfile;