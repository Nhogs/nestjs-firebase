import { Inject, Injectable } from "@nestjs/common";
import { FirebaseApp } from "firebase/app";
import {
  addDoc,
  collection,
  collectionGroup,
  CollectionReference,
  connectFirestoreEmulator,
  deleteDoc,
  doc,
  DocumentReference,
  DocumentSnapshot,
  FieldPath,
  getDoc,
  getDocs,
  getFirestore,
  query,
  Query,
  QueryConstraint,
  QuerySnapshot,
  runTransaction,
  setDoc,
  Transaction,
  UpdateData,
  updateDoc,
  where,
  WhereFilterOp,
  WithFieldValue,
  writeBatch,
} from "firebase/firestore";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../../firebase.constants";
import { FirebaseConfig } from "../../interface";

@Injectable()
export class FirestoreService {
  private readonly _firestore;
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
    @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: FirebaseConfig
  ) {
    console.log("FirestoreService constructor");
    this._firestore = getFirestore(this.firebaseApp);
    if (this.firebaseConfig.emulator?.firestore) {
      connectFirestoreEmulator(
        this._firestore,
        this.firebaseConfig.emulator.firestore.host || "localhost",
        this.firebaseConfig.emulator.firestore.port || 8080
      );
    }
  }

  /**
   * @example doc('users', 'alovelace');
   * @example doc('users/alovelace');
   */
  doc(path: string, ...pathSegments: string[]): DocumentReference {
    return doc(this._firestore, path, ...pathSegments);
  }

  /**
   * @example collection('users');
   */
  collection(path: string, ...pathSegments: string[]): CollectionReference {
    return collection(this._firestore, path, ...pathSegments);
  }

  collectionGroup(collectionId: string): Query {
    return collectionGroup(this._firestore, collectionId);
  }

  // Add data (https://firebase.google.com/docs/firestore/manage-data/add-data)

  /**
   * To create or overwrite a single document.
   * You must specify an ID for the document.
   *
   * @example await setDoc(doc(db, "cities", "new-city-id"), data)
   */
  setDoc<T>(
    reference: DocumentReference<T>,
    data: WithFieldValue<T>
  ): Promise<void> {
    return setDoc(reference, data);
  }

  /**
   * Add a new document to specified CollectionReference with the given data, assigning it a document ID automatically.
   */
  addDoc<T>(
    reference: CollectionReference<T>,
    data: WithFieldValue<T>
  ): Promise<DocumentReference<T>> {
    return addDoc(reference, data);
  }

  /**
   * Updates fields in the document referred to by the specified DocumentReference.
   * The update will fail if applied to a document that does not exist.
   */
  updateDoc<T>(
    reference: DocumentReference<T>,
    data: UpdateData<T>
  ): Promise<void> {
    return updateDoc(reference, data);
  }

  /**
   * Creates a write batch
   */
  writeBatch() {
    return writeBatch(this._firestore);
  }

  /**
   * Executes the given updateFunction and then attempts to commit the changes applied within the transaction.
   */
  runTransaction<T>(updateFunction: (transaction: Transaction) => Promise<T>) {
    return runTransaction(this._firestore, updateFunction);
  }

  // Delete

  /**
   * Deletes the document referred to by the specified DocumentReference.
   */
  deleteDoc<T>(reference: DocumentReference<T>): Promise<void> {
    return deleteDoc(reference);
  }

  // Read Data (https://firebase.google.com/docs/firestore/query-data/get-data)

  /**
   * Reads the document referred to by this DocumentReference.
   */
  getDoc<T>(reference: DocumentReference<T>): Promise<DocumentSnapshot<T>> {
    return getDoc<T>(reference);
  }

  /**
   * Executes the query and returns the results as a QuerySnapshot.
   */
  getDocs<T>(query: Query<T>): Promise<QuerySnapshot<T>> {
    return getDocs<T>(query);
  }

  query<T>(q: Query<T>, ...queryConstraints: QueryConstraint[]): Query<T> {
    return query<T>(q, ...queryConstraints);
  }

  where(
    fieldPath: string | FieldPath,
    opStr: WhereFilterOp,
    value: unknown
  ): QueryConstraint {
    return where(fieldPath, opStr, value);
  }
}
