import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState({});

    // Load users from localStorage on mount
    useEffect(() => {
        const storedUsers = localStorage.getItem('jstackUsers');
        if (storedUsers) {
            setUsers(JSON.parse(storedUsers));
        }

        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            setCurrentUser(loggedInUser);
        }
    }, []);

    const signup = (username, email, password) => {
        if (users[username]) {
            throw new Error('Username already exists. Please choose a different one');
        }

        if (Object.values(users).some(user => user.email === email)) {
            throw new Error('An account with this email already exists');
        }

        const newUser = {
            username,
            email,
            password, // In production, this would be hashed
            createdAt: new Date().toISOString()
        };

        const updatedUsers = { ...users, [username]: newUser };
        setUsers(updatedUsers);
        localStorage.setItem('jstackUsers', JSON.stringify(updatedUsers));

        return newUser;
    };

    const login = (email, password, rememberMe = false) => {
        const user = Object.values(users).find(u => u.email === email);

        if (!user) {
            throw new Error('User not found');
        }

        if (user.password !== password) {
            throw new Error('Invalid password');
        }

        setCurrentUser(user.username);
        localStorage.setItem('currentUser', user.username);

        if (rememberMe) {
            localStorage.setItem('savedEmail', email);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('savedEmail');
            localStorage.removeItem('rememberMe');
        }

        return user;
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
    };

    const getSavedEmail = () => {
        return localStorage.getItem('savedEmail');
    };

    const isSaveEmailChecked = () => {
        return localStorage.getItem('rememberMe') === 'true';
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                users,
                signup,
                login,
                logout,
                getSavedEmail,
                isSaveEmailChecked
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
