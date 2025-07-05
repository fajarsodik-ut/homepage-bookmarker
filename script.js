// DOM Elements
const bookmarkForm = document.getElementById('bookmark-form');
const urlInput = document.getElementById('url-input');
const noteInput = document.getElementById('note-input');
const bookmarksList = document.getElementById('bookmarks-list');
const pinnedBookmarksList = document.getElementById('pinned-bookmarks-list');
const emptyState = document.getElementById('empty-state');
const pinnedEmptyState = document.getElementById('pinned-empty-state');

// Authentication elements
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const currentUserSpan = document.getElementById('current-user');
const logoutBtn = document.getElementById('logout-btn');
const adminPanelBtn = document.getElementById('admin-panel-btn');

// Authentication system
const auth = new AuthSystem();

// Storage key for localStorage (per user)
const STORAGE_KEY = 'simple-link-note-saver-bookmarks';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// Initialize the application
function initializeApp() {
    if (auth.isLoggedIn()) {
        showMainApp();
    } else {
        showLoginModal();
    }

    setupEventListeners();
}

// Show main app
function showMainApp() {
    const user = auth.getCurrentUser();
    if (user) {
        loginModal.classList.add('hidden');
        registerModal.classList.add('hidden');
        mainApp.classList.remove('hidden');

        // Update user info
        currentUserSpan.textContent = `👤 Welcome, ${user.username}!`;

        // Show admin panel button if user is admin
        if (user.isAdmin) {
            adminPanelBtn.classList.remove('hidden');
        }

        // Load user's bookmarks
        loadBookmarks();
    }
}

// Show login modal
function showLoginModal() {
    loginModal.classList.remove('hidden');
    registerModal.classList.add('hidden');
    mainApp.classList.add('hidden');
}

// Show register modal
function showRegisterModal() {
    registerModal.classList.remove('hidden');
    loginModal.classList.add('hidden');
    mainApp.classList.add('hidden');
}

// Event Listeners
function setupEventListeners() {
    // Bookmark form
    bookmarkForm.addEventListener('submit', handleFormSubmit);

    // Authentication forms
    loginForm.addEventListener('submit', handleLogin);
    registerForm.addEventListener('submit', handleRegister);

    // Modal switches
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRegisterModal();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });

    // Logout button
    logoutBtn.addEventListener('click', handleLogout);

    // Admin panel button
    adminPanelBtn.addEventListener('click', showAdminPanel);
}

