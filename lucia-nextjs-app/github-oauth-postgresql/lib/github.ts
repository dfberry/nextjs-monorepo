export interface GitHubUser {
    id: string;
    login: string;
    github_id: string;
    avatar_url: string;
}

export async function getGithHubUser(accessToken:string):Promise<GitHubUser>{
    const githubUserResponse = await fetch("https://api.github.com/user", {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    const githubUser: GitHubUser = await githubUserResponse.json();
    return githubUser;

}