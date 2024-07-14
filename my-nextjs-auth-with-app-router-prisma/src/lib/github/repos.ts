/*
https://docs.github.com/en/rest/repos/repos?apiVersion=2022-11-28


curl -L \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer <YOUR-TOKEN>" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/orgs/ORG/repos

*/
export type GitHubRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  };
  html_url: string;
  description: string | null;
  fork: boolean;
  url: string;
  created_at: string; // ISO8601
  updated_at: string; // ISO8601
  pushed_at: string; // ISO8601
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string | null;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string | null;
  forks_count: number;
  open_issues_count: number;
  master_branch?: string;
  default_branch: string;
  score?: number;
};

export type GitHubReposResponse = GitHubRepo[];

// Define the function to fetch GitHub organization repositories
export async function fetchOrgRepos(org: string, token: string): Promise<GitHubReposResponse> {
  const url = `https://api.github.com/orgs/${org}/repos`;

  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (!response.ok) {
      throw new Error(`Error fetching repos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch organization repos:', error);
    throw error;
  }
}
/*

User repos

curl -L \
-H "Accept: application/vnd.github+json" \
-H "Authorization: Bearer <YOUR-TOKEN>" \
-H "X-GitHub-Api-Version: 2022-11-28" \
https://api.github.com/users/USERNAME/repos

*/
export async function fetchUserRepos(org: string, token?: string, currentPage = 1, resultsPerPage = 100, sort = 'updated', direction = "desc", type = 'owner'): Promise<GitHubReposResponse> {
  const url = `https://api.github.com/users/${org}/repos?per_page=${resultsPerPage}&page=${currentPage}&direction=${direction}&sort=${sort}&type=${type}`;


  try {
    const options = {
      headers: {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      }
    };

    if (token) {
      // @ts-ignore
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log("fetchUserRepos: url:", url)
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`Error fetching repos: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch organization repos:', error);
    throw error;
  }
}