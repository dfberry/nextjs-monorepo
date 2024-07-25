type ProfileComponentProps = {
	session: any;
	gitHubUser: any;
};

export default function ProfileComponent({session, gitHubUser}:ProfileComponentProps) {

	return (
		<>
			<h1>Profile: {JSON.stringify(session)}</h1>
			<h1>GitHub User: {JSON.stringify(gitHubUser)}</h1>
		</>
	);
}