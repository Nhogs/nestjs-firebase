import { Module } from "@nestjs/common";
import { FirebaseConfig, FirebaseModule } from "../../lib";
import { ConfigModule } from "@nestjs/config";
import { CatsModule } from "./cats/cats.module";

@Module({
  imports: [
    FirebaseModule.forRootAsync({
      useFactory: (): FirebaseConfig => ({
        apiKey: process.env.FIREBASE_APIKEY,
        projectId: process.env.FIREBASE_PROJECT_ID,
        emulator: process.env.FIREBASE_EMULATOR === "true",
      }),
      global: true,
    }),
    CatsModule,
    ConfigModule.forRoot({
      envFilePath: "./test/src/.test.env",
    }),
  ],
})
export class AppAsyncModule {}
