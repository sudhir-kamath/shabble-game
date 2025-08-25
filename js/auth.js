import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onUserStateChange = null;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
            if (this.onUserStateChange) {
                this.onUserStateChange(user);
            }
        });
    }

    async signInWithGoogle() {
        try {
            const result = await signInWithPopup(auth, provider);
            return {
                success: true,
                user: result.user
            };
        } catch (error) {
            console.error('Sign-in error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async signOutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error('Sign-out error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isSignedIn() {
        return this.currentUser !== null;
    }

    getUserDisplayName() {
        return this.currentUser?.displayName || 'User';
    }

    getUserPhotoURL() {
        return this.currentUser?.photoURL || null;
    }
}

// Create singleton instance
export const authManager = new AuthManager();
