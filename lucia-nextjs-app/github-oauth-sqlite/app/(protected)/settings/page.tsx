import useRequireAuth from '@/hooks/useRequireAuth';
import ProfileComponent from '@/components/Profile';
import { getTokenByUserId } from "@/lib/db";

export default async function ProfilePage() {
	const session = await useRequireAuth();
	let gitHubUser = null;

	if(session?.user?.githubId) {
		const decryptedAccessToken = getTokenByUserId(session.user.id);
		console.log("getTokenByUserId accessToken", decryptedAccessToken);

		if(decryptedAccessToken){
			// Fetch user data from GitHub
			const response = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `Bearer ${decryptedAccessToken}`
				}
			});
			if(response.ok){
				gitHubUser = await response.json();
				console.log("gitHubUser", gitHubUser);
			}
		}
	}


	return (
		<>
			<ProfileComponent session={session} gitHubUser={gitHubUser}/>
		</>
	);
}