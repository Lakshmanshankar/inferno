import { loginWithGoogle, getAuthUser, logout } from "@inferno/firebase/auth";

export default function Auth() {
	const user = getAuthUser();
	if (!user) {
		return (
			<button type="button" onClick={loginWithGoogle}>
				Login with Google
			</button>
		);
	}

	return (
		<div>
			<p>Logged in as {user.displayName}</p>
			<button type="button" onClick={logout}>
				Logout
			</button>
		</div>
	);
}
