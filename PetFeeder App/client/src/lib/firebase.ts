import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, onAuthStateChanged, User } from "firebase/auth";
import { getDatabase, ref, set, get, onValue, off } from "firebase/database";

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  databaseURL: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export interface FirebaseUser {
  uid: string;
  email: string;
  displayName: string;
}

class FirebaseService {
  private app: any;
  private auth: any;
  private database: any;
  private googleProvider: GoogleAuthProvider;
  private authListeners: Set<(user: FirebaseUser | null) => void> = new Set();

  constructor() {
    console.log('FIREBASE API KEY:', import.meta.env.VITE_FIREBASE_API_KEY);
    const firebaseConfig: FirebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      databaseURL: `https://${import.meta.env.VITE_FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.googleProvider = new GoogleAuthProvider();

    // Listen to auth state changes
    onAuthStateChanged(this.auth, (user: User | null) => {
      const firebaseUser = user ? {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || ""
      } : null;
      
      this.authListeners.forEach(listener => listener(firebaseUser));
    });
  }

  async signInWithGoogle(): Promise<FirebaseUser> {
    try {
      const result = await signInWithPopup(this.auth, this.googleProvider);
      const user = result.user;
      
      return {
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || ""
      };
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    await firebaseSignOut(this.auth);
  }

  getCurrentUser(): FirebaseUser | null {
    const user = this.auth.currentUser;
    if (!user) return null;
    
    return {
      uid: user.uid,
      email: user.email || "",
      displayName: user.displayName || ""
    };
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void): () => void {
    this.authListeners.add(callback);
    
    // Call immediately with current user
    const currentUser = this.getCurrentUser();
    callback(currentUser);
    
    return () => {
      this.authListeners.delete(callback);
    };
  }

  // Realtime Database methods
  async setValue(path: string, value: any): Promise<void> {
    const dbRef = ref(this.database, path);
    await set(dbRef, value);
  }

  async getValue(path: string): Promise<any> {
    const dbRef = ref(this.database, path);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  }

  onValue(path: string, callback: (data: any) => void): () => void {
    const dbRef = ref(this.database, path);
    
    const listener = (snapshot: any) => {
      const data = snapshot.exists() ? snapshot.val() : null;
      callback(data);
    };
    
    onValue(dbRef, listener);
    
    // Return unsubscribe function
    return () => {
      off(dbRef, 'value', listener);
    };
  }

  // PetFeeder specific methods
  async updateDeviceLED(uid: string, deviceId: string, ledStatus: boolean): Promise<void> {
    const path = `users/${uid}/devices/${deviceId}/led`;
    await this.setValue(path, ledStatus);
  }

  async getDeviceLED(uid: string, deviceId: string): Promise<boolean> {
    const path = `users/${uid}/devices/${deviceId}/led`;
    const value = await this.getValue(path);
    return Boolean(value);
  }

  onDeviceLEDChange(uid: string, deviceId: string, callback: (ledStatus: boolean) => void): () => void {
    const path = `users/${uid}/devices/${deviceId}/led`;
    return this.onValue(path, (data) => {
      callback(Boolean(data));
    });
  }

  async createDeviceInFirebase(uid: string, deviceId: string, deviceData: any): Promise<void> {
    const path = `users/${uid}/devices/${deviceId}`;
    await this.setValue(path, {
      ...deviceData,
      led: false,
      createdAt: Date.now(),
      status: 'offline'
    });
  }
}

export const firebase = new FirebaseService();
