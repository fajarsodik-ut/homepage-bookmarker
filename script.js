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

// Authentication system - use Supabase instead of localStorage
const auth = window.supabaseAuth;

// Storage key for localStorage (per user)
const STORAGE_KEY = 'simple-link-note-saver-bookmarks';

// Initialize the application
document.addEventListener('DOMContentLoaded', async function () {
    await initializeApp();
});

// Initialize the application
async function initializeApp() {
    // Wait longer for Supabase auth to initialize and check for existing sessions
    console.log('Initializing app, waiting for auth...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check for email confirmation in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('type') === 'signup') {
        showSuccess('Email confirmed! You can now login with your credentials.');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // Check authentication status
    console.log('Checking if user is logged in...');
    if (auth.isLoggedIn()) {
        console.log('User is logged in, showing main app');
        await showMainApp();
    } else {
        console.log('User not logged in, showing login modal');
        showLoginModal();
    }

    setupEventListeners();
}

// Show main app
async function showMainApp() {
    const user = auth.getCurrentUser();
    if (user) {
        loginModal.classList.add('hidden');
        registerModal.classList.add('hidden');
        mainApp.classList.remove('hidden');

        // Update user info - get profile for username
        const profile = await auth.getUserProfile();
        const displayName = profile ? profile.username : user.email.split('@')[0];
        currentUserSpan.textContent = `👤 Welcome, ${displayName}!`;

        // Load user's bookmarks
        await loadBookmarks();
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
}

// Make functions global for onclick handlers
window.deleteBookmark = deleteBookmark;
window.deleteUser = deleteUser;

// Handle login
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');

    if (email && password) {
        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const result = await auth.login(email, password);

            if (result.success) {
                showMainApp();
                // Clear form
                document.getElementById('login-email').value = '';
                document.getElementById('login-password').value = '';
            } else {
                showError('login-password', result.message);
            }
        } catch (error) {
            showError('login-password', 'Login failed: ' + error.message);
        }

        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

// Handle register
async function handleRegister(event) {
    event.preventDefault();

    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value.trim();
    const submitBtn = event.target.querySelector('button[type="submit"]');

    if (email && password) {
        // Basic validation
        if (!email.includes('@')) {
            showError('register-email', 'Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            showError('register-password', 'Password must be at least 6 characters long');
            return;
        }

        // Add loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const result = await auth.register(email, password);

            if (result.success) {
                showSuccess('Account created successfully! Please check your email to verify your account.');
                setTimeout(() => {
                    showLoginModal();
                    // Clear form
                    document.getElementById('register-email').value = '';
                    document.getElementById('register-password').value = '';
                }, 3000);
            } else {
                showError('register-email', result.message);
            }
        } catch (error) {
            showError('register-email', 'Registration failed: ' + error.message);
        }

        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
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

    if (modal) {
        // Show in modal if one is open
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
    } else {
        // Show as toast notification if no modal is open
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
            z-index: 1000;
            font-weight: 600;
            max-width: 300px;
            animation: slideInRight 0.3s ease;
        `;
        toast.textContent = message;

        // Add animation keyframes
        if (!document.querySelector('#toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(toast);

        // Remove toast after 5 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 5000);
    }
}

// Handle logout
async function handleLogout() {
    await auth.logout();
    showLoginModal();
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();

    const url = urlInput.value.trim();
    const note = noteInput.value.trim();
    const saveBtn = event.target.querySelector('.save-btn');

    if (url && note) {
        // Basic URL validation
        if (!isValidUrl(url)) {
            alert('Please enter a valid URL starting with http:// or https://');
            return;
        }

        // Show loading state
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const bookmark = {
            url: url,
            note: note,
            isPinned: false
        };

        try {
            console.log('Saving bookmark...', bookmark);
            const result = await auth.saveBookmark(bookmark);

            if (result.success) {
                console.log('Bookmark saved successfully, clearing form...');
                clearForm();

                // Wait a moment for the database to update
                await new Promise(resolve => setTimeout(resolve, 500));

                // Force a complete refresh of the bookmarks display
                console.log('Refreshing bookmark display...');
                await loadBookmarks();

                showSaveSuccess();
                console.log('Bookmark process completed successfully');
            } else {
                console.error('Failed to save bookmark:', result.message);
                alert('Failed to save bookmark: ' + result.message);
            }
        } catch (error) {
            console.error('Error saving bookmark:', error);
            alert('Error saving bookmark: ' + error.message);
        } finally {
            // Restore button state
            saveBtn.textContent = originalText;
            saveBtn.disabled = false;
        }
    }
}

// Delete bookmark from Supabase
async function deleteBookmark(bookmarkId) {
    try {
        const result = await auth.deleteBookmark(bookmarkId);
        if (result.success) {
            console.log('Bookmark deleted successfully, refreshing display...');
            await renderBookmarks();
        } else {
            console.error('Failed to delete bookmark:', result.message);
            alert('Failed to delete bookmark: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting bookmark:', error);
        alert('Error deleting bookmark: ' + error.message);
    }
}

// Toggle pin status of bookmark
async function togglePinBookmark(bookmarkId) {
    try {
        const bookmarks = await auth.getBookmarks();
        const bookmark = bookmarks.find(b => b.id === bookmarkId);

        if (bookmark) {
            const result = await auth.togglePinBookmark(bookmarkId, !bookmark.is_pinned);
            if (result.success) {
                console.log('Bookmark pin status updated, refreshing display...');
                await renderBookmarks();
            } else {
                console.error('Failed to update bookmark:', result.message);
                alert('Failed to update bookmark: ' + result.message);
            }
        }
    } catch (error) {
        console.error('Error toggling pin:', error);
        alert('Error toggling pin: ' + error.message);
    }
}

// Clear form inputs
function clearForm() {
    urlInput.value = '';
    noteInput.value = '';
    urlInput.focus();
}

// Load and render bookmarks on page load
async function loadBookmarks() {
    console.log('loadBookmarks called, calling renderBookmarks...');
    await renderBookmarks();
    console.log('loadBookmarks completed');
}

// Render bookmarks to the DOM
async function renderBookmarks() {
    try {
        console.log('Fetching bookmarks...');
        const bookmarks = await auth.getBookmarks();
        console.log('Fetched bookmarks:', bookmarks.length);

        // Get pinned and all bookmarks
        const pinnedBookmarks = bookmarks.filter(bookmark => bookmark.is_pinned);
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
            pinnedBookmarks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
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
            allBookmarks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            allBookmarks.forEach((bookmark, index) => {
                const bookmarkElement = createBookmarkElement(bookmark, index + 1, false);
                bookmarksList.appendChild(bookmarkElement);
            });
        }

        console.log('Bookmarks rendered successfully');
    } catch (error) {
        console.error('Error rendering bookmarks:', error);
    }
}

// Create DOM element for a bookmark
function createBookmarkElement(bookmark, number, isPinnedSection) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.className = 'bookmark-item';
    bookmarkDiv.setAttribute('data-id', bookmark.id);

    if (bookmark.is_pinned) {
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
    pinBtn.className = bookmark.is_pinned ? 'pin-btn pinned' : 'pin-btn';
    pinBtn.textContent = bookmark.is_pinned ? 'Unpin' : 'Pin';
    pinBtn.addEventListener('click', async () => {
        await togglePinBookmark(bookmark.id);
    });

    actionsDiv.appendChild(pinBtn);

    // Only add delete button if NOT in pinned section
    if (!isPinnedSection) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this bookmark?')) {
                await deleteBookmark(bookmark.id);
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
