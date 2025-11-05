
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '../constants';
import { X, School } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const NavLinkClasses = "flex items-center px-4 py-3 text-sidebar-text hover:bg-gray-700 hover:text-white rounded-md transition-colors duration-200";
  const ActiveNavLinkClasses = "bg-sidebar-active text-white";

  return (
    <>
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-30 transition-opacity duration-300 ease-linear lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setSidebarOpen(false)}>
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar-bg flex-col transform lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center text-white">
            <School className="h-8 w-8 text-primary" />
            <span className="ml-3 text-xl font-bold">Coaching Admin</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 flex-1 px-2 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) => `${NavLinkClasses} ${isActive ? ActiveNavLinkClasses : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span className="ml-3">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
