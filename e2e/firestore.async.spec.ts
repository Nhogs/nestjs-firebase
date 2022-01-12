import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { CatsService } from "./src/cats/cats.service";
import axios from "axios";
import { AppAsyncModule } from "./src/app.async.module";

describe("Firebase Firestore async", () => {
  let server: Server;
  let app: INestApplication;
  let catsService: CatsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppAsyncModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    catsService = module.get<CatsService>(CatsService);
  });

  it(`should create and find one by id`, async () => {
    let cat = await catsService.create({
      name: "Snowflake",
      breed: "Maine coon",
      age: 5,
    });

    expect(cat).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": Any<String>,
        "name": "Snowflake",
      }
    `
    );

    expect(await catsService.findOneById(cat.id)).toMatchInlineSnapshot(
      {
        id: expect.any(String),
      },
      `
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": Any<String>,
        "name": "Snowflake",
      }
    `
    );
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
