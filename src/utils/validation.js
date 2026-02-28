export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateUsername = (username) => {
    return username.length >= 3;
};

export const validateSignupForm = (username, email, password, confirmPassword, terms) => {
    const errors = [];

    if (!username || !email || !password || !confirmPassword) {
        errors.push('Please fill in all fields');
    }

    if (username && !validateUsername(username)) {
        errors.push('Username must be at least 3 characters long');
    }

    if (email && !validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    if (password && !validatePassword(password)) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password && confirmPassword && password !== confirmPassword) {
        errors.push('Passwords do not match');
    }

    if (!terms) {
        errors.push('You must agree to the Terms and Conditions');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

export const validateLoginForm = (email, password) => {
    const errors = [];

    if (!email || !password) {
        errors.push('Please fill in all fields');
    }

    if (email && !validateEmail(email)) {
        errors.push('Please enter a valid email address');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};
