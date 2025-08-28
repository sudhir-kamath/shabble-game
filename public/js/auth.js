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
        onAuthStateChanged(auth, async (user) => {
            this.user = user;

            if (user) {
                // Verify the token with the backend as soon as the user is authenticated.
                await this.verifyTokenWithBackend();
            }
            
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
            // Check if there's already a sign-in in progress
            if (this.signingIn) {
                return {
                    success: false,
                    error: 'Sign-in already in progress'
                };
            }
            
            // Check if user is already signed in
            if (this.user) {
                return {
                    success: true,
                    user: this.user,
                    isFirstTime: false
                };
            }
            
            this.signingIn = true;
            
            const result = await signInWithPopup(auth, provider);
            this.signingIn = false;
            
            return {
                success: true,
                user: result.user,
                isFirstTime: this.isFirstTimeUser(result.user)
            };
        } catch (error) {
            this.signingIn = false;
            
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
            return false;
        }
        
        const userProfile = this.getUserProfile(user.uid);
        
        const isFirstTime = !userProfile || !userProfile.nickname || !userProfile.country;
        
        return isFirstTime;
    }

    async signOutUser() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async verifyTokenWithBackend() {
        if (!this.user) {
            console.log('verifyTokenWithBackend: No user, skipping verification.');
            return;
        }

        try {
            const token = await this.user.getIdToken();
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token }),
            });

            const result = await response.json();

            if (response.ok && result.success) {
                console.log('Backend token verification successful:', result.message);
            } else {
                console.error('Backend token verification failed:', result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error sending token to backend:', error);
        }
    }

    getCurrentUser() {
        return this.user;
    }

    isSignedIn() {
        return this.user !== null;
    }

    getUserDisplayName() {
        return this.user?.displayName || 'User';
    }

    getUserPhotoURL() {
        return this.user?.photoURL || null;
    }

    // Profile management methods
    getUserProfile(uid) {
        const key = `shabble_user_${uid}`;
        
        try {
            const stored = localStorage.getItem(key);
            
            if (!stored) {
                return null;
            }
            
            const parsed = JSON.parse(stored);
            return parsed;
        } catch (error) {
            return null;
        }
    }

    saveUserProfile(userId, profile) {
        const key = `shabble_user_${userId}`;
        
        try {
            const stored = JSON.stringify(profile);
            localStorage.setItem(key, stored);
        } catch (error) {
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
        // Use this.user instead of this.currentUser, or fallback to auth.currentUser
        const user = this.user || auth.currentUser;
        
        if (!user) {
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
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            this.saveUserProfile(user.uid, profile);
            
            return { success: true, profile };
        } catch (error) {
            return { success: false, error: 'Failed to save profile: ' + error.message };
        }
    }

    getCurrentUserProfile() {
        if (!this.user) {
            return null;
        }
        const profile = this.getUserProfile(this.user.uid);
        return profile;
    }
}

// Create singleton instance
export const authManager = new AuthManager();
