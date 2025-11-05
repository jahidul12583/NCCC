import React from 'react';
import { LayoutDashboard, Users, UserCheck, BookOpen, Megaphone, FileText, CheckSquare, FileClock, Wallet, Briefcase } from 'lucide-react';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/students', label: 'Students', icon: <Users size={20} /> },
  { href: '/teachers', label: 'Teachers', icon: <UserCheck size={20} /> },
  { href: '/staff', label: 'Staff', icon: <Briefcase size={20} /> },
  { href: '/batches', label: 'Batches & Schedules', icon: <BookOpen size={20} /> },
  { href: '/finance', label: 'Salary & Payments', icon: <Wallet size={20} /> },
  { href: '/attendance/take', label: 'Take Attendance', icon: <CheckSquare size={20} /> },
  { href: '/attendance/records', label: 'Attendance Records', icon: <FileClock size={20} /> },
  { href: '/announcements', label: 'Announcements', icon: <Megaphone size={20} /> },
  { href: '/reports', label: 'Reports', icon: <FileText size={20} /> },
];