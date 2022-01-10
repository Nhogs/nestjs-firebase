import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import axios from "axios";
import { AppAsyncModule } from "../src/app.async.module";
import { AuthService } from "../../lib/service/auth.service";

describe("Firebase", () => {
  let module: TestingModule;
  let app: INestApplication;
  let authService: AuthService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [AppAsyncModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    authService = module.get<AuthService>(AuthService);
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
