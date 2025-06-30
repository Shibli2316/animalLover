import { firebase, type FirebaseUser } from "./firebase";

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

class AuthService {
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    loading: true,
    error: null
  };
  private unsubscribeAuth?: () => void;

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Listen to Firebase auth state changes
    this.unsubscribeAuth = firebase.onAuthStateChange((user) => {
      this.setState({ user, loading: false, error: null });
    });
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state); // Initial call
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  async signInWithGoogle(): Promise<void> {
    this.setState({ loading: true, error: null });
    
    try {
      await firebase.signInWithGoogle();
      // State will be updated via onAuthStateChange
    } catch (error) {
      this.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : "Authentication failed" 
      });
    }
  }

  async signOut(): Promise<void> {
    this.setState({ loading: true });
    
    try {
      await firebase.signOut();
      // State will be updated via onAuthStateChange
    } catch (error) {
      this.setState({ 
        loading: false, 
        error: error instanceof Error ? error.message : "Sign out failed" 
      });
    }
  }

  getState(): AuthState {
    return this.state;
  }

  destroy() {
    if (this.unsubscribeAuth) {
      this.unsubscribeAuth();
    }
  }
}

export const authService = new AuthService();
