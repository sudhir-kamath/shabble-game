import { auth, provider, signInWithPopup, signOut, onAuthStateChanged } from './firebase-config.js';

class AuthManager {
    constructor() {
        this.user = null;
        this.signingIn = false;
        this.onUserStateChange = null;
        this.onProfileSetupNeeded = null;
        
        // Reset signing flag on page load to prevent stuck state
        this.signingIn = false;
        
        // Listen for authentication state changes
        onAuthStateChanged(auth, (user) => {
            this.user = user;
            console.log('Auth state changed:', user ? user.email : 'No user');
            
            // Reset signing flag when auth state changes
            if (user) {
                this.signingIn = false;
            }
            
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
            console.log('DEBUG: signInWithGoogle called, signingIn flag:', this.signingIn);
            
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
            
            console.log('DEBUG: Setting signingIn to true');
            this.signingIn = true;
            console.log('Starting Google sign-in...');
            
            const result = await signInWithPopup(auth, provider);
            console.log('DEBUG: Sign-in successful, resetting signingIn flag');
            this.signingIn = false;
            
            return {
                success: true,
                user: result.user,
                isFirstTime: this.isFirstTimeUser(result.user)
            };
        } catch (error) {
            console.log('DEBUG: Sign-in error, resetting signingIn flag');
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
        if (!user) {
            console.log('DEBUG: isFirstTimeUser - no user provided');
            return false;
        }
        
        console.log('DEBUG: Checking if first time user for:', user.uid);
        const userProfile = this.getUserProfile(user.uid);
        console.log('DEBUG: Retrieved user profile:', userProfile);
        
        const isFirstTime = !userProfile || !userProfile.nickname || !userProfile.country;
        console.log('DEBUG: Is first time user?', isFirstTime);
        
        return isFirstTime;
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
    getUserProfile(uid) {
        const key = `shabble_user_${uid}`;
        console.log('DEBUG: Getting user profile with key:', key);
        
        try {
            const stored = localStorage.getItem(key);
            console.log('DEBUG: Raw localStorage value:', stored);
            
            if (!stored) {
                console.log('DEBUG: No profile found in localStorage');
                return null;
            }
            
            const parsed = JSON.parse(stored);
            console.log('DEBUG: Parsed profile:', parsed);
            return parsed;
        } catch (error) {
            console.error('DEBUG: Error reading profile from localStorage:', error);
            return null;
        }
    }

    saveUserProfile(userId, profile) {
        const key = `shabble_user_${userId}`;
        console.log('DEBUG: Saving user profile with key:', key);
        console.log('DEBUG: Profile data to save:', profile);
        
        try {
            const stored = JSON.stringify(profile);
            localStorage.setItem(key, stored);
            console.log('DEBUG: Profile saved to localStorage successfully');
            
            // Verify it was saved
            const verification = localStorage.getItem(key);
            console.log('DEBUG: Verification read back:', verification);
        } catch (error) {
            console.error('DEBUG: Error saving profile to localStorage:', error);
            throw error;
        }
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
        console.log('DEBUG v35: completeProfileSetup called with:', { nickname, country });
        console.log('DEBUG v35: this.currentUser:', this.currentUser);
        console.log('DEBUG v35: this.user:', this.user);
        console.log('DEBUG v35: auth.currentUser:', auth.currentUser);
        
        // Use this.user instead of this.currentUser, or fallback to auth.currentUser
        const user = this.user || auth.currentUser;
        
        if (!user) {
            console.log('DEBUG: No current user found in any location');
            return { success: false, error: 'No user signed in' };
        }
        
        console.log('DEBUG: Using user:', user.uid);

        const nicknameValidation = this.validateNickname(nickname);
        console.log('DEBUG: Nickname validation result:', nicknameValidation);
        if (!nicknameValidation.valid) {
            return { success: false, error: nicknameValidation.error };
        }

        if (!country) {
            console.log('DEBUG: No country provided');
            return { success: false, error: 'Please select a country' };
        }

        try {
            const profile = {
                nickname,
                country,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            console.log('DEBUG: About to save profile:', profile);
            this.saveUserProfile(user.uid, profile);
            console.log('DEBUG: Profile saved successfully');
            
            return { success: true, profile };
        } catch (error) {
            console.error('DEBUG: Profile setup error:', error);
            return { success: false, error: 'Failed to save profile: ' + error.message };
        }
    }

    getCurrentUserProfile() {
        if (!this.currentUser) return null;
        return this.getUserProfile(this.currentUser.uid);
    }
}

// Create singleton instance
export const authManager = new AuthManager();
