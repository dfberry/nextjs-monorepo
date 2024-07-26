import { db, github, lucia, userTable, } from "@/lib/auth";
import { GitHubUser } from './github';
import { cookies } from "next/headers";

export async function createSessionForGitHubUser(dbUserId: string, githubUser: GitHubUser) {
    if (!dbUserId || !githubUser) return;

    try{
        console.log(`createSessionForGitHubUser githubUser: ${dbUserId} for ${JSON.stringify(githubUser)}`);
        const session = await lucia.createSession(dbUserId, githubUser);
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    
    } catch (error) {
        console.error(`createSessionForGitHubUser error: ${error}`);
    }
}