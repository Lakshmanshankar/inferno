import { COLLECTION } from "../config";
import { getFirebase } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export const createUserDocIfNotExists = async (user: {
	uid: string;
	displayName: string | null;
}) => {
	const { db } = getFirebase();
	const userRef = doc(db, COLLECTION.USERS, user.uid);

	await setDoc(
		userRef,
		{
			uid: user.uid,
			username: user.displayName || "Anonymous",
			createdAt: Date.now(),
		},
		{ merge: true },
	);
};
