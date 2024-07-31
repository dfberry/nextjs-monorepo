import { db, github, lucia, userTable } from "@/lib/auth/auth";
import { GitHubUser } from '../github/github';
import { cookies } from "next/headers";

export default class SessionManager {

    static async createSessionForGitHubUser(dbUserId: string, githubUser: GitHubUser) {
        if (!dbUserId || !githubUser) return;

        try {
            console.log(`createSessionForGitHubUser githubUser: ${dbUserId} for ${JSON.stringify(githubUser)}`);
            const session = await lucia.createSession(dbUserId, githubUser);
            this.setFreshSessionCookie(session.id);
        } catch (error) {
            console.error(`createSessionForGitHubUser error: ${error}`);
        }
    }

    static setFreshSessionCookie(sessionId: string): void {
        const sessionCookie = lucia.createSessionCookie(sessionId);
        console.log("validateRequest sessionCookie", sessionCookie);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    static setBlankSessionCookie(): void {
        const sessionCookie = lucia.createBlankSessionCookie();
        console.log("validateRequest sessionCookie", sessionCookie);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    static async updateSessionCookie(userId: string): Promise<void> {
        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
    }

    static getSessionId(): string | null {
        return cookies().get(lucia.sessionCookieName)?.value ?? null;
    }
}
