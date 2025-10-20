import { useAuthUser } from "@inferno/firebase/auth";

export default function Auth() {
	const { user, logout, loginWithGoogle, loading } = useAuthUser();
	if (loading) return <p>Loading...</p>;
	if (!user) {
		return (
			<button type="button" onClick={loginWithGoogle} disabled={loading}>
				Login with Google
			</button>
		);
	}

	return (
		<div>
			<p>Logged in as {user.displayName}</p>
			<button type="button" onClick={logout} disabled={loading}>
				Logout
			</button>
		</div>
	);
}
