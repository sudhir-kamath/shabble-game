import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';

class AuthManager {
    constructor() {
        this.user = null;
        this.signingIn = false;
        this.onUserStateChange = null;
        this.onProfileSetupNeeded = null;
        
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            if (this.onUserStateChange) {
                this.onUserStateChange(user);
            }
            
            // Check if profile setup is needed for new users
            if (user && this.isFirstTimeUser(user)) {
                if (this.onProfileSetupNeeded) {
                    this.onProfileSetupNeeded(user);
                }
            }
        });
    }

    async signInWithGoogle() {
        try {
            // Check if there's already a sign-in in progress
            if (this.signingIn) {
                console.log('Sign-in already in progress, ignoring request');
                return {
                    success: false,
                    error: 'Sign-in already in progress'
                };
            }
            
            // Check if user is already signed in
            if (this.user) {
                console.log('User already signed in');
                return {
                    success: true,
                    user: this.user,
                    isFirstTime: false
                };
            }
            
            this.signingIn = true;
            console.log('Starting Google sign-in...');
            const result = await signInWithPopup(auth, provider);
            this.signingIn = false;
            
            return {
                success: true,
                user: result.user,
                isFirstTime: this.isFirstTimeUser(result.user)
            };
        } catch (error) {
            this.signingIn = false;
            console.error('Sign-in error:', error);
            
            // Handle specific Firebase auth errors
            if (error.code === 'auth/cancelled-popup-request') {
                return {
                    success: false,
                    error: 'Sign-in was cancelled. Please try again.'
                };
            } else if (error.code === 'auth/popup-blocked') {
                return {
                    success: false,
                    error: 'Popup was blocked by browser. Please allow popups and try again.'
                };
            } else if (error.code === 'auth/popup-closed-by-user') {
                return {
                    success: false,
                    error: 'Sign-in popup was closed. Please try again.'
                };
            }
            
            return {
                success: false,
                error: error.message
            };
        }
    }

    isFirstTimeUser(user) {
        if (!user) return false;
        const userProfile = this.getUserProfile(user.uid);
        return !userProfile || !userProfile.nickname || !userProfile.country;
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

    // Profile management methods
    getUserProfile(userId) {
        const profiles = JSON.parse(localStorage.getItem('shabble_user_profiles') || '{}');
        return profiles[userId] || null;
    }

    saveUserProfile(userId, profile) {
        const profiles = JSON.parse(localStorage.getItem('shabble_user_profiles') || '{}');
        profiles[userId] = {
            ...profile,
            createdAt: profile.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        localStorage.setItem('shabble_user_profiles', JSON.stringify(profiles));
    }

    validateNickname(nickname) {
        if (!nickname || nickname.length < 3 || nickname.length > 20) {
            return { valid: false, error: 'Nickname must be 3-20 characters long' };
        }
        if (!/^[a-zA-Z0-9]+$/.test(nickname)) {
            return { valid: false, error: 'Nickname can only contain letters and numbers' };
        }
        return { valid: true };
    }

    async completeProfileSetup(nickname, country) {
        if (!this.currentUser) {
            return { success: false, error: 'No user signed in' };
        }

        const nicknameValidation = this.validateNickname(nickname);
        if (!nicknameValidation.valid) {
            return { success: false, error: nicknameValidation.error };
        }

        if (!country) {
            return { success: false, error: 'Please select a country' };
        }

        try {
            const profile = {
                nickname,
                country,
                email: this.currentUser.email,
                displayName: this.currentUser.displayName,
                photoURL: this.currentUser.photoURL
            };

            this.saveUserProfile(this.currentUser.uid, profile);
            
            return { success: true, profile };
        } catch (error) {
            console.error('Profile setup error:', error);
            return { success: false, error: 'Failed to save profile' };
        }
    }

    getCurrentUserProfile() {
        if (!this.currentUser) return null;
        return this.getUserProfile(this.currentUser.uid);
    }
}

// Create singleton instance
export const authManager = new AuthManager();
