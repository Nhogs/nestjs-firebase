import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import axios from "axios";
import { AuthService, FirebaseModule } from "../../index";
import { FirebaseTestEnv } from "../../../e2e/firebase-test-env";

describe("Firebase Auth Service", () => {
  let server: Server;
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRoot({
          appName: "auth-test",
          apiKey: FirebaseTestEnv.apiKey,
          projectId: FirebaseTestEnv.projectId,
          emulator: {
            authUrl: "http://localhost:9099",
          },
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
    authService = module.get<AuthService>(AuthService);
  });

  afterAll(async () => {
    return await app.close();
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
});
