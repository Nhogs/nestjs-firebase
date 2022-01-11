import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { AppModule } from "../src/app.module";
import { StorageService } from "../../lib";

describe("Firebase Storage", () => {
  let server: Server;
  let app: INestApplication;
  let storageService: StorageService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    storageService = module.get<StorageService>(StorageService);
  });

  it(`should fail unknown path`, async () => {
    await storageService
      .getDownloadURL("unknown")
      .catch((error) => {
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

  it(`should upload uint8Array`, async () => {
    const name = Date.now().toString();
    const uint8Array = new Uint8Array([
      137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 8,
      0, 0, 0, 8, 8, 2, 0, 0, 0, 75, 109, 41, 220, 0, 0, 0, 34, 73, 68, 65, 84,
      8, 215, 99, 120, 173, 168, 135, 21, 49, 0, 241, 255, 15, 90, 104, 8, 33,
      129, 83, 7, 97, 163, 136, 214, 129, 93, 2, 43, 2, 0, 181, 31, 90, 179,
      225, 252, 176, 37, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
    ]);

    await storageService
      .uploadBytes(name + ".png", uint8Array, {
        contentType: "image/png",
      })
      .then((snapshot) => {
        expect(snapshot.metadata.contentType).toMatchInlineSnapshot(
          `"image/png"`
        );
      });

    const downloadUrl = await storageService.getDownloadURL(name + ".png");
    expect(downloadUrl.substring(0, downloadUrl.lastIndexOf("="))).toEqual(
      "http://localhost:9199/v0/b/default-bucket/o/" +
        name +
        ".png?alt=media&token"
    );
  });

  afterAll(async () => {
    return await app.close();
  });
});
