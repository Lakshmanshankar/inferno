import { getFirebase } from "../firebase";
import {
	GoogleAuthProvider,
	signInWithPopup,
	onAuthStateChanged,
	signOut,
	type User,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { createUserDocIfNotExists } from "./user";

export const loginWithGoogle = async () => {
	const { auth } = getFirebase();
	const provider = new GoogleAuthProvider();
	const res = await signInWithPopup(auth, provider);

	await createUserDocIfNotExists({
		uid: res.user.uid,
		displayName: res.user.displayName,
	});
};

export const logout = async () => {
	const { auth } = getFirebase();
	await signOut(auth);
};

export const getAuthUser = () => {
	const [user, setUser] = useState<User | null>(null);

	useEffect(() => {
		const { auth } = getFirebase();
		const unsub = onAuthStateChanged(auth, (firebaseUser) => {
			setUser(firebaseUser);
		});
		return () => unsub();
	}, []);

	return user;
};
