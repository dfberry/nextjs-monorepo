// encryptionService.ts
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';

dotenv.config();

/*
openssl rand -hex 32  # For the 32-byte encryption key
openssl rand -hex 16  # For the 16-byte IV
*/

class EncryptionService {
  private algorithm: string;
  private key: Buffer;
  private iv: Buffer;

  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.key = Buffer.from(process.env.ENCRYPTION_KEY!!, 'hex');
    this.iv = Buffer.from(process.env.ENCRYPTION_IV!!, 'hex');
  }

  encrypt(text: string): string {
    const cipher = crypto.createCipheriv(this.algorithm, this.key, this.iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;

  }

  decrypt(encryptedData: string): string {
    const decipher = crypto.createDecipheriv(this.algorithm, this.key, this.iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export default EncryptionService;