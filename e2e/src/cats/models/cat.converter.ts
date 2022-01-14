import { Cat } from "../entities/cat.entity";

export const catConverter = {
  fromFirestore(snapshot, options?): Cat {
    const data = snapshot.data(options);
    return {
      name: data.name,
      age: data.age,
      breed: data.breed,
    };
  },
  toFirestore(modelObject, options?) {
    return {
      name: modelObject.name,
      age: modelObject.age,
      breed: modelObject.breed,
    };
  },
};
