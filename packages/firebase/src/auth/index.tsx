export * from "./user";

import { getFirebase } from "../firebase";
import {
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
	type User,
} from "firebase/auth";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { createUserDocIfNotExists } from "./user";

type AuthContextType = {
	user: User | null;
	loading: boolean;
	loginWithGoogle: () => Promise<void>;
	logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const { auth } = getFirebase();
		const unsub = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
			setLoading(false);
		});
		return () => unsub();
	}, []);

	const loginWithGoogle = async () => {
		const { auth } = getFirebase();
		const provider = new GoogleAuthProvider();
		const res = await signInWithPopup(auth, provider);

		await createUserDocIfNotExists({
			uid: res.user.uid,
			displayName: res.user.displayName,
		});
	};

	const logout = async () => {
		const { auth } = getFirebase();
		await signOut(auth);
	};

	return (
		<AuthContext value={{ user, loading, loginWithGoogle, logout }}>
			{children}
		</AuthContext>
	);
}

export function useAuthUser() {
	const context = use(AuthContext);
	if (!context) {
		throw new Error("useAuthUser must be used within AuthProvider");
	}
	return context;
}
