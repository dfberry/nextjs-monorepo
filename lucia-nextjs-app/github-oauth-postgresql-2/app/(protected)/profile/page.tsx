import useRequireAuth from "@/hooks/useRequireAuth";

export default async function ProfilePage() {
	const { user, session, isAuthorized } = await useRequireAuth();
	return (
		<>
			<h1>Profile: {user?.username}!</h1>
			<p>Your user ID is {user?.id}.</p>
		</>
	);
}