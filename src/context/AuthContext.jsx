import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const storedUser = localStorage.getItem('user');

        if (storedUser && storedUser !== 'undefined') {
            try {
                setUser(JSON.parse(storedUser));
            } catch (error) {
                console.error('Error parsing stored user:', error);
                localStorage.removeItem('user');
            }
        }

        setLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const data = await authAPI.login(credentials);

            if (data.two_factor_enabled) {
                // Store user_id temporarily for 2FA verification
                // Credentials are not stored for security - user will need to re-enter if needed
                localStorage.setItem('pending_2fa_user_id', data.user_id);
                return { requires2FA: true, userId: data.user_id };
            }

            // Token is now handled via httpOnly cookie by backend
            localStorage.setItem('user', JSON.stringify(data.user));
            setUser(data.user);

            return { success: true };
        } catch (error) {
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const data = await authAPI.register(userData);
            return { success: true, message: data.message };
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            // Call backend to clear the httpOnly cookie
            await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local user data regardless of backend response
            localStorage.removeItem('user');
            setUser(null);
            window.location.href = '/login';
        }
    };

    const isManager = () => user?.role === 'Manager';
    const isEmployee = () => user?.role === 'Employee';

    // Legacy aliases for backward compatibility
    const isAdmin = isManager;
    const isStudent = isEmployee;

    const value = {
        user,
        setUser,
        loading,
        login,
        register,
        logout,
        isManager,
        isEmployee,
        // Legacy aliases
        isAdmin,
        isStudent,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
