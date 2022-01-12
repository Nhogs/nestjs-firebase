import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { FirebaseModule, StorageService } from "../../index";

describe("Firebase Storage", () => {
  const STORAGE_HOST = "localhost";
  const STORAGE_PORT = 9199;
  const STORAGE_BUCKET = "default-bucket";

  let server: Server;
  let app: INestApplication;
  let storageService: StorageService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          apiKey: "API-KEY-FOR-TEST",
          projectId: "demo-nhogs-nestjs-firebase",
          storageBucket: STORAGE_BUCKET,
          emulator: {
            storage: {
              host: STORAGE_HOST,
              port: STORAGE_PORT,
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

  // Create a Reference

  it("should create a reference on storage root", () => {
    const storageReference = storageService.ref();

    expect(storageReference.toString()).toMatchInlineSnapshot(
      `"gs://default-bucket/"`
    );
    expect(storageReference.bucket).toMatchInlineSnapshot(`"default-bucket"`);
    expect(storageReference.name).toMatchInlineSnapshot(`""`);
  });

  it("should create a reference on a folder", () => {
    const storageReference = storageService.ref("cats");
    expect(storageReference.toString()).toMatchInlineSnapshot(
      `"gs://default-bucket/cats"`
    );

    expect(storageReference.bucket).toMatchInlineSnapshot(`"default-bucket"`);
    expect(storageReference.name).toMatchInlineSnapshot(`"cats"`);
  });

  // Upload Files

  it(`should upload uint8Array`, async () => {
    const fileName = Date.now().toString() + ".png";
    const uint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 8,
      0, 0, 0, 8, 8, 2, 0, 0, 0, 75, 109, 41, 220, 0, 0, 0, 34, 73, 68, 65, 84,
      8, 215, 99, 120, 173, 168, 135, 21, 49, 0, 241, 255, 15, 90, 104, 8, 33,
      129, 83, 7, 97, 163, 136, 214, 129, 93, 2, 43, 2, 0, 181, 31, 90, 179,
      225, 252, 176, 37, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);

    await storageService
      .uploadBytes(fileName, uint8Array, {
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
      `http://${STORAGE_HOST}:${STORAGE_PORT}/v0/b/default-bucket/o/${fileName}?alt=media&token=custom-token-for-test`
    );
  });

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

  it(`should upload string`, async () => {
    const name = Date.now().toString();
    await storageService
      .uploadString(name + ".txt", "text content")
      .then((snapshot) => {
        expect(snapshot.metadata.contentType).toMatchInlineSnapshot(
          `"application/octet-stream"`
        );
      });

    const downloadUrl = await storageService.getDownloadURL(name + ".txt");
    expect(downloadUrl.substring(0, downloadUrl.lastIndexOf("="))).toEqual(
      "http://localhost:9199/v0/b/default-bucket/o/" +
        name +
        ".txt?alt=media&token"
    );
  });

  afterAll(async () => {
    return await app.close();
  });
});
