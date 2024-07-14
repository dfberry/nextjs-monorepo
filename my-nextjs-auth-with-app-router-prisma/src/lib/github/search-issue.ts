
export type GitHubIssue = {
    url: string;
    repository_url: string;
    labels_url: string;
    comments_url: string;
    events_url: string;
    html_url: string;
    id: number;
    node_id: string;
    number: number;
    title: string;
    user: {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    };
    labels: Array<{
        id: number;
        node_id: string;
        url: string;
        name: string;
        color: string;
        default: boolean;
        description: string;
    }>;
    state: string;
    locked: boolean;
    assignee: null | {
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    };
    assignees: Array<{
        login: string;
        id: number;
        node_id: string;
        avatar_url: string;
        gravatar_id: string;
        url: string;
        html_url: string;
        followers_url: string;
        following_url: string;
        gists_url: string;
        starred_url: string;
        subscriptions_url: string;
        organizations_url: string;
        repos_url: string;
        events_url: string;
        received_events_url: string;
        type: string;
        site_admin: boolean;
    }>;
    milestone: null | {
        url: string;
        html_url: string;
        labels_url: string;
        id: number;
        node_id: string;
        number: number;
        state: string;
        title: string;
        description: string;
        creator: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
        };
        open_issues: number;
        closed_issues: number;
        created_at: string;
        updated_at: string;
        closed_at: string;
        due_on: string;
    };
    comments: number;
    created_at: string;
    updated_at: string;
    closed_at: string;
    author_association: string;
    active_lock_reason: string;
    body: string;
    performed_via_github_app: null | {
        id: number;
        node_id: string;
        owner: {
            login: string;
            id: number;
            node_id: string;
            avatar_url: string;
            gravatar_id: string;
            url: string;
            html_url: string;
            followers_url: string;
            following_url: string;
            gists_url: string;
            starred_url: string;
            subscriptions_url: string;
            organizations_url: string;
            repos_url: string;
            events_url: string;
            received_events_url: string;
            type: string;
            site_admin: boolean;
        };
        name: string;
        slug: string;
        external_url: string;
        html_url: string;
        created_at: string;
        updated_at: string;
    };
};
export type GitHubIssueSearchResult = {
    total_count: number;
    incomplete_results: boolean;
    items: GitHubIssue[];
};
export type GitHubIssueResult = GitHubIssue[];
export interface SearchResults {
    assigneeSearch: GitHubIssue[];
    mentionsSearch: GitHubIssue[];
    authorSearch: GitHubIssue[];
    involvesSearch: GitHubIssue[];
}

export async function fetchSearchIssues(user: string, token: string): Promise<SearchResults> {
    const currentDate = new Date();

    const startOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1).toISOString().split('T')[0];
    const endOfPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).toISOString().split('T')[0];
    const startOfCurrentYear = new Date(currentDate.getFullYear(), 0, 1).toISOString().split('T')[0];
    const endOfCurrentYear = new Date(currentDate.getFullYear(), 11, 31).toISOString().split('T')[0];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];

    const beginDate = startOfCurrentYear;
    const endDate = endOfCurrentYear;

    const urls = {
        assigneeSearch: `https://api.github.com/search/issues?q=assignee:${user}+created:${beginDate}..${endDate}`,
        mentionsSearch: `https://api.github.com/search/issues?q=mentions:${user}+created:${beginDate}..${endDate}`,
        authorSearch: `https://api.github.com/search/issues?q=author:${user}+created:${beginDate}..${endDate}`,
        involvesSearch: `https://api.github.com/search/issues?q=involves:${user}+created:${beginDate}..${endDate}`
    };

    console.log(urls)

    try {
        const fetchPromises = Object.entries(urls).map(async ([key, url]) => {
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/vnd.github+json',
                    'Authorization': `Bearer ${token}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });

            if (!response.ok) {
                throw new Error(`Error fetching data for ${key}: ${response.statusText}`);
            }

            const data = await response.json();
            return { [key]: data.items as GitHubIssue[] }; // Assuming the GitHub API response has an items array
        });

        const results = await Promise.all(fetchPromises);
        return results.reduce((acc, result) => ({ ...acc, ...result }), {}) as unknown as SearchResults;

    } catch (error) {
        console.error('Failed to fetch search results:', error);
        throw error;
    }
}