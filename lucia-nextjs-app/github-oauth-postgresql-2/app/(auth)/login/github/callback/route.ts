import { githubAuthenticationCallback } from "@/lib/auth/auth";

export async function GET(request: Request): Promise<Response> {
	return await githubAuthenticationCallback(request);
}
