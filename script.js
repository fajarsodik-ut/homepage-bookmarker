// DOM Elements
const bookmarkForm = document.getElementById('bookmark-form');
const urlInput = document.getElementById('url-input');
const noteInput = document.getElementById('note-input');
const bookmarksList = document.getElementById('bookmarks-list');
const pinnedBookmarksList = document.getElementById('pinned-bookmarks-list');
const emptyState = document.getElementById('empty-state');
const pinnedEmptyState = document.getElementById('pinned-empty-state');

// Storage key for localStorage
const STORAGE_KEY = 'simple-link-note-saver-bookmarks';

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    loadBookmarks();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    bookmarkForm.addEventListener('submit', handleFormSubmit);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

// Get all bookmarks from localStorage
function getBookmarks() {
    const bookmarksData = localStorage.getItem(STORAGE_KEY);
    return bookmarksData ? JSON.parse(bookmarksData) : [];
}

// Delete bookmark from localStorage
function deleteBookmark(bookmarkId) {
    const bookmarks = getBookmarks();
    const updatedBookmarks = bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBookmarks));
    renderBookmarks();
}

// Toggle pin status of bookmark
function togglePinBookmark(bookmarkId) {
    const bookmarks = getBookmarks();
    const bookmark = bookmarks.find(b => b.id === bookmarkId);
    if (bookmark) {
        bookmark.isPinned = !bookmark.isPinned;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
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
