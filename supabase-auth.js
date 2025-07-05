// Supabase Authentication System
class SupabaseAuthSystem {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
        this.initializeAuth();
    }

    async initializeAuth() {
        // Check if user is already logged in
        const { data: { user } } = await this.supabase.auth.getUser();
        if (user) {
            this.currentUser = user;
            await this.createOrUpdateUserProfile(user);
        }

        // Listen for auth changes
        this.supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                this.currentUser = session.user;
                await this.createOrUpdateUserProfile(session.user);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
            }
        });
    }

    async createOrUpdateUserProfile(user) {
        const { error } = await this.supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                username: user.email.split('@')[0], // Use email prefix as username
                updated_at: new Date().toISOString()
            });

        if (error) {
            console.error('Error creating/updating user profile:', error);
        }
    }

    async register(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                return { success: false, message: error.message };
            }

            return {
                success: true,
                message: 'Registration successful! Please check your email to verify your account.',
                user: data.user
            };
        } catch (error) {
            return { success: false, message: 'Registration failed: ' + error.message };
        }
    }

    async login(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                return { success: false, message: error.message };
            }

            return {
                success: true,
                user: data.user
            };
        } catch (error) {
            return { success: false, message: 'Login failed: ' + error.message };
        }
    }

    async logout() {
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }
            this.currentUser = null;
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    async getUserProfile() {
        if (!this.currentUser) return null;

        const { data, error } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', this.currentUser.id)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }

        return data;
    }

    // Bookmark operations
    async getBookmarks() {
        if (!this.currentUser) return [];

        const { data, error } = await this.supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', this.currentUser.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching bookmarks:', error);
            return [];
        }

        return data || [];
    }

    async saveBookmark(bookmark) {
        if (!this.currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        const { data, error } = await this.supabase
            .from('bookmarks')
            .insert([{
                user_id: this.currentUser.id,
                url: bookmark.url,
                note: bookmark.note,
                is_pinned: bookmark.isPinned || false
            }]);

        if (error) {
            console.error('Error saving bookmark:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data };
    }

    async updateBookmark(bookmarkId, updates) {
        if (!this.currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        const { data, error } = await this.supabase
            .from('bookmarks')
            .update(updates)
            .eq('id', bookmarkId)
            .eq('user_id', this.currentUser.id);

        if (error) {
            console.error('Error updating bookmark:', error);
            return { success: false, message: error.message };
        }

        return { success: true, data };
    }

    async deleteBookmark(bookmarkId) {
        if (!this.currentUser) {
            return { success: false, message: 'User not logged in' };
        }

        const { error } = await this.supabase
            .from('bookmarks')
            .delete()
            .eq('id', bookmarkId)
            .eq('user_id', this.currentUser.id);

        if (error) {
            console.error('Error deleting bookmark:', error);
            return { success: false, message: error.message };
        }

        return { success: true };
    }

    async togglePinBookmark(bookmarkId, isPinned) {
        return await this.updateBookmark(bookmarkId, {
            is_pinned: isPinned,
            updated_at: new Date().toISOString()
        });
    }
}

// Initialize the auth system
window.supabaseAuth = new SupabaseAuthSystem();
