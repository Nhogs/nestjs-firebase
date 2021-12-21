import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Server } from "http";
import { FirebaseModule } from "../../lib/firebase.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FirebaseConfig } from "../../lib";

describe("Firebase", () => {
  let server: Server;
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FirebaseModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService): FirebaseConfig => ({
            apiKey: configService.get("FIREBASE_API_KEY"),
            authDomain: configService.get("FIREBASE_AUTH_DOMAIN"),
            projectId: configService.get("FIREBASE_PROJECT_ID"),
          }),
        }),
      ],
    }).compile();

    app = module.createNestApplication();
    server = app.getHttpServer();
    await app.init();
  });

  it(`should`, () => {
    expect(true);
  });

  afterEach(async () => {
    await app.close();
  });
});
