import useRequireAuth from '@/hooks/useRequireAuth';
import ProfileComponent from '@/components/Profile';
import GitHubService from '@/lib/github/github';

export default async function ProfilePage() {

	console.log("ProfilePage: Start");

	const {user, session, isAuthorized }= await useRequireAuth();
	if (!isAuthorized){
		console.log("ProfilePage: Not authorized");
		return null;
	} else {
		console.log("ProfilePage: Authorized");
	}

	const userProfile = await GitHubService.getGithHubUserBySessionResult({session, user});
	console.log(`ProfilePage userProfile: ${JSON.stringify(userProfile)}`);

	return (
		<>
			<ProfileComponent session={session} user={user} githubProfile={userProfile}/>
		</>
	);
}