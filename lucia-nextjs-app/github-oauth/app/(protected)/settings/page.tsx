import useRequireAuth from '@/hooks/useRequireAuth';
import ProfileComponent from '@/components/Profile';
export default async function ProfilePage() {
	const session = await useRequireAuth();

	return (
		<>
			<ProfileComponent session={session} />
		</>
	);
}