import { Cat } from "./cat.model";
import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  DocumentData,
  SnapshotOptions,
  WithFieldValue,
  PartialWithFieldValue,
  SetOptions,
} from "@firebase/firestore";

class CatConverter implements FirestoreDataConverter<Cat> {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options?: SnapshotOptions
  ): Cat {
    const data = snapshot.data(options);

    return {
      id: snapshot.id,
      name: data.name,
      age: data.age,
      breed: data.breed,
    };
  }

  toFirestore(
    modelObject: WithFieldValue<Cat> | PartialWithFieldValue<Cat>,
    options?: SetOptions
  ): DocumentData {
    return {
      name: modelObject.name,
      age: modelObject.age,
      breed: modelObject.breed,
    };
  }
}

export default new CatConverter();