import * as request from "supertest";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { FirebaseModule } from "../lib";
import { CatsModule } from "./src/cats/cats.module";
import { DynamicModule, INestApplication } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { cats } from "./test-fixtures";
import axios from "axios";

const testCase: [string, DynamicModule][] = [
  [
    "forRoot",
    FirebaseModule.forRoot({
      apiKey: "API-KEY-FOR-TEST",
      projectId: "demo-nhogs-nestjs-firebase",
      storageBucket: "default-bucket",
      emulator: {
        authUrl: "http://localhost:9099",
        firestore: {
          host: "localhost",
          port: 8080,
        },
        storage: {
          host: "localhost",
          port: 9199,
        },
      },
    }),
  ],
  // [
  //   "forRootAsync",
  //   FirebaseModule.forRootAsync({
  //     useFactory: (): FirebaseConfig => ({
  //       apiKey: process.env.FIREBASE_APIKEY,
  //       projectId: process.env.FIREBASE_PROJECT_ID,
  //       storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  //       emulator: {
  //         authUrl: "http://localhost:9099",
  //         firestore: {
  //           host: "localhost",
  //           port: 8080,
  //         },
  //         storage: {
  //           host: "localhost",
  //           port: 9199,
  //         },
  //       },
  //     }),
  //     global: true,
  //   }),
  // ],
];

describe.each(testCase)("Module - %s", (_, dynamicModule) => {
  let server: Server;
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        dynamicModule,
        CatsModule,
        ConfigModule.forRoot({
          envFilePath: "./e2e/src/.test.env",
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should /POST & /GET cat`, (done) => {
    const httpServer = app.getHttpServer();

    request(httpServer)
      .post("/cats")
      .send(cats.snowflake)
      .expect(201)
      .then((res) => {
        const createdId = res.text;

        request(httpServer)
          .get("/cats/id/" + createdId)
          .expect(200)
          .then((res) => {
            expect(res.body).toMatchInlineSnapshot(
              { _id: expect.any(String) },
              `
              Object {
                "_id": Any<String>,
                "age": 3,
                "breed": "Maine coon",
                "name": "Snowflake",
                "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fsnowflake.jpg?alt=media&token=1f6f9332-150b-4a91-80e7-8732ac84265e",
              }
            `
            );
            done();
          });
      });
  });

  it(`should /POST all & /GET all`, (done) => {
    const httpServer = app.getHttpServer();

    request(httpServer)
      .post("/cats/all")
      .send({ cats: Object.values(cats) })
      .expect(201)
      .then(() => {
        request(httpServer)
          .get("/cats/all")
          .expect(200)
          .then((res) => {
            expect(res.body).toMatchInlineSnapshot(`
              Array [
                Object {
                  "_id": "jellybean",
                  "age": 1,
                  "breed": "Birman",
                  "name": "Jellybean",
                  "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fjellybean.jpg?alt=media&token=e56ec9d7-af49-4f67-af8c-e5cbf3ecfee9",
                },
                Object {
                  "_id": "marshmallow",
                  "age": 4,
                  "breed": "Bengal",
                  "name": "Marshmallow",
                  "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fmarshmallow.jpg?alt=media&token=7a1dd7bf-7ca0-4f49-a56b-e8ef66dc985a",
                },
                Object {
                  "_id": "minnie",
                  "age": 2,
                  "breed": "Scottish Fold",
                  "name": "Minnie",
                  "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fminnie.jpg?alt=media&token=d6d2d862-1739-47ef-82ec-7fdfee938766",
                },
                Object {
                  "_id": "puffin",
                  "age": 8,
                  "breed": "Siamese",
                  "name": "Puffin",
                  "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fpuffin.jpg?alt=media&token=75095f8f-e184-44d9-bcbf-be1f467bd5e9",
                },
                Object {
                  "_id": "snowflake",
                  "age": 3,
                  "breed": "Maine coon",
                  "name": "Snowflake",
                  "url": "http://localhost:9199/v0/b/default-bucket/o/cats%2Fsnowflake.jpg?alt=media&token=1f6f9332-150b-4a91-80e7-8732ac84265e",
                },
              ]
            `);
            done();
          });
      });
  });

  afterEach(async () => {
    return await axios
      .delete(
        "http://localhost:8080/emulator/v1/projects/demo-nhogs-nestjs-firebase/databases/(default)/documents"
      )
      .then(function (response) {
        expect(response.status).toMatchInlineSnapshot(`200`);
      });
  });

  afterAll(async () => {
    return await app.close();
  });
});
