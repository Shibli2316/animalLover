// AES encryption utilities
// In production, use crypto-js or Web Crypto API

export interface EncryptedPayload {
  data: string;
  iv: string;
}

class CryptoUtil {
  private key: string;

  constructor() {
    // In production, get from environment variables
    this.key = import.meta.env.VITE_AES_ENCRYPTION_KEY || "default-32-char-key-for-aes-256";
  }

  async encrypt(data: string): Promise<EncryptedPayload> {
    // Mock encryption - in production use proper AES-256
    const iv = this.generateIV();
    const encrypted = btoa(data + iv); // Simple base64 encoding for demo
    
    return {
      data: encrypted,
      iv: iv
    };
  }

  async decrypt(payload: EncryptedPayload): Promise<string> {
    // Mock decryption
    const decoded = atob(payload.data);
    return decoded.replace(payload.iv, '');
  }

  private generateIV(): string {
    return Math.random().toString(36).substring(2, 18);
  }

  async encryptWiFiPayload(payload: {
    ssid: string;
    password: string;
    apiKey: string;
    databaseUrl: string;
    espEmail: string;
    espPassword: string;
  }): Promise<EncryptedPayload> {
    const jsonString = JSON.stringify(payload);
    return this.encrypt(jsonString);
  }
}

export const crypto = new CryptoUtil();
