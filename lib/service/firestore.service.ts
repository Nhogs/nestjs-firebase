import { Inject, Injectable, Logger } from "@nestjs/common";
import { FirebaseApp } from "@firebase/app";
import {
  addDoc,
  collection as firebaseCollection,
  CollectionReference,
  connectFirestoreEmulator,
  doc,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "@firebase/firestore";
import { FIREBASE_APP, FIREBASE_CONFIG } from "../firebase.constants";
import { FirebaseConfig } from "../interface";

@Injectable()
export class FirestoreService {
  private readonly _logger = new Logger(FirestoreService.name);
  private readonly _db;
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp,
    @Inject(FIREBASE_CONFIG) private readonly firebaseConfig: FirebaseConfig
  ) {
    this._db = getFirestore(this.firebaseApp);
    if (this.firebaseConfig.emulator) {
      connectFirestoreEmulator(this._db, "localhost", 8080);
    }
  }

  async getDocs<T>(
    collection: string,
    converter: FirestoreDataConverter<T>
  ): Promise<T[]> {
    const collectionRef: CollectionReference<T> = firebaseCollection(
      this._db,
      collection
    ).withConverter<T>(converter);

    const querySnapshot = await getDocs<T>(collectionRef);

    const results: T[] = [];
    querySnapshot.forEach((result) => {
      if (result.exists()) {
        results.push(result.data());
      }
    });

    return results;
  }

  async getDoc<T>(
    collection: string,
    id: string,
    converter: FirestoreDataConverter<T>
  ): Promise<T | null> {
    const ref = doc(this._db, collection, id).withConverter<T>(converter);
    const snapshot = await getDoc<T>(ref);

    if (snapshot.exists()) {
      return snapshot.data();
    } else {
      return null;
    }
  }

  async setDoc<T>(
    path,
    id: string,
    data: T,
    converter?: FirestoreDataConverter<T>
  ): Promise<T> {
    const ref = doc(this._db, path, id).withConverter<T>(converter);
    await setDoc(ref, data);
    const snapshot = await getDoc<T>(ref);

    return snapshot.data();
  }

  async addDoc<T>(
    path,
    data: T,
    converter?: FirestoreDataConverter<T>
  ): Promise<T> {
    const dataDocRef = await addDoc(firebaseCollection(this._db, path), data);
    const ref = dataDocRef.withConverter<T>(converter);
    const snapshot = await getDoc<T>(ref);

    return snapshot.data();
  }
}
