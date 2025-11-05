import React, { useState, useEffect } from 'react';
import DashboardCard from '../components/DashboardCard';
import { Users, UserCheck, BookOpen, DollarSign, Briefcase } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getIncomeExpenseData, getAttendanceData } from '../services/api';
import { DashboardStats, IncomeExpenseData, AttendanceData } from '../types';
import { getDashboardInsights } from '../services/geminiService';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [incomeData, setIncomeData] = useState<IncomeExpenseData[]>([]);
    const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);
    const [loading, setLoading] = useState(true);
    const [aiQuery, setAiQuery] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, incomeRes, attendanceRes] = await Promise.all([
                    getDashboardStats(),
                    getIncomeExpenseData(),
                    getAttendanceData()
                ]);
                setStats(statsRes);
                setIncomeData(incomeRes);
                setAttendanceData(attendanceRes);
            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    
    const handleAiQuery = async () => {
      if (!aiQuery.trim()) return;
      setAiLoading(true);
      setAiResponse('');
      try {
        const response = await getDashboardInsights(aiQuery);
        setAiResponse(response);
      } catch (error) {
        setAiResponse('Sorry, I could not process your request at the moment.');
      } finally {
        setAiLoading(false);
      }
    };

    if (loading) {
        return <div className="text-center py-10">Loading Dashboard...</div>;
    }

    if (!stats) {
        return <div className="text-center py-10 text-red-500">Failed to load dashboard data.</div>;
    }

    return (
        <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <DashboardCard title="Total Students" value={stats.totalStudents} icon={<Users size={24}/>} color="#3b82f6"/>
                <DashboardCard title="Total Teachers" value={stats.totalTeachers} icon={<UserCheck size={24}/>} color="#10b981"/>
                <DashboardCard title="Total Staff" value={stats.totalStaff} icon={<Briefcase size={24}/>} color="#6366f1"/>
                <DashboardCard title="Active Batches" value={stats.activeBatches} icon={<BookOpen size={24}/>} color="#f97316"/>
                <DashboardCard title="Monthly Income" value={`৳${stats.monthlyIncome.toLocaleString()}`} icon={<DollarSign size={24}/>} color="#8b5cf6"/>
                <DashboardCard title="Monthly Expenses" value={`৳${stats.monthlyExpenses.toLocaleString()}`} icon={<DollarSign size={24}/>} color="#ef4444"/>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Income vs. Expenses (Last 6 Months)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RechartsBarChart data={incomeData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}/>
                            <Legend />
                            <Bar dataKey="income" fill="#4f46e5" name="Income" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                    </ResponsiveContainer>
                </div>
                <div className="bg-card-bg p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold text-text-primary mb-4">Attendance Trend (Last 30 Days)</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={attendanceData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <YAxis domain={[80, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}/>
                            <Legend />
                            <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} name="Attendance %"/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
             {/* AI Assistant */}
            <div className="bg-card-bg p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-text-primary mb-4">AI Assistant</h3>
                <div className="flex space-x-2">
                    <input 
                        type="text" 
                        value={aiQuery}
                        onChange={(e) => setAiQuery(e.target.value)}
                        placeholder="Ask about batch performance, finances, etc." 
                        className="flex-grow p-2 border rounded-md focus:ring-primary focus:border-primary"
                        onKeyPress={(e) => e.key === 'Enter' && handleAiQuery()}
                    />
                    <button 
                        onClick={handleAiQuery}
                        disabled={aiLoading}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-300">
                        {aiLoading ? 'Thinking...' : 'Ask'}
                    </button>
                </div>
                {aiResponse && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-md border">
                        <p className="text-text-primary whitespace-pre-wrap">{aiResponse}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;