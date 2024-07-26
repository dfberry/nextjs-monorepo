type ProfileComponentProps = {
	session: any;
};

export default function ProfileComponent({session}:ProfileComponentProps) {

	return (
		<>
			<h1>Profile: {JSON.stringify(session)}</h1>
		</>
	);
}