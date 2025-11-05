
import React, { useState, useEffect } from 'react';
import { getAnnouncements } from '../services/api';
import { Announcement } from '../types';
import { Megaphone, PlusCircle } from 'lucide-react';

const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAnnouncements();
                setAnnouncements(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (error) {
                console.error("Failed to fetch announcements:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const targetBadge = (target: string) => {
        const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
        switch (target) {
            case 'All': return <span className={`${baseClasses} bg-blue-100 text-blue-800`}>All</span>;
            case 'Teachers': return <span className={`${baseClasses} bg-purple-100 text-purple-800`}>Teachers</span>;
            case 'Students': return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Students</span>;
            default: return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Batch Specific</span>;
        }
    };

    if (loading) {
        return <div className="text-center py-10">Loading Announcements...</div>;
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Announcements</h2>
                <button className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition">
                    <PlusCircle size={18} className="mr-2" />
                    New Announcement
                </button>
            </div>
            <div className="space-y-4">
                {announcements.map(ann => (
                    <div key={ann.id} className="bg-card-bg rounded-lg shadow-md p-5">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex items-center space-x-3">
                                    <h3 className="text-lg font-semibold text-text-primary">{ann.title}</h3>
                                    {targetBadge(ann.target)}
                                </div>
                                <p className="text-sm text-text-secondary mt-1">
                                    Posted by {ann.createdBy} on {new Date(ann.createdAt).toLocaleString()}
                                </p>
                            </div>
                            <Megaphone className="text-primary" />
                        </div>
                        <p className="mt-3 text-text-primary">{ann.body}</p>
                        {ann.attachmentUrl && (
                            <a href={ann.attachmentUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-3 inline-block text-sm">
                                View Attachment
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Announcements;
