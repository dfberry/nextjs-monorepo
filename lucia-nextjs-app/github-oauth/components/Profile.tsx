export default function ProfileComponent(session: any) {

	return (
		<>
			<h1>Profile: {JSON.stringify(session)}!</h1>
		</>
	);
}