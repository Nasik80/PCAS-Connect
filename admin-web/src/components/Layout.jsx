import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar />
            <div className="flex-1 ml-64 p-8 transition-all duration-300">
                <div className="max-w-7xl mx-auto space-y-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;
