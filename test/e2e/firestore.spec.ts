import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { CatsService } from "../src/cats/cats.service";
import { AppModule } from "../src/app.module";
import axios from "axios";

describe("Firestore", () => {
  let server: Server;
  let app: INestApplication;
  let catsService: CatsService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    catsService = module.get<CatsService>(CatsService);
  });

  it(`should create and find one by id`, async () => {
    let cat = await catsService.create({
      name: "Nest",
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
        "name": "Nest",
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
        "name": "Nest",
      }
    `
    );
  });

  it(`should not find unknown id`, async () => {
    expect(await catsService.findOneById("UNKNOWN")).toMatchInlineSnapshot(
      `null`
    );
  });

  it(`should create and find all`, async () => {
    await catsService.create({
      name: "Snowflake",
      breed: "Maine coon",
      age: 3,
    });
    await catsService.create({
      name: "Jellybean",
      breed: "Birman",
      age: 1,
    });
    await catsService.create({
      name: "Marshmallow",
      breed: "Bengal",
      age: 4,
    });
    await catsService.create({
      name: "Minnie",
      breed: "Scottish Fold",
      age: 2,
    });
    await catsService.create({
      name: "Puffin",
      breed: "Siamese",
      age: 8,
    });

    expect({
      cats: (await catsService.findAll()).sort((a, b) =>
        b.name.localeCompare(a.name)
      ),
    }).toMatchInlineSnapshot(
      {
        cats: [
          {
            id: expect.any(String),
          },

          {
            id: expect.any(String),
          },

          {
            id: expect.any(String),
          },

          {
            id: expect.any(String),
          },

          {
            id: expect.any(String),
          },
        ],
      },
      `
      Object {
        "cats": Array [
          Object {
            "age": 3,
            "breed": "Maine coon",
            "id": Any<String>,
            "name": "Snowflake",
          },
          Object {
            "age": 8,
            "breed": "Siamese",
            "id": Any<String>,
            "name": "Puffin",
          },
          Object {
            "age": 2,
            "breed": "Scottish Fold",
            "id": Any<String>,
            "name": "Minnie",
          },
          Object {
            "age": 4,
            "breed": "Bengal",
            "id": Any<String>,
            "name": "Marshmallow",
          },
          Object {
            "age": 1,
            "breed": "Birman",
            "id": Any<String>,
            "name": "Jellybean",
          },
        ],
      }
    `
    );
  });

  it(`should set doc`, async () => {
    let cat = await catsService.update({
      id: "myId",
      name: "Nest",
      breed: "Maine coon",
      age: 5,
    });

    expect(cat).toMatchInlineSnapshot(`
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": "myId",
        "name": "Nest",
      }
    `);

    expect(await catsService.findOneById("myId")).toMatchInlineSnapshot(`
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": "myId",
        "name": "Nest",
      }
    `);

    cat = await catsService.update({
      id: "myId",
      name: "Snowflake",
      breed: "Maine coon",
      age: 5,
    });

    expect(cat).toMatchInlineSnapshot(`
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": "myId",
        "name": "Snowflake",
      }
    `);

    expect(await catsService.findOneById("myId")).toMatchInlineSnapshot(`
      Object {
        "age": 5,
        "breed": "Maine coon",
        "id": "myId",
        "name": "Snowflake",
      }
    `);
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
