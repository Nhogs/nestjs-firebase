import { Module } from "@nestjs/common";
import { FirebaseModule } from "../../lib";
import { CatsModule } from "./cats/cats.module";

@Module({
  imports: [
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
    CatsModule,
  ],
})
export class AppModule {}