// Show admin panel
function showAdminPanel() {
    const users = auth.getUsers();
    const currentUser = auth.getCurrentUser();

    let userList = users.map(user => {
        const role = user.isAdmin ? 'Admin' : 'User';
        const deleteBtn = user.id !== currentUser.id ?
            `<button onclick="deleteUser('${user.id}')">Delete</button>` : '';

        return `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${user.username}</strong> (${role})
                    <br><small>Created: ${new Date(user.createdAt).toLocaleDateString()}</small>
                </div>
                <div>
                    ${deleteBtn}
                </div>
            </div>
        `;
    }).join('');

    const adminPanelHTML = `
        <div id="admin-panel" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        ">
            <div style="
                background: white;
                padding: 30px;
                border-radius: 20px;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
            ">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2>👥 Admin Panel</h2>
                    <button onclick="closeAdminPanel()" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #999;
                    ">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h3>User Management</h3>
                    <p>Total users: ${users.length}</p>
                </div>
                
                <div style="border: 1px solid #ddd; border-radius: 10px; overflow: hidden;">
                    ${userList}
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button onclick="closeAdminPanel()" style="
                        padding: 10px 20px;
                        background: #667eea;
                        color: white;
                        border: none;
                        border-radius: 8px;
                        cursor: pointer;
                    ">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', adminPanelHTML);
}

// Close admin panel
function closeAdminPanel() {
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) {
        adminPanel.remove();
    }
}

// Delete user (for admin panel)
function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        const result = auth.deleteUser(userId);

        if (result.success) {
            alert('User deleted successfully!');
            closeAdminPanel();
            // Refresh admin panel
            setTimeout(() => {
                showAdminPanel();
            }, 100);
        } else {
            alert(result.message);
        }
    }
}

// Make functions global for onclick handlers
window.closeAdminPanel = closeAdminPanel;
window.deleteUser = deleteUser;

// Handle login
function handleLogin(event) {
    event.preventDefault();

    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');

    if (username && password) {
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate async operation
        setTimeout(() => {
            const result = auth.login(username, password);

            if (result.success) {
                showMainApp();
                // Clear form
                document.getElementById('login-username').value = '';
                document.getElementById('login-password').value = '';
            } else {
                showError('login-password', result.message);
            }

            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 500);
    }
}

// Handle register
function handleRegister(event) {
    event.preventDefault();

    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');

    if (username && password) {
        // Basic validation
        if (username.length < 3) {
            showError('register-username', 'Username must be at least 3 characters long');
            return;
        }

        if (password.length < 6) {
            showError('register-password', 'Password must be at least 6 characters long');
            return;
        }

        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Simulate async operation
        setTimeout(() => {
            const result = auth.createUser(username, password);

            if (result.success) {
                showSuccess('Account created successfully! Please login.');
                setTimeout(() => {
                    showLoginModal();
                    // Clear form
                    document.getElementById('register-username').value = '';
                    document.getElementById('register-password').value = '';
                }, 1500);
            } else {
                showError('register-username', result.message);
            }

            // Remove loading state
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }, 500);
    }
}

// Show error message
function showError(inputId, message) {
    const input = document.getElementById(inputId);
    const existingError = input.parentNode.querySelector('.error-message');

    // Remove existing error
    if (existingError) {
        existingError.remove();
    }

    // Add error class
    input.classList.add('error');

    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    input.parentNode.appendChild(errorDiv);

    // Remove error after 5 seconds
    setTimeout(() => {
        input.classList.remove('error');
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const modal = document.querySelector('.modal:not(.hidden)');
    const modalContent = modal.querySelector('.modal-content');

    // Remove existing success message
    const existingSuccess = modalContent.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }

    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    modalContent.appendChild(successDiv);

    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Handle logout
function handleLogout() {
    auth.logout();
    showLoginModal();
}

// Get user-specific storage key
function getUserStorageKey() {
    const user = auth.getCurrentUser();
    return user ? `${STORAGE_KEY}-${user.id}` : STORAGE_KEY;
}

// Handle form submission
function handleFormSubmit(event) {
    event.preventDefault();

    const url = urlInput.value.trim();
    const note = noteInput.value.trim();

    if (url && note) {
        const bookmark = {
            id: generateId(),
            url: url,
            note: note,
            timestamp: new Date().toISOString(),
            isPinned: false
        };

        saveBookmark(bookmark);
        clearForm();
        renderBookmarks();
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Save bookmark to localStorage
function saveBookmark(bookmark) {
    const bookmarks = getBookmarks();
    bookmarks.push(bookmark);
    localStorage.setItem(getUserStorageKey(), JSON.stringify(bookmarks));
}

// Get all bookmarks from localStorage
function getBookmarks() {
    const bookmarksData = localStorage.getItem(getUserStorageKey());
    return bookmarksData ? JSON.parse(bookmarksData) : [];
}

// Delete bookmark from localStorage
function deleteBookmark(bookmarkId) {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    localStorage.setItem(getUserStorageKey(), JSON.stringify(updatedBookmarks));
    renderBookmarks();
}

// Toggle pin status of bookmark
function togglePinBookmark(bookmarkId) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
        bookmark.isPinned = !bookmark.isPinned;
        localStorage.setItem(getUserStorageKey(), JSON.stringify(bookmarks));
        renderBookmarks();
    }
}

// Clear form inputs
function clearForm() {
    urlInput.value = '';
    noteInput.value = '';
    urlInput.focus();
}

// Load and render bookmarks on page load
function loadBookmarks() {
    renderBookmarks();
}

// Render bookmarks to the DOM
function renderBookmarks() {
    const bookmarks = getBookmarks();

    // Get pinned and all bookmarks
    const pinnedBookmarks = bookmarks.filter(bookmark => bookmark.isPinned);
    const allBookmarks = bookmarks; // Show all bookmarks in "Your Bookmarks" section

    // Clear existing bookmarks
    bookmarksList.innerHTML = '';
    pinnedBookmarksList.innerHTML = '';

    // Render pinned bookmarks
    if (pinnedBookmarks.length === 0) {
        pinnedEmptyState.classList.remove('hidden');
    } else {
        pinnedEmptyState.classList.add('hidden');
        // Sort pinned bookmarks by timestamp (newest first)
        pinnedBookmarks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        pinnedBookmarks.forEach((bookmark, index) => {
            const bookmarkElement = createBookmarkElement(bookmark, index + 1, true);
            pinnedBookmarksList.appendChild(bookmarkElement);
        });
    }

    // Render all bookmarks in "Your Bookmarks" section
    if (allBookmarks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        // Sort all bookmarks by timestamp (newest first)
        allBookmarks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        allBookmarks.forEach((bookmark, index) => {
            const bookmarkElement = createBookmarkElement(bookmark, index + 1, false);
            bookmarksList.appendChild(bookmarkElement);
        });
    }
}

// Create DOM element for a bookmark
function createBookmarkElement(bookmark, number, isPinnedSection) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.className = 'bookmark-item';
    bookmarkDiv.setAttribute('data-id', bookmark.id);

    if (bookmark.isPinned) {
        bookmarkDiv.classList.add('pinned');
    }

    const numberSpan = document.createElement('span');
    numberSpan.className = 'bookmark-number';
    numberSpan.textContent = number;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'bookmark-content';

    const noteSpan = document.createElement('span');
    noteSpan.className = 'bookmark-note';
    noteSpan.textContent = bookmark.note;

    const urlLink = document.createElement('a');
    urlLink.className = 'bookmark-url';
    urlLink.href = bookmark.url;
    urlLink.textContent = bookmark.url;
    urlLink.target = '_blank';
    urlLink.rel = 'noopener noreferrer';

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'bookmark-actions';

    const pinBtn = document.createElement('button');
    pinBtn.className = bookmark.isPinned ? 'pin-btn pinned' : 'pin-btn';
    pinBtn.textContent = bookmark.isPinned ? 'Unpin' : 'Pin';
    pinBtn.addEventListener('click', () => {
        togglePinBookmark(bookmark.id);
    });

    actionsDiv.appendChild(pinBtn);

    // Only add delete button if NOT in pinned section
    if (!isPinnedSection) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this bookmark?')) {
                deleteBookmark(bookmark.id);
            }
        });
        actionsDiv.appendChild(deleteBtn);
    }

    contentDiv.appendChild(noteSpan);
    contentDiv.appendChild(urlLink);

    bookmarkDiv.appendChild(numberSpan);
    bookmarkDiv.appendChild(contentDiv);
    bookmarkDiv.appendChild(actionsDiv);

    return bookmarkDiv;
}

// Utility function to validate URL
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Add some visual feedback when saving
function showSaveSuccess() {
    const saveBtn = document.querySelector('.save-btn');
    const originalText = saveBtn.textContent;

    saveBtn.textContent = 'Saved!';
    saveBtn.style.background = '#27ae60';

    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '#3498db';
    }, 1500);
}

// Enhanced form submission with success feedback
function handleFormSubmit(event) {
    event.preventDefault();

    const url = urlInput.value.trim();
    const note = noteInput.value.trim();

    if (url && note) {
        // Basic URL validation
        if (!isValidUrl(url)) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }

        const bookmark = {
            id: generateId(),
            url: url,
            note: note,
            timestamp: new Date().toISOString(),
            isPinned: false
        };

        saveBookmark(bookmark);
        clearForm();
        renderBookmarks();
        showSaveSuccess();
    }
}
