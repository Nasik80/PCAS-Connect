import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Building2,
    BookOpen,
    Users,
    GraduationCap,
    Calendar,
    ClipboardCheck,
    FileText,
    Settings,
    LogOut,
    ShieldAlert
} from 'lucide-react';

const Sidebar = () => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { name: 'Departments', icon: Building2, path: '/departments' },
        { name: 'Syllabus & Subjects', icon: BookOpen, path: '/syllabus' },
        { name: 'Teachers', icon: Users, path: '/teachers' },
        { name: 'Students', icon: GraduationCap, path: '/students' },
        { name: 'Timetable', icon: Calendar, path: '/timetable' },
        { name: 'Attendance', icon: ClipboardCheck, path: '/attendance' },
        { name: 'Reports', icon: FileText, path: '/reports' },
        { name: 'Settings', icon: Settings, path: '/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('adminUser');
        window.location.href = '/';
    };

    return (
        <div className="h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 overflow-y-auto z-20 transition-all duration-300">
            <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                <div className="bg-indigo-600 p-2 rounded-lg">
                    <ShieldAlert size={24} className="text-white" />
                </div>
                <div>
                    <h1 className="font-bold text-lg tracking-wide">PCAS Admin</h1>
                    <p className="text-xs text-slate-400">MGU Connect</p>
                </div>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            }`
                        }
                    >
                        <item.icon size={20} className="stroke-[2px]" />
                        <span className="font-medium text-sm">{item.name}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors"
                >
                    <LogOut size={20} />
                    <span className="font-medium text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
