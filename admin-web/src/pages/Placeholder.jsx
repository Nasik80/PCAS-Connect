import React from 'react';
import Layout from '../components/Layout';
import { Construction } from 'lucide-react';

const Placeholder = ({ title }) => {
    return (
        <Layout>
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="bg-amber-100 p-6 rounded-full mb-6">
                    <Construction size={48} className="text-amber-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
                <p className="text-slate-500 max-w-md">
                    This module is part of the next development phase (MGU Compliance).
                    Functionality will be available soon.
                </p>
            </div>
        </Layout>
    );
};

export default Placeholder;
