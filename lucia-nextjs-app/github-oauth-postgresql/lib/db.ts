import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";

import { sql } from "drizzle-orm";

import pg from "pg";
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { drizzle } from "drizzle-orm/node-postgres";
import { github } from "./auth";
import { userTable, sessionTable, tokenTable } from "./db.schema";
import { eq } from 'drizzle-orm/expressions';
import EncryptionService from "./encrypt";
import { GitHubUser } from "./github";

const connectionString = process.env.DATABASE_URL!;

const pool = new pg.Pool({
    connectionString: connectionString
});
const db = drizzle(pool);

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable);


export interface DatabaseUser {
    id: string;
    username: string;
    githubId: string;
}

async function updateDbToken(dbUserId: string, encryptedAccessToken: string) {

    if (!dbUserId || !encryptedAccessToken) throw new Error("updateDbToken: Invalid arguments");

    await db.update(tokenTable)
        .set({ encryptedAccessToken })
        .where(eq(tokenTable.userId, dbUserId))
        .execute();
}
async function insertDbToken(dbUserId: string, encryptedAccessToken: string) {

    if (!dbUserId || !encryptedAccessToken) throw new Error("insertDbToken: Invalid arguments");

    await db.insert(tokenTable)
        .values({
            userId: dbUserId,
            encryptedAccessToken: encryptedAccessToken
        })
        .execute();
}
function convertGitHubUserToDatabaseUser(newDbUserId: string, githubUser: GitHubUser): DatabaseUser {
    return {
        id: newDbUserId,
        githubId: githubUser.github_id,
        username: githubUser.login
    };
}

async function insertDbUser(dbUserId: string, githubUser: GitHubUser) {

    console.log(`insertDbUser: dbUserId ${dbUserId}`);
    console.log(`insertDbUser: githubUser.github_id ${githubUser.id}`);
    console.log(`insertDbUser: githubUser.login ${githubUser.login}`);

    if (!dbUserId || !githubUser.id || !githubUser.login) throw new Error("insertUser: Invalid arguments");

    const { id, ...userWithoutId } = githubUser;

    await db.insert(userTable)
        .values({
            id: dbUserId,
            githubId: githubUser.id,
            username: githubUser.login
        })
        .execute();
}
async function getDbUserByGithubId(githubId: string): Promise<DatabaseUser | null> {

    try {
        if (!githubId) throw new Error("getDbUserByGithubId: Invalid arguments");

        console.log(`getDbUserByGithubId: ${githubId}`);

        const row = await db.select().from(userTable).where(eq(userTable.githubId, githubId)).execute();

        if (row.length === 0) return null;
        return row[0] as DatabaseUser;
    }
    catch (error) {
        console.error(`getDbUserByGithubId error: ${error}`);
        return null;
    }

}

async function getDbTokenByDbUserId(dbUserId: string) {

    if (!dbUserId) throw new Error("getDbTokenByDbUserId: Invalid arguments");

    const row = await db.select().from(tokenTable).where(eq(tokenTable.userId, dbUserId)).execute();

    if (row.length === 0 || !row[0].encryptedAccessToken) return null;

    const encryptor = new EncryptionService();
    const decryptedToken = encryptor.decrypt(row[0].encryptedAccessToken);
    return decryptedToken;
}

async function deleteDbTokenByDbUserId(dbUserId: string) {

    if (!dbUserId) throw new Error("deleteDbTokenByDbUserId: Invalid arguments");

    await db.delete(tokenTable).where(eq(tokenTable.userId, dbUserId)).execute();
}

export { db, userTable, sessionTable, adapter, tokenTable, updateDbToken, insertDbToken, insertDbUser, deleteDbTokenByDbUserId, convertGitHubUserToDatabaseUser, getDbUserByGithubId, getDbTokenByDbUserId };