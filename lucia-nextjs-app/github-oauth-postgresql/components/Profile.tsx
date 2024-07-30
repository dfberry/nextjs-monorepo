type ProfileComponentProps = {
	session: any;
	user: any;
	githubProfile: any;
};

export default function ProfileComponent({session, user, githubProfile}:ProfileComponentProps) {

	return (
		<>
			<h1>Db Session: </h1>
			<pre>{JSON.stringify(session, null, 2)}</pre>

			<h1>Db User: </h1>
			<pre>{JSON.stringify(user, null, 2)}</pre>

			<h1>GitHub User Profile: </h1>
			<pre>{JSON.stringify(githubProfile, null, 2)}</pre>
		</>
	);
}