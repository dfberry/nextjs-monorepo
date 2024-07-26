import { db, github, lucia, userTable } from "@/lib/auth";
import { cookies } from "next/headers";
import { OAuth2RequestError } from "arctic";
import { generateId } from "lucia";
import { sql } from "drizzle-orm";

export async function GET(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const storedState = cookies().get("github_oauth_state")?.value ?? null;

    console.log(`code: ${code}`);
    console.log(`state: ${state}`);
    console.log(`storedState: ${storedState}`);

    if (!code || !state || !storedState || state !== storedState) {

        console.log(`returning 400`);

        return new Response(null, {
            status: 400
        });
    }

    try {
        const tokens = await github.validateAuthorizationCode(code);

        console.log(`tokens: ${JSON.stringify(tokens)}`);

        const githubUserResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${tokens.accessToken}`
            }
        });
        const githubUser: GitHubUser = await githubUserResponse.json();
        console.log(`githubUser: ${JSON.stringify(githubUser)}`);

        const existingUser = await db.select().from(userTable).where(sql`github_id=${githubUser.id}`);

        if (existingUser[0]) {
            console.log(`existingUser: ${JSON.stringify(existingUser)}`);

            const session = await lucia.createSession(existingUser[0].id, {});
            const sessionCookie = lucia.createSessionCookie(session.id);
            cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
            return new Response(null, {
                status: 302,
                headers: {
                    Location: "/"
                }
            });
        }

        const userId = generateId(15)

        await db.insert(userTable).values({
            id: userId,
            githubId: githubUser.id,
            username: githubUser.login
        });

        const session = await lucia.createSession(userId, {});
        const sessionCookie = lucia.createSessionCookie(session.id);
        cookies().set(sessionCookie.name, sessionCookie.value, sessionCookie.attributes);
        return new Response(null, {
            status: 302,
            headers: {
                Location: "/"
            }
        });
    } catch (e) {
        if (e instanceof OAuth2RequestError) {
            return new Response(null, {
                status: 400
            });
        }
        return new Response(null, {
            status: 500
        });
    }
}

interface GitHubUser {
    id: string;
    login: string;
    avatar_url: string;
}