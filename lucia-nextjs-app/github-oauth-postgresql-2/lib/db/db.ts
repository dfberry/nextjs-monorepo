import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { userTable, sessionTable, tokenTable } from "./db.schema";
import { eq } from "drizzle-orm";
import EncryptionService from "../encrypt";
import { GitHubUser } from "../github/github";

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

async function updateDbToken(dbUserId: string, encryptedAccessToken: string):Promise<void> {

    if (!dbUserId || !encryptedAccessToken) throw new Error("updateDbToken: Invalid arguments");

    const updatedToken = await db.update(tokenTable)
        .set({ encryptedAccessToken })
        .where(eq(tokenTable.userId, dbUserId))
        .execute();

    console.log(`updateDbToken: `, updatedToken);
}
async function insertDbToken(dbUserId: string, accessToken: string): Promise<void> {

    console.log(`insertDbToken: `, dbUserId, accessToken);
    if (!dbUserId || !accessToken) throw new Error("insertDbToken: Invalid arguments");

    const encryptor = new EncryptionService();
    const encryptedUserId = encryptor.encrypt(dbUserId);
    const encryptedToken = encryptor.encrypt(accessToken);
    console.log(`insertDbToken encryptedToken: `, encryptedToken);

    // const existingToken = await db.select().from(userTable)
    // .where(eq(tokenTable.userId, encryptedUserId))
    // .execute();

    const deletedTokens = await db.delete(tokenTable)
    .where(eq(tokenTable.userId, encryptedUserId))
    .execute();
    console.log(`insertDbToken deletedTokens: `, deletedTokens);

    const insertedToken = await db.insert(tokenTable)
        .values({
            userId: dbUserId,
            encryptedAccessToken: encryptedToken
        })
        .execute();

    console.log(`insertDbToken: `, insertedToken);
}
function convertGitHubUserToDatabaseUser(newDbUserId: string, githubUser: GitHubUser): DatabaseUser {
    return {
        id: newDbUserId,
        githubId: githubUser.github_id,
        username: githubUser.login
    };
}

async function insertDbUser(dbUserId: string, githubUser: Pick<GitHubUser, 'id' | 'login'>) {

    console.log(`insertDbUser: `, dbUserId, githubUser);
    const encryptor = new EncryptionService();

    if (!dbUserId || !githubUser.id || !githubUser.login) throw new Error("insertUser: Invalid arguments");

    const newUser = {
        id: dbUserId,
        githubId: encryptor.encrypt(githubUser.id.toString()),
        username: encryptor.encrypt(githubUser.login)
    };
    console.log(`insertDbUser: `, newUser);

    await db.insert(userTable)
        .values(newUser)
        .execute();
}
/**
 * SECURITY RISK: This function may expose the accessToken.
 * Ensure that the accessToken is handled securely and not logged or exposed in any way.
 */
async function getDbUserByGithubId(githubId: string): Promise<DatabaseUser | null> {

    try {
        if (!githubId) throw new Error("getDbUserByGithubId: Invalid arguments");

        console.log(`getDbUserByGithubId unencrypted GitHubId: ${githubId}`);
        const encryptedId = new EncryptionService().encrypt(githubId.toString());
        console.log(`getDbUserByGithubId encrypted GitHubId: ${encryptedId}`);

        const row = await db.select().from(userTable).where(eq(userTable.githubId, encryptedId)).execute();

        if (row.length === 0) return null;
        return row[0] as DatabaseUser;
    }
    catch (error) {
        console.error(`getDbUserByGithubId error: ${error}`);
        return null;
    }

}

async function getDbTokenByDbUserId(dbUserId: string): Promise<string | null> {

    console.log(`getDbTokenByDbUserId encrypted user id: ${dbUserId}`);
    if (!dbUserId) throw new Error("getDbTokenByDbUserId: Invalid arguments");

    const row = await db.select().from(tokenTable).where(eq(tokenTable.userId, dbUserId)).execute();

    if (row.length === 0 || !row[0].encryptedAccessToken) {
        console.log(`getDbTokenByDbUserId: No token found`);
        return null;
    }
    const encryptor = new EncryptionService();
    const decryptedToken = encryptor.decrypt(row[0].encryptedAccessToken);
    
    console.log(`getDbTokenByDbUserId decrypted access token: ${decryptedToken}`);

    return decryptedToken;
}

async function deleteDbTokenByDbUserId(dbUserId: string): Promise<void> {

    if (!dbUserId) throw new Error("deleteDbTokenByDbUserId: Invalid arguments");

    const deletedTokens = await db.delete(tokenTable).where(eq(tokenTable.userId, dbUserId)).execute();
    console.log(`deleteDbTokenByDbUserId: `, deletedTokens);
}

export { db, userTable, sessionTable, adapter, tokenTable, updateDbToken, insertDbToken, insertDbUser, deleteDbTokenByDbUserId, convertGitHubUserToDatabaseUser, getDbUserByGithubId, getDbTokenByDbUserId };