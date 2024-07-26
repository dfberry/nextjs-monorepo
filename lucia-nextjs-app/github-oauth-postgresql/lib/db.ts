import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import pg from "pg";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { github } from "./auth";
import { userTable, sessionTable } from "./db.schema";
const connectionString = process.env.DATABASE_URL!;

const pool = new pg.Pool({
    connectionString: connectionString
});
const db = drizzle(pool);



const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);
export { db, userTable, sessionTable, adapter };

export interface DatabaseUser {
    id: string;
    username: string;
    github_id: number;
}


// export function generateUniqueKey() {
//     const uuid = uuidv4();
//     const timestamp = Date.now();
//     return `${uuid}-${timestamp}`;
// }

// export function insertToken(userId: string, encryptedAccessToken: string) {
//     const id = generateUniqueKey();
//     const stmt = db.prepare("INSERT INTO token (id, user_id, encrypted_access_token) VALUES (?, ?, ?)");
//     stmt.run(id, userId, encryptedAccessToken);
// }
// export function updateToken(userId: string, encryptedAccessToken: string) {
//     const stmt = db.prepare("UPDATE token SET encrypted_access_token = ? WHERE user_id = ?");
//     stmt.run(encryptedAccessToken, userId);
// }
// export function getUserByGithubId(githubId: string) {
//     const row = db.prepare("SELECT * FROM user WHERE github_id = ?").get(githubId);

//     if (!row) return null;

//     return row;
// }
// export function getTokenByUserId(userId: string) {
//     const row: TokenRow = db.prepare("SELECT * FROM token WHERE user_id = ?").get(userId) as TokenRow;

//     if (!row || !row.encrypted_access_token) return null;

//     const encryptor = new EncryptionService()
//     const decryptedToken = encryptor.decrypt(row?.encrypted_access_token);
//     return decryptedToken;
// }

