import { SessionResult } from "../auth/auth";
import { getDbTokenByDbUserId } from "@/lib/db/db";
export interface GitHubUser {
    id: string;
    login: string;
    github_id: string; // TBD - I don't this is returned
    avatar_url: string;
}

export default class GitHubService {

    static async getGithHubUserByUnencryptedAccessToken(unencryptedAccessToken: string): Promise<GitHubUser> {
        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${unencryptedAccessToken}`
            }
        });
        const githubUser: GitHubUser = await githubUserResponse.json();
        console.log(`getGithHubUserByUnencryptedAccessToken: ${JSON.stringify(githubUser)}`);
        return githubUser;
    }
    static async getGithHubUserBySessionResult(sessionResult: SessionResult): Promise<any> {

        console.log(`getGithHubUserBySessionResult sessionResult: ${JSON.stringify(sessionResult)}`);
        if (!sessionResult || !sessionResult.session?.userId) throw new Error("getGithHubUserBySessionResult: Invalid arguments");

        const accessToken = await getDbTokenByDbUserId(sessionResult.session.userId);
        console.log(`getGithHubUserBySessionResult decrypted accessToken: ${accessToken}`);
        if (!accessToken) throw new Error("getGithHubUserBySessionResult: No access token found");

        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        const githubUser = await githubUserResponse.json();

        console.log(`getGithHubUserBySessionResult: ${JSON.stringify(githubUser)}`);

        return githubUser;
    }
}