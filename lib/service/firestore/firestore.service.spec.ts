import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { FirebaseModule, FirestoreService } from "../../index";
import { FirebaseEmulatorEnv } from "../../../e2e/firebase-emulator-env";
import axios from "axios";

class User {
  constructor(firstName: string, lastName: string, age: number) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
  }

  firstName: string;
  lastName: string;
  age: number;
}

class UserWithId extends User {
  constructor(data: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
  }) {
    super(data.firstName, data.lastName, data.age);
    this.id = data.id;
  }

  id: string;
}

const userConverter = {
  toFirestore: (user) => {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
      age: user.age,
    };
  },
  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options);
    return new User(data.firstName, data.lastName, data.age);
  },
};

const u1 = new User("fn1", "ln1", 1);
const u2 = new User("fn2", "ln2", 2);
const u3 = new User("fn3", "ln3", 3);

describe("Firebase Storage Service", () => {
  let server: Server;
  let app: INestApplication;
  let firestoreService: FirestoreService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          appName: "firestore-test",
          apiKey: FirebaseEmulatorEnv.apiKey,
          projectId: FirebaseEmulatorEnv.projectId,
          emulator: {
            firestore: {
              host: FirebaseEmulatorEnv.firestoreHost,
              port: FirebaseEmulatorEnv.firestorePort,
            },
          },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    firestoreService = module.get<FirestoreService>(FirestoreService);
  });

  afterAll(async () => {
    return await app.close();
  });

  it("should setDoc", async () => {
    const doc = firestoreService
      .doc("users", "1")
      .withConverter<User>(userConverter);

    await firestoreService.setDoc<User>(doc, u1);

    const snapshot = await firestoreService.getDoc(doc);
    expect(snapshot.data()).toMatchInlineSnapshot(`
      User {
        "age": 1,
        "firstName": "fn1",
        "lastName": "ln1",
      }
    `);
  });

  it("should addDoc", async () => {
    const users = firestoreService
      .collection("users")
      .withConverter<User>(userConverter);

    const doc = await firestoreService.addDoc<User>(users, u1);

    const snapshot = await firestoreService.getDoc(doc);
    expect(snapshot.data()).toMatchInlineSnapshot(`
      User {
        "age": 1,
        "firstName": "fn1",
        "lastName": "ln1",
      }
    `);
  });

  it("should updateDoc", async () => {
    const users = firestoreService
      .collection("users")
      .withConverter<User>(userConverter);

    const doc = await firestoreService.addDoc<User>(users, u1);

    await firestoreService.updateDoc<User>(doc, { age: 18 });

    const snapshot = await firestoreService.getDoc(doc);
    expect(snapshot.data()).toMatchInlineSnapshot(`
      User {
        "age": 18,
        "firstName": "fn1",
        "lastName": "ln1",
      }
    `);
  });

  it("should fail updateDoc on unexisting doc", async () => {
    const doc = firestoreService
      .doc("users", "1")
      .withConverter<User>(userConverter);
    return await firestoreService
      .updateDoc<User>(doc, { age: 18 })
      .catch((error) => {
        expect(error).toMatchInlineSnapshot(`
                  [FirebaseError: 5 NOT_FOUND: no entity to update: app: "dev~demo-nhogs-nestjs-firebase"
                  path <
                    Element {
                      type: "users"
                      name: "1"
                    }
                  >
                  ]
              `);
      });
  });

  it("should deleteDoc", async () => {
    const users = firestoreService
      .collection("users")
      .withConverter<User>(userConverter);

    const doc = await firestoreService.addDoc<User>(users, u1);

    await firestoreService.deleteDoc<User>(doc);

    const snapshot = await firestoreService.getDoc(doc);
    expect(snapshot.data()).toBeUndefined();
  });

  it("should writeBatch and getDocs", async () => {
    await firestoreService
      .writeBatch()
      .set(
        firestoreService.doc("users", "1").withConverter<User>(userConverter),
        u1
      )
      .set(
        firestoreService.doc("users", "2").withConverter<User>(userConverter),
        u2
      )
      .set(
        firestoreService.doc("users", "3").withConverter<User>(userConverter),
        u3
      )
      .commit();

    const users = firestoreService
      .collection("users")
      .withConverter<User>(userConverter);

    const querySnapshot = await firestoreService.getDocs(users);
    expect(
      querySnapshot.docs
        .map((value) => value.data())
        .sort((a, b) => b.firstName.localeCompare(a.firstName))
    ).toMatchInlineSnapshot(`
      Array [
        User {
          "age": 3,
          "firstName": "fn3",
          "lastName": "ln3",
        },
        User {
          "age": 2,
          "firstName": "fn2",
          "lastName": "ln2",
        },
        User {
          "age": 1,
          "firstName": "fn1",
          "lastName": "ln1",
        },
      ]
    `);
  });

  it("should run transaction and getDocs from collectionGroup", async () => {
    await firestoreService.runTransaction(async (transaction) => {
      transaction.set(
        firestoreService.doc("users", "1").withConverter<User>(userConverter),
        u1
      );
      transaction.set(
        firestoreService.doc("users", "2").withConverter<User>(userConverter),
        u2
      );
      transaction.set(
        firestoreService.doc("users", "3").withConverter<User>(userConverter),
        u3
      );
    });

    const users = firestoreService
      .collectionGroup("users")
      .withConverter<User>(userConverter);

    const querySnapshot = await firestoreService.getDocs(users);
    expect(
      querySnapshot.docs
        .map((value) => value.data())
        .sort((a, b) => b.firstName.localeCompare(a.firstName))
    ).toMatchInlineSnapshot(`
      Array [
        User {
          "age": 3,
          "firstName": "fn3",
          "lastName": "ln3",
        },
        User {
          "age": 2,
          "firstName": "fn2",
          "lastName": "ln2",
        },
        User {
          "age": 1,
          "firstName": "fn1",
          "lastName": "ln1",
        },
      ]
    `);
  });

  it("should query data", async () => {
    const users = firestoreService
      .collection("users")
      .withConverter<User>(userConverter);

    await firestoreService.addDoc<User>(users, u1);
    await firestoreService.addDoc<User>(users, u2);
    await firestoreService.addDoc<User>(users, u3);

    const q = firestoreService.query(
      users,
      firestoreService.where("age", ">", 2)
    );

    const querySnapshot = await firestoreService.getDocs(q);
    expect(querySnapshot.docs.map((value) => value.data()))
      .toMatchInlineSnapshot(`
      Array [
        User {
          "age": 3,
          "firstName": "fn3",
          "lastName": "ln3",
        },
      ]
    `);
  });

  it("should createDataWithIdConverter", async () => {
    const userWithIdConverter =
      firestoreService.createDataWithIdConverter<UserWithId>(UserWithId);

    const users = firestoreService
      .collection("usersWithId")
      .withConverter<UserWithId>(userWithIdConverter);

    const ref = await firestoreService.addDoc<UserWithId>(
      users,
      new UserWithId({ id: null, ...u1 })
    );

    const snapshot = await firestoreService.getDoc(ref);

    const data = snapshot.data();
    expect(data).toMatchInlineSnapshot(
      { id: expect.any(String) },
      `
      Object {
        "age": 1,
        "firstName": "fn1",
        "id": Any<String>,
        "lastName": "ln1",
      }
    `
    );

    expect(data.id).not.toBeNull();
  });

  afterEach(async () => {
    // Delete all documents
    return await axios
      .delete(
        `http://${FirebaseEmulatorEnv.firestoreHost}:${FirebaseEmulatorEnv.firestorePort}/emulator/v1/projects/${FirebaseEmulatorEnv.projectId}/databases/(default)/documents`
      )
      .then(function (response) {
        expect(response.status).toMatchInlineSnapshot(`200`);
      });
  });
});
