import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, User, Search, X } from 'lucide-react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '/constants.tsx';
import { searchProfiles } from '/services/api.ts';
import { Teacher, Student, Staff } from '/types.ts';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentNavItem = NAV_ITEMS.find(item => {
    if (item.href === '/students' && location.pathname.startsWith('/students/')) return true;
    if (item.href === '/teachers' && location.pathname.startsWith('/teachers/')) return true;
    if (item.href === '/staff' && location.pathname.startsWith('/staff/')) return true;
    return item.href === location.pathname;
  });
  
  const getPageTitle = () => {
    if (location.pathname.startsWith('/students/')) return 'Student Profile';
    if (location.pathname.startsWith('/teachers/')) return 'Teacher Profile';
    if (location.pathname.startsWith('/staff/')) return 'Staff Profile';
    return currentNavItem ? currentNavItem.label : "Dashboard";
  };

  const pageTitle = getPageTitle();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ teachers: Teacher[], students: Student[], staff: Staff[] }>({ teachers: [], students: [], staff: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);
  
  useEffect(() => {
    if (searchQuery.length > 1) {
      setIsSearching(true);
      setShowResults(true);
      const debounce = setTimeout(async () => {
        const results = await searchProfiles(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults({ teachers: [], students: [], staff: [] });
      setShowResults(false);
    }
  }, [searchQuery]);

  const handleResultClick = () => {
      setSearchQuery('');
      setShowResults(false);
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const upperQuery = searchQuery.toUpperCase();
      if (upperQuery.startsWith('TCH-')) {
          navigate(`/teachers/${upperQuery}`);
      } else if (upperQuery.startsWith('STD-')) {
          navigate(`/students/${upperQuery}`);
      } else if (upperQuery.startsWith('STF-')) {
          navigate(`/staff/${upperQuery}`);
      }
      handleResultClick();
  }

  return (
    <header className="relative z-10 bg-card-bg shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          <button onClick={() => setSidebarOpen(true)} className="text-text-secondary lg:hidden">
            <Menu size={24} />
          </button>
          <h1 className="text-2xl font-semibold text-text-primary ml-4 lg:ml-0">{pageTitle}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div ref={searchRef} className="relative w-64 hidden md:block">
            <form onSubmit={handleSearchSubmit}>
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search by name or ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => searchQuery.length > 1 && setShowResults(true)}
                    className="w-full pl-10 pr-4 py-2 text-sm border rounded-full bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
            </form>
            {showResults && (
                 <div className="absolute mt-2 w-full max-w-md bg-white rounded-lg shadow-xl border overflow-hidden animate-fade-in-fast">
                    {isSearching ? (
                        <div className="p-4 text-center text-sm text-gray-500">Searching...</div>
                    ) : (searchResults.teachers.length === 0 && searchResults.students.length === 0 && searchResults.staff.length === 0) ? (
                        <div className="p-4 text-center text-sm text-gray-500">No results found.</div>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            {searchResults.teachers.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-xs text-gray-500 uppercase p-3 bg-gray-50 border-b">Teachers</h4>
                                    <ul>
                                        {searchResults.teachers.map(t => (
                                            <li key={t.id}><Link to={`/teachers/${t.id}`} onClick={handleResultClick} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">{t.name}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {searchResults.students.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-xs text-gray-500 uppercase p-3 bg-gray-50 border-t border-b">Students</h4>
                                    <ul>
                                        {searchResults.students.map(s => (
                                            <li key={s.id}><Link to={`/students/${s.id}`} onClick={handleResultClick} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">{s.name}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                             {searchResults.staff.length > 0 && (
                                <div>
                                    <h4 className="font-semibold text-xs text-gray-500 uppercase p-3 bg-gray-50 border-t border-b">Staff</h4>
                                    <ul>
                                        {searchResults.staff.map(s => (
                                            <li key={s.id}><Link to={`/staff/${s.id}`} onClick={handleResultClick} className="block px-4 py-2 hover:bg-gray-100 text-sm text-gray-700">{s.name}</Link></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
            )}
             <style>{`
                @keyframes fade-in-fast {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-fast { animation: fade-in-fast 0.15s ease-out forwards; }
            `}</style>
          </div>
          <button className="relative text-text-secondary hover:text-primary">
            <Bell size={22} />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </button>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <User size={24} className="text-gray-500"/>
            </div>
            <div className="ml-3 hidden sm:block">
                <p className="text-sm font-medium text-text-primary">Admin User</p>
                <p className="text-xs text-text-secondary">admin@coaching.com</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;