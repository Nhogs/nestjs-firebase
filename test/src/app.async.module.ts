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
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
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
      global: true,
    }),
    CatsModule,
    ConfigModule.forRoot({
      envFilePath: "./test/src/.test.env",
    }),
  ],
})
export class AppAsyncModule {}
