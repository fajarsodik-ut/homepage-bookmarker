// DOM Elements
const bookmarkForm = document.getElementById('bookmark-form');
const urlInput = document.getElementById('url-input');
const noteInput = document.getElementById('note-input');
const bookmarksList = document.getElementById('bookmarks-list');
const emptyState = document.getElementById('empty-state');

// Storage key for localStorage
const STORAGE_KEY = 'simple-link-note-saver-bookmarks';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
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
            timestamp: new Date().toISOString()
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
    
    // Clear existing bookmarks
    bookmarksList.innerHTML = '';
    
    if (bookmarks.length === 0) {
        emptyState.classList.remove('hidden');
        return;
    }
    
    emptyState.classList.add('hidden');
    
    // Sort bookmarks by timestamp (newest first)
    bookmarks.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    bookmarks.forEach(bookmark => {
        const bookmarkElement = createBookmarkElement(bookmark);
        bookmarksList.appendChild(bookmarkElement);
    });
}

// Create DOM element for a bookmark
function createBookmarkElement(bookmark) {
    const bookmarkDiv = document.createElement('div');
    bookmarkDiv.className = 'bookmark-item';
    bookmarkDiv.setAttribute('data-id', bookmark.id);
    
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
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this bookmark?')) {
            deleteBookmark(bookmark.id);
        }
    });
    
    contentDiv.appendChild(noteSpan);
    contentDiv.appendChild(urlLink);
    
    bookmarkDiv.appendChild(contentDiv);
    bookmarkDiv.appendChild(deleteBtn);
    
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
            timestamp: new Date().toISOString()
        };
        
        saveBookmark(bookmark);
        clearForm();
        renderBookmarks();
        showSaveSuccess();
    }
}
