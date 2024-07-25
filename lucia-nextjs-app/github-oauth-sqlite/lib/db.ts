import sqlite from "better-sqlite3";
const { v4: uuidv4 } = require('uuid');
import EncryptionService from "./encrypt";

export const db = sqlite("main.db");

db.exec(`CREATE TABLE IF NOT EXISTS user (
    id TEXT NOT NULL PRIMARY KEY,
    github_id INTEGER UNIQUE,
    username TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS session (
    id TEXT NOT NULL PRIMARY KEY,
    expires_at INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);
// Define the structure of a row in the tokens table
interface TokenRow {
    id: string;
    github_id: string;
    encrypted_access_token: string;
    // Add other fields if necessary
}
db.exec(`CREATE TABLE IF NOT EXISTS token (
    id TEXT NOT NULL PRIMARY KEY,
    user_id TEXT NOT NULL,
    encrypted_access_token TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user(id)
)`);
export function generateUniqueKey() {
    const uuid = uuidv4();
    const timestamp = Date.now();
    return `${uuid}-${timestamp}`;
}

export function insertToken(userId: string, encryptedAccessToken: string) {
    const id = generateUniqueKey();
    const stmt = db.prepare("INSERT INTO token (id, user_id, encrypted_access_token) VALUES (?, ?, ?)");
    stmt.run(id, userId, encryptedAccessToken);
}
export function updateToken(userId: string, encryptedAccessToken: string) {
    const stmt = db.prepare("UPDATE token SET encrypted_access_token = ? WHERE user_id = ?");
    stmt.run(encryptedAccessToken, userId);
}
export function getUserByGithubId(githubId: string) {
    const row = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubId);

    if (!row) return null;

    return row;
}
export function getTokenByUserId(userId: string) {
    const row: TokenRow = db.prepare("SELECT * FROM token WHERE user_id = ?").get(userId) as TokenRow;

    if (!row || !row.encrypted_access_token) return null;

    const encryptor = new EncryptionService()
    const decryptedToken = encryptor.decrypt(row?.encrypted_access_token);
    return decryptedToken;
}
export interface DatabaseUser {
    id: string;
    username: string;
    github_id: number;
}
