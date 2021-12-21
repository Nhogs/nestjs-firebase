import { Inject, Injectable, Logger } from "@nestjs/common";
import { FirebaseApp } from "@firebase/app";
import {
  collection as firebaseCollection,
  CollectionReference,
  doc,
  FirestoreDataConverter,
  getDoc,
  getDocs,
  getFirestore,
} from "@firebase/firestore";
import { FIREBASE_APP } from "../firebase.constants";

@Injectable()
export class FirestoreService {
  constructor(
    @Inject(FIREBASE_APP) private readonly firebaseApp: FirebaseApp
  ) {}
  private readonly _logger = new Logger(FirestoreService.name);
  private db = getFirestore(this.firebaseApp);

  async getDocs<T>(
    collection: string,
    converter: FirestoreDataConverter<T>
  ): Promise<T[]> {
    this._logger.debug("getDocs(" + collection + ")");

    const collectionRef: CollectionReference<T> = firebaseCollection(
      this.db,
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
    this._logger.debug(
      "getDoc(" + JSON.stringify({ collection, id, converter }) + ")"
    );

    const docRef = doc(this.db, collection, id).withConverter<T>(converter);
    const documentSnapshot = await getDoc<T>(docRef);

    if (documentSnapshot.exists()) {
      return documentSnapshot.data();
    } else {
      return null;
    }
  }
}
