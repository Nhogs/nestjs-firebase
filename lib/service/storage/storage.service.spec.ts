import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { FirebaseModule, StorageService } from "../../index";
import { FirebaseTestEnv } from "../../../e2e/firebase-test-env";

describe("Firebase Storage", () => {
  let server: Server;
  let app: INestApplication;
  let storageService: StorageService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          apiKey: FirebaseTestEnv.apiKey,
          projectId: FirebaseTestEnv.projectId,
          storageBucket: FirebaseTestEnv.storageBucket,
          emulator: {
            storage: {
              host: FirebaseTestEnv.storageHost,
              port: FirebaseTestEnv.storagePort,
            },
          },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    storageService = module.get<StorageService>(StorageService);
  });

  const uint8ArrayPNG = new Uint8Array([
    137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 8, 0,
    0, 0, 8, 8, 2, 0, 0, 0, 75, 109, 41, 220, 0, 0, 0, 34, 73, 68, 65, 84, 8,
    215, 99, 120, 173, 168, 135, 21, 49, 0, 241, 255, 15, 90, 104, 8, 33, 129,
    83, 7, 97, 163, 136, 214, 129, 93, 2, 43, 2, 0, 181, 31, 90, 179, 225, 252,
    176, 37, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
  ]);

  // Create a Reference

  it("should create a reference on storage root", () => {
    const storageReference = storageService.ref();

    expect(storageReference.toString()).toEqual(
      `gs://${FirebaseTestEnv.storageBucket}/`
    );
    expect(storageReference.bucket).toEqual(FirebaseTestEnv.storageBucket);
    expect(storageReference.name).toMatchInlineSnapshot(`""`);
  });

  it("should create a reference on a folder", () => {
    const storageReference = storageService.ref("cats");
    expect(storageReference.toString()).toEqual(
      `gs://${FirebaseTestEnv.storageBucket}/cats`
    );
    expect(storageReference.name).toMatchInlineSnapshot(`"cats"`);
  });

  // Upload Files

  it(`should upload uint8Array`, async () => {
    const fileName = Date.now().toString() + ".png";

    await storageService
      .uploadBytes(fileName, uint8ArrayPNG, {
        contentType: "image/png",
        customMetadata: {
          firebaseStorageDownloadTokens: "custom-token-for-test",
        },
      })
      .then((snapshot) => {
        expect(snapshot.metadata.contentType).toMatchInlineSnapshot(
          `"image/png"`
        );
      });

    const downloadUrl = await storageService.getDownloadURL(fileName);

    expect(downloadUrl).toEqual(
      `http://${FirebaseTestEnv.storageHost}:${FirebaseTestEnv.storagePort}/v0/b/default-bucket/o/${fileName}?alt=media&token=custom-token-for-test`
    );
  });

  it(`should upload string`, async () => {
    const fileName = Date.now().toString() + ".txt";
    await storageService
      .uploadString(fileName, "text content", "raw", {
        contentType: "text/plain",
        customMetadata: {
          firebaseStorageDownloadTokens: "custom-token-for-test",
        },
      })
      .then((snapshot) => {
        expect(snapshot.metadata.contentType).toMatchInlineSnapshot(
          `"text/plain"`
        );
      });

    const downloadUrl = await storageService.getDownloadURL(fileName);
    expect(downloadUrl).toEqual(
      `http://${FirebaseTestEnv.storageHost}:${FirebaseTestEnv.storagePort}/v0/b/${FirebaseTestEnv.storageBucket}/o/${fileName}?alt=media&token=custom-token-for-test`
    );
  });

  it(`should upload Bytes Resumable`, (done) => {
    const fileName = Date.now().toString() + ".png";

    let strEvents = "";
    let sep = "";

    const uploadTask = storageService.uploadBytesResumable(
      fileName,
      uint8ArrayPNG,
      {
        contentType: "image/png",
        customMetadata: {
          firebaseStorageDownloadTokens: "custom-token-for-test",
        },
      }
    );

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100 + "%";

        strEvents += sep + snapshot.state + " - " + progress;
        sep = "\n";
      },
      () => {},
      () => {
        expect(strEvents).toMatchInlineSnapshot(`
          "running - 0%
          running - 100%"
        `);
        done();
      }
    );
  });

  // Download Files
  it(`should fail unknown path`, async () => {
    await storageService.getDownloadURL("unknown").catch((error) => {
      expect(error).toMatchInlineSnapshot(
        `[FirebaseError: Firebase Storage: Object 'unknown' does not exist. (storage/object-not-found)]`
      );
    });
  });

  it(`should getDownloadURL (from emulator imported dataset)`, async () => {
    expect(
      await storageService.getDownloadURL("cats/snowflake.jpg")
    ).toMatchInlineSnapshot(
      `"http://localhost:9199/v0/b/default-bucket/o/cats%2Fsnowflake.jpg?alt=media&token=1f6f9332-150b-4a91-80e7-8732ac84265e"`
    );
  });

  it(`should getBytes`, async () => {
    const buffer = await storageService.getBytes("cats/snowflake.jpg");
    expect(buffer.byteLength).toEqual(101863);
  });

  it(`should getStream`, async () => {
    const fileName = Date.now().toString() + ".txt";
    await storageService.uploadString(fileName, "text content", "raw", {
      contentType: "text/plain",
    });

    const stream = await storageService.getStream(fileName);

    const chunks = [];

    stream.on("data", function (chunk) {
      chunks.push(chunk);
    });

    return await new Promise((fulfill) => stream.on("end", fulfill)).then(
      () => {
        expect(Buffer.concat(chunks).toString()).toMatchInlineSnapshot(
          `"text content"`
        );
      }
    );
  });

  it(`should getMetadata`, async () => {
    const metadata = await storageService.getMetadata("cats/snowflake.jpg");
    const keys = ["contentType", "fullPath", "name", "size", "type"];

    const filtered = keys.reduce(
      (obj, key) => ({ ...obj, [key]: metadata[key] }),
      {}
    );
    expect(filtered).toMatchInlineSnapshot(`
      Object {
        "contentType": "image/jpeg",
        "fullPath": "cats/snowflake.jpg",
        "name": "snowflake.jpg",
        "size": 101863,
        "type": "file",
      }
    `);
  });

  it(`should updateMetadata`, async () => {
    const fileName = Date.now().toString() + ".txt";
    await storageService.uploadString(fileName, "text content", "raw", {
      contentType: "text/plain",
    });

    const metadataBefore = await storageService.getMetadata(fileName);
    const keys = ["contentLanguage", "contentType", "size", "type"];

    const filteredBefore = keys.reduce(
      (obj, key) => ({ ...obj, [key]: metadataBefore[key] }),
      {}
    );
    expect(filteredBefore).toMatchInlineSnapshot(`
      Object {
        "contentLanguage": undefined,
        "contentType": "text/plain",
        "size": 12,
        "type": "file",
      }
    `);

    await storageService.updateMetadata(fileName, { contentLanguage: "en-US" });
    const metadataAfter = await storageService.getMetadata(fileName);
    const filteredAfter = keys.reduce(
      (obj, key) => ({ ...obj, [key]: metadataAfter[key] }),
      {}
    );
    expect(filteredAfter).toMatchInlineSnapshot(`
      Object {
        "contentLanguage": "en-US",
        "contentType": "text/plain",
        "size": 12,
        "type": "file",
      }
    `);
  });

  // Delete Files

  it(`should deleteObject`, async () => {
    const fileName = Date.now().toString() + ".txt";
    await storageService.uploadString(fileName, "text content", "raw", {
      contentType: "text/plain",
      customMetadata: {
        firebaseStorageDownloadTokens: "custom-token-for-test",
      },
    });

    expect(await storageService.getDownloadURL(fileName)).toEqual(
      `http://${FirebaseTestEnv.storageHost}:${FirebaseTestEnv.storagePort}/v0/b/${FirebaseTestEnv.storageBucket}/o/${fileName}?alt=media&token=custom-token-for-test`
    );

    await storageService.deleteObject(fileName);

    await storageService.getDownloadURL(fileName).catch((error) => {
      expect(error).toMatchInlineSnapshot(
        `[FirebaseError: Firebase Storage: Object '${fileName}' does not exist. (storage/object-not-found)]`
      );
    });
  });

  it(`should ListAll`, async () => {
    expect((await storageService.listAll("cats")).items.map((ref) => ref.name))
      .toMatchInlineSnapshot(`
      Array [
        "jellybean.jpg",
        "marshmallow.jpg",
        "minnie.jpg",
        "puffin.jpg",
        "snowflake.jpg",
      ]
    `);
  });

  it(`should ListAll`, async () => {
    const firstPage = await storageService.list("cats", { maxResults: 3 });

    expect(firstPage.items.map((ref) => ref.name)).toMatchInlineSnapshot(`
      Array [
        "jellybean.jpg",
        "marshmallow.jpg",
        "minnie.jpg",
      ]
    `);
    expect(firstPage.nextPageToken).toMatchInlineSnapshot(`"cats/puffin.jpg"`);

    const secondPage = await storageService.list("cats", {
      maxResults: 3,
      pageToken: firstPage.nextPageToken,
    });

    expect(secondPage.items.map((ref) => ref.name)).toMatchInlineSnapshot(`
      Array [
        "puffin.jpg",
        "snowflake.jpg",
      ]
    `);
    expect(secondPage.nextPageToken).toMatchInlineSnapshot(`undefined`);
  });

  afterAll(async () => {
    return await app.close();
  });
});
