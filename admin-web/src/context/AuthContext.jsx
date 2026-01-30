import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for existing session
        const storedUser = localStorage.getItem('pcasUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('pcasUser', JSON.stringify(userData));
        // Also keep the old adminUser for backward compatibility if needed, 
        // but pcasUser will be our main source of truth now.
        if (userData.role === 'admin') {
            localStorage.setItem('adminUser', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('pcasUser');
        localStorage.removeItem('adminUser');
        // Clear other role-specific storage if any
        localStorage.removeItem('student');
        localStorage.removeItem('teacher');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
