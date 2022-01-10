import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { AppModule } from "../src/app.module";
import axios from "axios";
import { AuthService } from "../../lib/service/auth.service";

describe("Firebase", () => {
  let server: Server;
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    authService = module.get<AuthService>(AuthService);
  });
  it(`should fail sign in user`, async () => {
    try {
      await authService.signInWithEmailAndPassword(
        "user.email@gmail.com",
        "userpassword"
      );
    } catch (error) {
      expect(error).toMatchInlineSnapshot(
        `[FirebaseError: Firebase: Error (auth/user-not-found).]`
      );
    }
  });

  it(`should create and sign in user`, async () => {
    const user = (
      await authService.createUserWithEmailAndPassword(
        "user.email@gmail.com",
        "userpassword"
      )
    ).user;

    expect(user.email).toMatchInlineSnapshot(`"user.email@gmail.com"`);

    const user2 = (
      await authService.signInWithEmailAndPassword(
        "user.email@gmail.com",
        "userpassword"
      )
    ).user;

    expect(user2.email).toMatchInlineSnapshot(`"user.email@gmail.com"`);
  });

  afterEach(async () => {
    return await axios
      .delete(
        "http://localhost:9099/emulator/v1/projects/demo-nhogs-nestjs-firebase/accounts"
      )
      .then(function (response) {
        expect(response.status).toMatchInlineSnapshot(`200`);
      });
  });

  afterAll(async () => {
    return await app.close();
  });
});
