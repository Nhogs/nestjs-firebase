import { Module } from "@nestjs/common";
import { FirebaseModule } from "../../lib";
import { CatsModule } from "./cats/cats.module";

@Module({
  imports: [
    FirebaseModule.forRoot({
      apiKey: "API-KEY-FOR-TEST",
      projectId: "demo-nhogs-nestjs-firebase",
      emulator: true,
    }),
    CatsModule,
  ],
})
export class AppModule {}
