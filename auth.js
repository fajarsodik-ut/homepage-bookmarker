// Authentication Module
class AuthSystem {
    constructor() {
        this.USERS_KEY = 'homepage-bookmarker-users';
        this.CURRENT_USER_KEY = 'homepage-bookmarker-current-user';
        this.initializeDefaultAdmin();
    }

    // Initialize default admin user
    initializeDefaultAdmin() {
        const users = this.getUsers();
        if (users.length === 0) {
            // Create default admin user
            this.createUser('admin', 'admin123', true);
        }
    }

    // Get all users from localStorage
    getUsers() {
        const usersData = localStorage.getItem(this.USERS_KEY);
        return usersData ? JSON.parse(usersData) : [];
    }

    // Save users to localStorage
    saveUsers(users) {
        localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    }

    // Create new user
    createUser(username, password, isAdmin = false) {
        const users = this.getUsers();
        
        // Check if username already exists
        if (users.find(user => user.username === username)) {
            return { success: false, message: 'Username already exists!' };
        }

        const newUser = {
            id: this.generateUserId(),
            username: username,
            password: password, // In real app, this should be hashed
            isAdmin: isAdmin,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveUsers(users);
        
        return { success: true, message: 'User created successfully!' };
    }

    // Generate unique user ID
    generateUserId() {
        return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Login user
    login(username, password) {
        const users = this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store current user (without password)
            const currentUser = {
                id: user.id,
                username: user.username,
                isAdmin: user.isAdmin
            };
            localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(currentUser));
            return { success: true, user: currentUser };
        }
        
        return { success: false, message: 'Invalid username or password!' };
    }

    // Logout user
    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    // Get current logged in user
    getCurrentUser() {
        const userData = localStorage.getItem(this.CURRENT_USER_KEY);
        return userData ? JSON.parse(userData) : null;
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Check if current user is admin
    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.isAdmin;
    }

    // Delete user (admin only)
    deleteUser(userId) {
        const currentUser = this.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            return { success: false, message: 'Admin access required!' };
        }

        const users = this.getUsers();
        const filteredUsers = users.filter(user => user.id !== userId);
        
        if (filteredUsers.length === users.length) {
            return { success: false, message: 'User not found!' };
        }

        this.saveUsers(filteredUsers);
        return { success: true, message: 'User deleted successfully!' };
    }
}
