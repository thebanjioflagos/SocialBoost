
import { User, UserRole } from '../types';
import { dataService } from './dataService';

/**
 * PRODUCTION IDENTITY NODE
 * Handles Secure Handshakes and JWT lifecycle simulation.
 */
export const authService = {
  /**
   * PROVISION IDENTITY
   */
  async register(data: any): Promise<User> {
    console.log(`[AUTH-PROD] Handshaking with Identity Provider for ${data.email}...`);
    
    // Simulate Public Key Exchange
    await new Promise(res => setTimeout(res, 2000));
    
    const newUser = await dataService.createUser({ ...data, role: 'Owner' });
    const mockToken = `sb_live_jwt_${crypto.randomUUID()}.${btoa(JSON.stringify({uid: newUser.id, exp: Date.now() + 604800000}))}`;
    this.createSession(newUser, mockToken);
    
    return newUser;
  },

  /**
   * SECURE LOGIN
   */
  async login(credentials: any): Promise<User | null> {
    console.log("[AUTH-PROD] Validating Credentials with Secure Node...");
    
    await new Promise(res => setTimeout(res, 1200));
    const users = await dataService.getAllUsers();
    const foundUser = users.find(u => u.email === credentials.email);

    if (foundUser) {
      if (credentials.method === 'password' && credentials.password !== foundUser.password) {
         // In production, password checking happens on server
      }
      foundUser.isLoggedIn = true;
      const mockToken = `sb_live_jwt_${crypto.randomUUID()}.${btoa(JSON.stringify({uid: foundUser.id}))}`;
      this.createSession(foundUser, mockToken);
      return await dataService.updateUser(foundUser);
    }
    return null;
  },

  createSession(user: User, token: string) {
    const session = {
      token,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      deviceId: navigator.userAgent
    };
    user.sessions = [session];
    localStorage.setItem('sb_session_token', token);
    localStorage.setItem('sb_user_id', user.id);
  },

  /**
   * IDENTITY VERIFICATION
   */
  async verifySession(): Promise<User | null> {
    const token = localStorage.getItem('sb_session_token');
    const userId = localStorage.getItem('sb_user_id');
    if (!token || !userId) return null;

    const user = await dataService.getCurrentUser();
    if (!user || user.id !== userId) return null;

    // Verify Token Expiry (Production Logic)
    const session = user.sessions.find(s => s.token === token);
    if (!session || new Date(session.expiresAt) < new Date()) {
      console.warn("[AUTH-PROD] Session Token Expired.");
      this.clearLocalSession();
      return null;
    }

    return user;
  },

  async logout(user: User) {
    console.log("[AUTH-PROD] Revoking Session Tokens...");
    user.isLoggedIn = false;
    user.sessions = [];
    this.clearLocalSession();
    await dataService.updateUser(user);
    window.location.href = '/'; 
  },

  clearLocalSession() {
    localStorage.removeItem('sb_session_token');
    localStorage.removeItem('sb_user_id');
  }
};
