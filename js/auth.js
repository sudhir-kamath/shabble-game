import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.onUserStateChange = null;
        this.onProfileSetupNeeded = null;
        this.init();
    }

    init() {
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.currentUser = user;
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
            const result = await signInWithPopup(auth, provider);
            return {
                success: true,
                user: result.user,
                isFirstTime: this.isFirstTimeUser(result.user)
            };
        } catch (error) {
            console.error('Sign-in error:', error);
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
