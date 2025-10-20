// firebase/helpers/firestore-adapter.ts
import {
	doc,
	getDoc,
	setDoc,
	updateDoc,
	deleteDoc,
	collection,
	addDoc,
	query,
	getDocs,
	onSnapshot,
	type Unsubscribe,
	type QueryConstraint,
	serverTimestamp,
	type Timestamp,
} from "firebase/firestore";
import { getFirebase } from "./firebase";

export interface FirestoreDocument {
	id: string;
	createdAt?: Timestamp | number;
	updatedAt?: Timestamp | number;
}

export class FirestoreAdapter<T extends FirestoreDocument> {
	private collectionName: string;

	constructor(collectionName: string) {
		this.collectionName = collectionName;
	}

	/**
	 * Create a document with auto-generated ID
	 */
	async create(data: Omit<T, "id">): Promise<string> {
		const { db } = getFirebase();
		const colRef = collection(db, this.collectionName);

		const docData = {
			...data,
			createdAt: serverTimestamp(),
			updatedAt: serverTimestamp(),
		};

		const docRef = await addDoc(colRef, docData);
		return docRef.id;
	}

	/**
	 * Set a document with specific ID (creates or overwrites)
	 */
	async set(id: string, data: Omit<T, "id">, merge = false): Promise<void> {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);

		const docData = {
			...data,
			...(merge
				? { updatedAt: serverTimestamp() }
				: {
						createdAt: serverTimestamp(),
						updatedAt: serverTimestamp(),
					}),
		};

		await setDoc(docRef, docData, { merge });
	}

	/**
	 * Get a single document by ID
	 */
	async get(id: string): Promise<T | null> {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);
		const docSnap = await getDoc(docRef);

		if (!docSnap.exists()) {
			return null;
		}

		return {
			id: docSnap.id,
			...docSnap.data(),
		} as T;
	}

	/**
	 * Update a document (partial update)
	 */
	async update(id: string, data: Partial<Omit<T, "id">>): Promise<void> {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);

		await updateDoc(docRef, {
			...data,
			updatedAt: serverTimestamp(),
		});
	}

	/**
	 * Delete a document
	 */
	async delete(id: string): Promise<void> {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);
		await deleteDoc(docRef);
	}

	/**
	 * Query documents with conditions
	 */
	async query(...constraints: QueryConstraint[]): Promise<T[]> {
		const { db } = getFirebase();
		const colRef = collection(db, this.collectionName);
		const q = query(colRef, ...constraints);
		const querySnapshot = await getDocs(q);

		return querySnapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		})) as T[];
	}

	/**
	 * Subscribe to a single document
	 */
	subscribe(id: string, callback: (data: T | null) => void): Unsubscribe {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);

		return onSnapshot(docRef, (docSnap) => {
			if (docSnap.exists()) {
				callback({
					id: docSnap.id,
					...docSnap.data(),
				} as T);
			} else {
				callback(null);
			}
		});
	}

	/**
	 * Subscribe to a collection query
	 */
	subscribeToQuery(
		callback: (data: T[]) => void,
		...constraints: QueryConstraint[]
	): Unsubscribe {
		const { db } = getFirebase();
		const colRef = collection(db, this.collectionName);
		const q = query(colRef, ...constraints);

		return onSnapshot(q, (querySnapshot) => {
			const docs = querySnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			})) as T[];
			callback(docs);
		});
	}

	/**
	 * Check if document exists
	 */
	async exists(id: string): Promise<boolean> {
		const { db } = getFirebase();
		const docRef = doc(db, this.collectionName, id);
		const docSnap = await getDoc(docRef);
		return docSnap.exists();
	}

	/**
	 * Batch operations helper
	 */
	async batchSet(
		items: Array<{ id: string; data: Omit<T, "id"> }>,
	): Promise<void> {
		const promises = items.map((item) =>
			this.set(item.id, item.data, true),
		);
		await Promise.all(promises);
	}
}
